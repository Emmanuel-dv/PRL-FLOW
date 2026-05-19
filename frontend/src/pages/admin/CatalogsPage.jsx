import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Plus, Loader2, FileText, ShieldCheck, Pencil, Trash2 } from 'lucide-react'
import * as catalogApi from '../../api/catalogApi'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table'

const inputCls = 'flex h-9 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50'

// ── Confirm delete dialog ─────────────────────────────────────────────────────
function ConfirmDialog({ open, onOpenChange, message, onConfirm, loading }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader><DialogTitle>Confirmar eliminación</DialogTitle></DialogHeader>
        <p className="text-sm text-muted-foreground py-2">{message}</p>
        <DialogFooter>
          <button type="button" onClick={() => onOpenChange(false)} className="inline-flex h-9 items-center rounded-lg border border-input px-4 text-sm hover:bg-accent">
            Cancelar
          </button>
          <button type="button" onClick={onConfirm} disabled={loading} className="inline-flex h-9 items-center gap-2 rounded-lg bg-destructive px-4 text-sm font-medium text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50">
            {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}Eliminar
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ── Document Type dialog (create & edit) ─────────────────────────────────────
function DocTypeDialog({ open, onOpenChange, onSuccess, editItem }) {
  const isEdit = Boolean(editItem)
  const [form, setForm] = useState({ name: '', validityDays: '', requiresExpiry: false })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) {
      setForm(isEdit
        ? { name: editItem.name, validityDays: editItem.validityDays ?? '', requiresExpiry: editItem.requiresExpiry }
        : { name: '', validityDays: '', requiresExpiry: false }
      )
    }
  }, [open, editItem])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = {
        name: form.name,
        validityDays: form.validityDays ? Number(form.validityDays) : null,
        requiresExpiry: form.requiresExpiry,
      }
      if (isEdit) {
        await catalogApi.updateDocumentType(editItem.id, payload)
        toast.success('Tipo de documento actualizado')
      } else {
        await catalogApi.createDocumentType(payload)
        toast.success('Tipo de documento creado')
      }
      onSuccess(); onOpenChange(false)
    } catch (err) { toast.error(err.response?.data?.message ?? (isEdit ? 'Error al actualizar' : 'Error al crear')) }
    finally { setSaving(false) }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>{isEdit ? 'Editar tipo de documento' : 'Nuevo tipo de documento'}</DialogTitle></DialogHeader>
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
            <input type="checkbox" checked={form.requiresExpiry} onChange={(e) => setForm((f) => ({ ...f, requiresExpiry: e.target.checked }))} className="rounded border-input" />
            Requiere fecha de caducidad
          </label>
        </form>
        <DialogFooter>
          <button type="button" onClick={() => onOpenChange(false)} className="inline-flex h-9 items-center rounded-lg border border-input px-4 text-sm hover:bg-accent">Cancelar</button>
          <button type="submit" form="dtf" disabled={saving} className="inline-flex h-9 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
            {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}{isEdit ? 'Guardar cambios' : 'Guardar'}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ── EPI catalog dialog (create & edit) ───────────────────────────────────────
function EpiDialog({ open, onOpenChange, onSuccess, editItem }) {
  const isEdit = Boolean(editItem)
  const [form, setForm] = useState({ name: '', referenceCode: '', description: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) {
      setForm(isEdit
        ? { name: editItem.name, referenceCode: editItem.referenceCode ?? '', description: editItem.description ?? '' }
        : { name: '', referenceCode: '', description: '' }
      )
    }
  }, [open, editItem])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = { name: form.name, referenceCode: form.referenceCode || null, description: form.description || null }
      if (isEdit) {
        await catalogApi.updateEpiCatalog(editItem.id, payload)
        toast.success('EPI actualizado')
      } else {
        await catalogApi.createEpiCatalog(payload)
        toast.success('EPI creado')
      }
      onSuccess(); onOpenChange(false)
    } catch (err) { toast.error(err.response?.data?.message ?? (isEdit ? 'Error al actualizar' : 'Error al crear')) }
    finally { setSaving(false) }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>{isEdit ? 'Editar EPI' : 'Nuevo EPI'}</DialogTitle></DialogHeader>
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
            {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}{isEdit ? 'Guardar cambios' : 'Guardar'}
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

  // Doc type dialogs
  const [docDialogOpen, setDocDialogOpen] = useState(false)
  const [editDoc, setEditDoc] = useState(null)
  const [deleteDoc, setDeleteDoc] = useState(null)
  const [deletingDoc, setDeletingDoc] = useState(false)

  // EPI dialogs
  const [epiDialogOpen, setEpiDialogOpen] = useState(false)
  const [editEpi, setEditEpi] = useState(null)
  const [deleteEpi, setDeleteEpi] = useState(null)
  const [deletingEpi, setDeletingEpi] = useState(false)

  const load = async () => {
    try {
      const [d, e] = await Promise.all([catalogApi.getAllDocumentTypes(), catalogApi.getAllEpiCatalog()])
      setDocTypes(d); setEpiCatalog(e)
    } catch { toast.error('Error al cargar los catálogos') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  // ── Handlers ─────────────────────────────────────────────────────────────
  const openCreateDoc = () => { setEditDoc(null); setDocDialogOpen(true) }
  const openEditDoc = (doc) => { setEditDoc(doc); setDocDialogOpen(true) }
  const handleDeleteDoc = async () => {
    setDeletingDoc(true)
    try {
      await catalogApi.deleteDocumentType(deleteDoc.id)
      toast.success('Tipo de documento eliminado')
      setDeleteDoc(null)
      load()
    } catch (err) { toast.error(err.response?.data?.message ?? 'Error al eliminar') }
    finally { setDeletingDoc(false) }
  }

  const openCreateEpi = () => { setEditEpi(null); setEpiDialogOpen(true) }
  const openEditEpi = (epi) => { setEditEpi(epi); setEpiDialogOpen(true) }
  const handleDeleteEpi = async () => {
    setDeletingEpi(true)
    try {
      await catalogApi.deleteEpiCatalog(deleteEpi.id)
      toast.success('EPI eliminado')
      setDeleteEpi(null)
      load()
    } catch (err) { toast.error(err.response?.data?.message ?? 'Error al eliminar') }
    finally { setDeletingEpi(false) }
  }

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
                <button onClick={openCreateDoc} className="inline-flex h-9 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90">
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
                      <TableHead className="w-24 text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {docTypes.length === 0 ? (
                      <TableRow><TableCell colSpan={4} className="h-20 text-center text-muted-foreground">No hay tipos de documento.</TableCell></TableRow>
                    ) : docTypes.map((d) => (
                      <TableRow key={d.id}>
                        <TableCell className="font-medium">{d.name}</TableCell>
                        <TableCell className="text-muted-foreground">{d.validityDays ? `${d.validityDays} días` : 'Sin caducidad'}</TableCell>
                        <TableCell>
                          <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${d.requiresExpiry ? 'bg-amber-100 text-amber-700' : 'bg-secondary text-secondary-foreground'}`}>
                            {d.requiresExpiry ? 'Sí' : 'No'}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <button
                              onClick={() => openEditDoc(d)}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                              title="Editar"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => setDeleteDoc(d)}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                              title="Eliminar"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
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
                <button onClick={openCreateEpi} className="inline-flex h-9 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90">
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
                      <TableHead className="w-24 text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {epiCatalog.length === 0 ? (
                      <TableRow><TableCell colSpan={4} className="h-20 text-center text-muted-foreground">No hay EPIs en el catálogo.</TableCell></TableRow>
                    ) : epiCatalog.map((e) => (
                      <TableRow key={e.id}>
                        <TableCell className="font-medium">{e.name}</TableCell>
                        <TableCell className="text-muted-foreground">{e.referenceCode ?? '—'}</TableCell>
                        <TableCell className="max-w-xs truncate text-muted-foreground">{e.description ?? '—'}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <button
                              onClick={() => openEditEpi(e)}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                              title="Editar"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => setDeleteEpi(e)}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                              title="Eliminar"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </>
      )}

      {/* Dialogs — Document Types */}
      <DocTypeDialog
        open={docDialogOpen}
        onOpenChange={(v) => { setDocDialogOpen(v); if (!v) setEditDoc(null) }}
        onSuccess={load}
        editItem={editDoc}
      />
      <ConfirmDialog
        open={Boolean(deleteDoc)}
        onOpenChange={(v) => { if (!v) setDeleteDoc(null) }}
        message={`¿Seguro que quieres eliminar el tipo de documento "${deleteDoc?.name}"? Esta acción no se puede deshacer.`}
        onConfirm={handleDeleteDoc}
        loading={deletingDoc}
      />

      {/* Dialogs — EPI Catalog */}
      <EpiDialog
        open={epiDialogOpen}
        onOpenChange={(v) => { setEpiDialogOpen(v); if (!v) setEditEpi(null) }}
        onSuccess={load}
        editItem={editEpi}
      />
      <ConfirmDialog
        open={Boolean(deleteEpi)}
        onOpenChange={(v) => { if (!v) setDeleteEpi(null) }}
        message={`¿Seguro que quieres eliminar el EPI "${deleteEpi?.name}"? Esta acción no se puede deshacer.`}
        onConfirm={handleDeleteEpi}
        loading={deletingEpi}
      />
    </div>
  )
}
