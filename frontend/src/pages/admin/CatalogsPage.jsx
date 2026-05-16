import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Plus, Loader2, FileText, ShieldCheck } from 'lucide-react'
import * as catalogApi from '../../api/catalogApi'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table'

const inputCls = 'flex h-9 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50'

// ── Document Type dialog ──────────────────────────────────────────────────────
function DocTypeDialog({ open, onOpenChange, onSuccess }) {
  const [form, setForm] = useState({ name: '', validityDays: '', requiresExpiryDate: false })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) setForm({ name: '', validityDays: '', requiresExpiryDate: false })
  }, [open])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await catalogApi.createDocumentType({
        name: form.name,
        validityDays: form.validityDays ? Number(form.validityDays) : null,
        requiresExpiryDate: form.requiresExpiryDate,
      })
      onSuccess(); onOpenChange(false)
    } catch (err) { toast.error(err.response?.data?.message ?? 'Error al crear') }
    finally { setSaving(false) }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>Nuevo tipo de documento</DialogTitle></DialogHeader>
        <form id="dtf" onSubmit={handleSubmit} className="grid gap-4 py-2">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Nombre</label>
            <input className={inputCls} required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Ej: Certificado médico" />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Días de validez (opcional)</label>
            <input type="number" min={1} className={inputCls} value={form.validityDays} onChange={(e) => setForm((f) => ({ ...f, validityDays: e.target.value }))} placeholder="365" />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.requiresExpiryDate} onChange={(e) => setForm((f) => ({ ...f, requiresExpiryDate: e.target.checked }))} className="rounded border-input" />
            Requiere fecha de caducidad
          </label>
        </form>
        <DialogFooter>
          <button type="button" onClick={() => onOpenChange(false)} className="inline-flex h-9 items-center rounded-lg border border-input px-4 text-sm hover:bg-accent">Cancelar</button>
          <button type="submit" form="dtf" disabled={saving} className="inline-flex h-9 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
            {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}Guardar
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ── EPI catalog dialog ────────────────────────────────────────────────────────
function EpiDialog({ open, onOpenChange, onSuccess }) {
  const [form, setForm] = useState({ name: '', referenceCode: '', description: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) setForm({ name: '', referenceCode: '', description: '' })
  }, [open])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await catalogApi.createEpiCatalog({ name: form.name, referenceCode: form.referenceCode || null, description: form.description || null })
      onSuccess(); onOpenChange(false)
    } catch (err) { toast.error(err.response?.data?.message ?? 'Error al crear') }
    finally { setSaving(false) }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>Nuevo EPI</DialogTitle></DialogHeader>
        <form id="ef" onSubmit={handleSubmit} className="grid gap-4 py-2">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Nombre</label>
            <input className={inputCls} required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Ej: Casco de protección" />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Código de referencia (opcional)</label>
            <input className={inputCls} value={form.referenceCode} onChange={(e) => setForm((f) => ({ ...f, referenceCode: e.target.value }))} placeholder="Ej: EPI-001" />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Descripción (opcional)</label>
            <textarea className="flex min-h-[70px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="Descripción del EPI..." />
          </div>
        </form>
        <DialogFooter>
          <button type="button" onClick={() => onOpenChange(false)} className="inline-flex h-9 items-center rounded-lg border border-input px-4 text-sm hover:bg-accent">Cancelar</button>
          <button type="submit" form="ef" disabled={saving} className="inline-flex h-9 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
            {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}Guardar
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function CatalogsPage() {
  const [activeTab, setActiveTab] = useState('docs')
  const [docTypes, setDocTypes] = useState([])
  const [epiCatalog, setEpiCatalog] = useState([])
  const [loading, setLoading] = useState(true)
  const [docDialogOpen, setDocDialogOpen] = useState(false)
  const [epiDialogOpen, setEpiDialogOpen] = useState(false)

  const load = async () => {
    try {
      const [d, e] = await Promise.all([catalogApi.getAllDocumentTypes(), catalogApi.getAllEpiCatalog()])
      setDocTypes(d); setEpiCatalog(e)
    } catch { toast.error('Error al cargar los catálogos') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const tabCls = (t) =>
    `px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === t ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Catálogos</h1>
        <p className="text-sm text-muted-foreground">Gestiona los tipos de documento y el catálogo de EPIs</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-border">
        <div className="flex gap-0">
          <button className={tabCls('docs')} onClick={() => setActiveTab('docs')}>
            <span className="flex items-center gap-2"><FileText className="h-4 w-4" />Tipos de Documento ({docTypes.length})</span>
          </button>
          <button className={tabCls('epis')} onClick={() => setActiveTab('epis')}>
            <span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4" />Catálogo de EPIs ({epiCatalog.length})</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex h-48 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : (
        <>
          {/* Documents tab */}
          {activeTab === 'docs' && (
            <div className="space-y-4">
              <div className="flex justify-end">
                <button onClick={() => setDocDialogOpen(true)} className="inline-flex h-9 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90">
                  <Plus className="h-4 w-4" />Nuevo tipo de documento
                </button>
              </div>
              <div className="rounded-2xl border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Validez</TableHead>
                      <TableHead>Requiere caducidad</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {docTypes.length === 0 ? (
                      <TableRow><TableCell colSpan={3} className="h-20 text-center text-muted-foreground">No hay tipos de documento.</TableCell></TableRow>
                    ) : docTypes.map((d) => (
                      <TableRow key={d.id}>
                        <TableCell className="font-medium">{d.name}</TableCell>
                        <TableCell className="text-muted-foreground">{d.validityDays ? `${d.validityDays} días` : 'Sin caducidad'}</TableCell>
                        <TableCell>
                          <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${d.requiresExpiryDate ? 'bg-amber-100 text-amber-700' : 'bg-secondary text-secondary-foreground'}`}>
                            {d.requiresExpiryDate ? 'Sí' : 'No'}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {/* EPIs tab */}
          {activeTab === 'epis' && (
            <div className="space-y-4">
              <div className="flex justify-end">
                <button onClick={() => setEpiDialogOpen(true)} className="inline-flex h-9 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90">
                  <Plus className="h-4 w-4" />Nuevo EPI
                </button>
              </div>
              <div className="rounded-2xl border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Código referencia</TableHead>
                      <TableHead>Descripción</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {epiCatalog.length === 0 ? (
                      <TableRow><TableCell colSpan={3} className="h-20 text-center text-muted-foreground">No hay EPIs en el catálogo.</TableCell></TableRow>
                    ) : epiCatalog.map((e) => (
                      <TableRow key={e.id}>
                        <TableCell className="font-medium">{e.name}</TableCell>
                        <TableCell className="text-muted-foreground">{e.referenceCode ?? '—'}</TableCell>
                        <TableCell className="max-w-xs truncate text-muted-foreground">{e.description ?? '—'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </>
      )}

      <DocTypeDialog open={docDialogOpen} onOpenChange={setDocDialogOpen} onSuccess={load} />
      <EpiDialog open={epiDialogOpen} onOpenChange={setEpiDialogOpen} onSuccess={load} />
    </div>
  )
}
