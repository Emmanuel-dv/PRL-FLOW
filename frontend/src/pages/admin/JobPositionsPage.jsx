import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Plus, Settings2, Pencil, Trash2, Loader2, X, FileText, ShieldCheck } from 'lucide-react'
import * as jobPositionApi from '../../api/jobPositionApi'
import * as catalogApi from '../../api/catalogApi'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog'

const inputCls = 'flex h-9 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50'

// ── Job-position create/edit dialog ──────────────────────────────────────────
function PositionFormDialog({ open, onOpenChange, editItem, onSuccess }) {
  const [form, setForm] = useState({ name: '', description: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) setForm(editItem ? { name: editItem.name ?? '', description: editItem.description ?? '' } : { name: '', description: '' })
  }, [open, editItem])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (editItem) { await jobPositionApi.update(editItem.id, form); toast.success('Puesto actualizado') }
      else { await jobPositionApi.create(form); toast.success('Puesto creado') }
      onSuccess(); onOpenChange(false)
    } catch (err) { toast.error(err.response?.data?.message ?? 'Error al guardar') }
    finally { setSaving(false) }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>{editItem ? 'Editar puesto' : 'Nuevo puesto de trabajo'}</DialogTitle></DialogHeader>
        <form id="pf" onSubmit={handleSubmit} className="grid gap-4 py-2">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Nombre</label>
            <input className={inputCls} required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Ej: Operario de almacén" />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Descripción (opcional)</label>
            <textarea className="flex min-h-[80px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="Descripción del puesto..." />
          </div>
        </form>
        <DialogFooter>
          <button type="button" onClick={() => onOpenChange(false)} className="inline-flex h-9 items-center rounded-lg border border-input px-4 text-sm hover:bg-accent">Cancelar</button>
          <button type="submit" form="pf" disabled={saving} className="inline-flex h-9 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
            {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}Guardar
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ── Requirements panel dialog ─────────────────────────────────────────────────
function RequirementsDialog({ open, onOpenChange, position, docTypes, epiCatalog }) {
  const [docs, setDocs] = useState([])
  const [epis, setEpis] = useState([])
  const [loadingReqs, setLoadingReqs] = useState(false)

  const [newDocId, setNewDocId] = useState('')
  const [newDocMandatory, setNewDocMandatory] = useState(true)
  const [addingDoc, setAddingDoc] = useState(false)

  const [newEpiId, setNewEpiId] = useState('')
  const [newEpiQty, setNewEpiQty] = useState(1)
  const [addingEpi, setAddingEpi] = useState(false)

  useEffect(() => {
    if (open && position) {
      setLoadingReqs(true)
      Promise.all([
        jobPositionApi.getDocuments(position.id),
        jobPositionApi.getEpis(position.id),
      ])
        .then(([d, e]) => { setDocs(d); setEpis(e) })
        .catch(() => toast.error('Error al cargar requisitos'))
        .finally(() => setLoadingReqs(false))
    }
  }, [open, position])

  const handleAddDoc = async () => {
    if (!newDocId) return
    setAddingDoc(true)
    try {
      await jobPositionApi.assignDocument(position.id, { documentTypeId: Number(newDocId), mandatory: newDocMandatory })
      const d = await jobPositionApi.getDocuments(position.id)
      setDocs(d); setNewDocId(''); toast.success('Documento añadido')
    } catch (err) { toast.error(err.response?.data?.message ?? 'Error al añadir') }
    finally { setAddingDoc(false) }
  }

  const handleAddEpi = async () => {
    if (!newEpiId) return
    setAddingEpi(true)
    try {
      await jobPositionApi.assignEpi(position.id, { epiCatalogId: Number(newEpiId), quantityRequired: parseInt(newEpiQty, 10) })
      const e = await jobPositionApi.getEpis(position.id)
      setEpis(e); setNewEpiId(''); setNewEpiQty(1); toast.success('EPI añadido')
    } catch (err) { toast.error(err.response?.data?.message ?? 'Error al añadir') }
    finally { setAddingEpi(false) }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Requisitos: {position?.name}</DialogTitle>
        </DialogHeader>

        {loadingReqs ? (
          <div className="flex h-32 items-center justify-center"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Documents column */}
            <div className="space-y-4">
              <h3 className="flex items-center gap-2 text-sm font-semibold"><FileText className="h-4 w-4" />Documentos obligatorios</h3>
              <ul className="space-y-2">
                {docs.length === 0 && <li className="text-xs text-muted-foreground">Sin documentos asignados.</li>}
                {docs.map((d) => (
                  <li key={d.id} className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm">
                    <span>{d.documentTypeName ?? d.documentType?.name}</span>
                    <span className={`ml-2 shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${d.mandatory ? 'bg-blue-100 text-blue-700' : 'bg-secondary text-secondary-foreground'}`}>
                      {d.mandatory ? 'Obligatorio' : 'Opcional'}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="space-y-2 border-t border-border pt-3">
                <p className="text-xs font-medium text-muted-foreground">Añadir documento</p>
                <select className={inputCls} value={newDocId} onChange={(e) => setNewDocId(e.target.value)}>
                  <option value="">Selecciona un tipo...</option>
                  {docTypes.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={newDocMandatory} onChange={(e) => setNewDocMandatory(e.target.checked)} className="rounded border-input" />
                  ¿Es obligatorio?
                </label>
                <button onClick={handleAddDoc} disabled={!newDocId || addingDoc} className="inline-flex h-8 w-full items-center justify-center gap-1.5 rounded-lg bg-primary px-3 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
                  {addingDoc && <Loader2 className="h-3 w-3 animate-spin" />}<Plus className="h-3 w-3" />Añadir documento
                </button>
              </div>
            </div>

            {/* EPIs column */}
            <div className="space-y-4">
              <h3 className="flex items-center gap-2 text-sm font-semibold"><ShieldCheck className="h-4 w-4" />EPIs necesarios</h3>
              <ul className="space-y-2">
                {epis.length === 0 && <li className="text-xs text-muted-foreground">Sin EPIs asignados.</li>}
                {epis.map((e) => (
                  <li key={e.id} className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm">
                    <span>{e.epiName ?? e.epiCatalog?.name}</span>
                    <span className="ml-2 shrink-0 rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">{e.quantityRequired} ud.</span>
                  </li>
                ))}
              </ul>

              <div className="space-y-2 border-t border-border pt-3">
                <p className="text-xs font-medium text-muted-foreground">Añadir EPI</p>
                <select className={inputCls} value={newEpiId} onChange={(e) => setNewEpiId(e.target.value)}>
                  <option value="">Selecciona un EPI...</option>
                  {epiCatalog.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
                </select>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Cantidad requerida</label>
                  <input type="number" min={1} className={inputCls} value={newEpiQty} onChange={(e) => setNewEpiQty(Number(e.target.value))} />
                </div>
                <button onClick={handleAddEpi} disabled={!newEpiId || addingEpi} className="inline-flex h-8 w-full items-center justify-center gap-1.5 rounded-lg bg-primary px-3 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
                  {addingEpi && <Loader2 className="h-3 w-3 animate-spin" />}<Plus className="h-3 w-3" />Añadir EPI
                </button>
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          <button onClick={() => onOpenChange(false)} className="inline-flex h-9 items-center rounded-lg border border-input px-4 text-sm hover:bg-accent">Cerrar</button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function JobPositionsPage() {
  const [positions, setPositions] = useState([])
  const [docTypes, setDocTypes] = useState([])
  const [epiCatalog, setEpiCatalog] = useState([])
  const [loading, setLoading] = useState(true)

  const [createOpen, setCreateOpen] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [reqPosition, setReqPosition] = useState(null)

  const load = async () => {
    try {
      const [p, d, e] = await Promise.all([
        jobPositionApi.getAll(),
        catalogApi.getAllDocumentTypes(),
        catalogApi.getAllEpiCatalog(),
      ])
      setPositions(p); setDocTypes(d); setEpiCatalog(e)
    } catch { toast.error('Error al cargar los datos') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const handleDeactivate = async (p) => {
    try {
      await jobPositionApi.deactivate(p.id)
      toast.success('Puesto desactivado')
      load()
    } catch (err) { toast.error(err.response?.data?.message ?? 'Error al desactivar') }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Puestos de Trabajo</h1>
          <p className="text-sm text-muted-foreground">{positions.length} puestos configurados</p>
        </div>
        <button onClick={() => setCreateOpen(true)} className="inline-flex h-9 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          <Plus className="h-4 w-4" />Nuevo Puesto
        </button>
      </div>

      {loading ? (
        <div className="flex h-48 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : positions.length === 0 ? (
        <div className="flex h-48 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border text-muted-foreground">
          <Settings2 className="h-8 w-8" />
          <p className="text-sm">No hay puestos de trabajo. Crea el primero.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {positions.map((p) => (
            <div key={p.id} className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold leading-tight">{p.name}</h3>
                <div className="flex shrink-0 gap-1.5">
                  <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                    <FileText className="h-3 w-3" />{p.documentCount ?? 0}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                    <ShieldCheck className="h-3 w-3" />{p.epiCount ?? 0}
                  </span>
                </div>
              </div>
              {p.description && <p className="line-clamp-2 text-xs text-muted-foreground">{p.description}</p>}
              <div className="flex flex-wrap gap-2 pt-1 border-t border-border">
                <button onClick={() => setReqPosition(p)} className="inline-flex h-8 flex-1 items-center justify-center gap-1.5 rounded-lg bg-primary/10 px-3 text-xs font-medium text-primary hover:bg-primary/20">
                  <Settings2 className="h-3.5 w-3.5" />Configurar requisitos
                </button>
                <button onClick={() => setEditItem(p)} className="inline-flex h-8 items-center gap-1 rounded-lg border border-input px-2.5 text-xs hover:bg-accent">
                  <Pencil className="h-3 w-3" />Editar
                </button>
                <button onClick={() => handleDeactivate(p)} className="inline-flex h-8 items-center gap-1 rounded-lg border border-destructive/30 px-2.5 text-xs text-destructive hover:bg-destructive/10">
                  <X className="h-3 w-3" />Desactivar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <PositionFormDialog open={createOpen} onOpenChange={setCreateOpen} editItem={null} onSuccess={load} />
      <PositionFormDialog open={!!editItem} onOpenChange={(v) => !v && setEditItem(null)} editItem={editItem} onSuccess={load} />
      <RequirementsDialog open={!!reqPosition} onOpenChange={(v) => !v && setReqPosition(null)} position={reqPosition} docTypes={docTypes} epiCatalog={epiCatalog} />
    </div>
  )
}
