import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Plus, Upload, Loader2, ExternalLink, AlertCircle, CheckCircle2 } from 'lucide-react'
import * as workerDocumentApi from '../../api/workerDocumentApi'
import * as catalogApi from '../../api/catalogApi'
import { useAuth } from '../../context/AuthContext'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog'
import { Skeleton } from '../../components/ui/skeleton'

const inputCls = 'flex h-9 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50'

const STATUS_CONFIG = {
  PENDING_REVIEW: { label: 'En revisión',  cls: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' },
  APPROVED:       { label: 'Aprobado',     cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' },
  REJECTED:       { label: 'Rechazado',    cls: 'bg-destructive/10 text-destructive' },
  EXPIRED:        { label: 'Caducado',     cls: 'bg-rose-200 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300' },
}
function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] ?? { label: status, cls: 'bg-secondary text-secondary-foreground' }
  return <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${cfg.cls}`}>{cfg.label}</span>
}
function fmt(d) { if (!d) return null; return new Date(d).toLocaleDateString('es-ES') }

// ── Upload dialog ─────────────────────────────────────────────────────────────
function UploadDialog({ open, onOpenChange, docTypes, onSuccess }) {
  const [docTypeId, setDocTypeId] = useState('')
  const [issueDate, setIssueDate] = useState('')
  const [expiryDate, setExpiryDate] = useState('')
  const [file, setFile] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) { setDocTypeId(''); setIssueDate(''); setExpiryDate(''); setFile(null) }
  }, [open])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!file) { toast.error('Selecciona un fichero'); return }
    setSaving(true)
    try {
      const formData = new FormData()
      formData.append('data', new Blob([JSON.stringify({
        documentTypeId: Number(docTypeId),
        issueDate: issueDate || null,
        expiryDate: expiryDate || null,
      })], { type: 'application/json' }))
      formData.append('file', file)
      await workerDocumentApi.upload(formData)
      toast.success('Documento subido correctamente')
      onSuccess(); onOpenChange(false)
    } catch (err) { toast.error(err.response?.data?.message ?? 'Error al subir') }
    finally { setSaving(false) }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>Subir documento</DialogTitle></DialogHeader>
        <form id="udf" onSubmit={handleSubmit} className="grid gap-4 py-2">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Tipo de documento</label>
            <select className={inputCls} required value={docTypeId} onChange={(e) => setDocTypeId(e.target.value)}>
              <option value="">Selecciona un tipo...</option>
              {docTypes.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Fecha de emisión</label>
              <input type="date" className={inputCls} value={issueDate} onChange={(e) => setIssueDate(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Fecha de caducidad</label>
              <input type="date" className={inputCls} value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Fichero (PDF o imagen)</label>
            <label className="flex flex-col items-center gap-2 rounded-lg border-2 border-dashed border-input bg-background p-4 cursor-pointer hover:bg-accent transition-colors">
              <Upload className="h-6 w-6 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">{file ? file.name : 'Haz clic para seleccionar un archivo'}</span>
              <input type="file" accept="application/pdf,image/*" className="hidden" onChange={(e) => setFile(e.target.files[0] ?? null)} />
            </label>
          </div>
        </form>
        <DialogFooter>
          <button type="button" onClick={() => onOpenChange(false)} className="inline-flex h-9 items-center rounded-lg border border-input px-4 text-sm hover:bg-accent">Cancelar</button>
          <button type="submit" form="udf" disabled={saving} className="inline-flex h-9 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
            {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}Subir
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ── Compliance panel ─────────────────────────────────────────────────────────
function CompliancePanel({ userId }) {
  const [compliance, setCompliance] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) return
    workerDocumentApi.getCompliance(userId)
      .then(setCompliance)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [userId])

  if (loading) return <Skeleton className="h-20 rounded-2xl" />
  if (!compliance) return null

  const pct = compliance.totalRequired > 0
    ? Math.round((compliance.totalApproved / compliance.totalRequired) * 100)
    : 0

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold">Estado de cumplimiento</p>
        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${compliance.compliant ? 'bg-emerald-100 text-emerald-700' : 'bg-destructive/10 text-destructive'}`}>
          {compliance.compliant ? '✓ Documentación al día' : '✗ Documentación incompleta'}
        </span>
      </div>
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{compliance.totalApproved} de {compliance.totalRequired} documentos obligatorios en regla</span>
          <span className="font-medium">{pct}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={`h-full rounded-full transition-all ${compliance.compliant ? 'bg-emerald-500' : 'bg-amber-500'}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function MyDocumentsPage() {
  const { user } = useAuth()
  const [docs, setDocs] = useState([])
  const [docTypes, setDocTypes] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploadOpen, setUploadOpen] = useState(false)
  const [reuploadDoc, setReuploadDoc] = useState(null)

  const load = async () => {
    try {
      const [d, t] = await Promise.all([workerDocumentApi.getMy(), catalogApi.getAllDocumentTypes()])
      setDocs(d); setDocTypes(t)
    } catch { toast.error('Error al cargar documentos') }
    finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Mis Documentos</h1>
          <p className="text-sm text-muted-foreground">{docs.length} documentos subidos</p>
        </div>
        <button onClick={() => setUploadOpen(true)} className="inline-flex h-9 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          <Plus className="h-4 w-4" />Subir documento
        </button>
      </div>

      {user?.id && <CompliancePanel userId={user.id} />}

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-36 rounded-2xl" />)}
        </div>
      ) : docs.length === 0 ? (
        <div className="flex h-40 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border text-muted-foreground">
          <Upload className="h-8 w-8" />
          <p className="text-sm">No has subido ningún documento aún.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {docs.map((doc) => (
            <div key={doc.id} className={`flex flex-col gap-3 rounded-2xl border bg-card p-4 shadow-sm ${doc.status === 'REJECTED' || doc.status === 'EXPIRED' ? 'border-destructive/30' : 'border-border'}`}>
              <div className="flex items-start justify-between gap-2">
                <p className="font-medium leading-tight">{doc.documentTypeName ?? '—'}</p>
                <StatusBadge status={doc.status} />
              </div>

              {doc.expiryDate && (
                <p className={`text-xs ${doc.expiringSoon ? 'text-orange-600 font-semibold' : 'text-muted-foreground'}`}>
                  {doc.expiringSoon && '⚠ '}Caduca: {fmt(doc.expiryDate)}
                  {doc.expiringSoon && ' — ¡Caduca pronto!'}
                </p>
              )}

              {doc.status === 'REJECTED' && doc.reviewComment && (
                <div className="flex items-start gap-1.5 rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                  <span>{doc.reviewComment}</span>
                </div>
              )}

              <div className="flex gap-2 pt-1 border-t border-border">
                {(doc.status === 'REJECTED' || doc.status === 'EXPIRED') && (
                  <button
                    onClick={() => { setReuploadDoc(doc); setUploadOpen(true) }}
                    className="inline-flex h-8 flex-1 items-center justify-center gap-1.5 rounded-lg bg-primary px-3 text-xs font-medium text-primary-foreground hover:bg-primary/90"
                  >
                    <Upload className="h-3 w-3" />Volver a subir
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <UploadDialog
        open={uploadOpen}
        onOpenChange={(v) => { setUploadOpen(v); if (!v) setReuploadDoc(null) }}
        docTypes={docTypes}
        onSuccess={load}
      />
    </div>
  )
}
