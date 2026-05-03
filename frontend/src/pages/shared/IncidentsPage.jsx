import { useEffect, useState, useMemo } from 'react'
import { toast } from 'sonner'
import { Plus, Loader2 } from 'lucide-react'
import * as incidentApi from '../../api/incidentApi'
import * as userApi from '../../api/userApi'
import { useAuth } from '../../context/AuthContext'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table'
import { formatDate } from '@/lib/utils'

// ── Shared style helpers ───────────────────────────────────────────────────────
const inputCls = 'flex h-9 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50'
const textareaCls = 'flex min-h-[80px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'

const SEV_BADGE = {
  LOW:      'bg-secondary text-secondary-foreground',
  MEDIUM:   'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  HIGH:     'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
  CRITICAL: 'bg-destructive/10 text-destructive',
}
const STATUS_BADGE = {
  OPEN:        'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  IN_PROGRESS: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  RESOLVED:    'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  CLOSED:      'bg-secondary text-secondary-foreground',
}
const SEV_LABEL  = { LOW: 'Baja', MEDIUM: 'Media', HIGH: 'Alta', CRITICAL: 'Crítica' }
const STATUS_LABEL = { OPEN: 'Abierta', IN_PROGRESS: 'En progreso', RESOLVED: 'Resuelta', CLOSED: 'Cerrada' }
const TYPE_LABEL  = { SAFETY_RISK: 'Riesgo', ACCIDENT: 'Accidente', NEAR_MISS: 'Casi-accidente', EQUIPMENT_FAULT: 'Fallo equipo', OTHER: 'Otro' }

function SevBadge({ sev }) {
  return <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${SEV_BADGE[sev] ?? ''}`}>{SEV_LABEL[sev] ?? sev}</span>
}
function StatusBadge({ status }) {
  return <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_BADGE[status] ?? ''}`}>{STATUS_LABEL[status] ?? status}</span>
}
function Field({ label, children }) {
  return <div className="space-y-1.5"><label className="text-sm font-medium leading-none">{label}</label>{children}</div>
}

// ── Create incident dialog ─────────────────────────────────────────────────────
const EMPTY_INC = { title: '', description: '', type: 'SAFETY_RISK', severity: 'LOW', location: '' }

function CreateIncidentDialog({ open, onOpenChange, onSuccess }) {
  const [form, setForm] = useState(EMPTY_INC)
  const [saving, setSaving] = useState(false)
  useEffect(() => { if (open) setForm(EMPTY_INC) }, [open])
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))
  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      await incidentApi.create(form)
      toast.success('Incidencia reportada')
      onSuccess(); onOpenChange(false)
    } catch (err) { toast.error(err.response?.data?.message ?? 'Error al reportar') }
    finally { setSaving(false) }
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader><DialogTitle>Reportar incidencia</DialogTitle></DialogHeader>
        <form id="cif" onSubmit={handleSubmit} className="grid gap-4 py-2">
          <Field label="Título"><input className={inputCls} required value={form.title} onChange={set('title')} placeholder="Descripción breve" /></Field>
          <Field label="Descripción"><textarea className={textareaCls} required value={form.description} onChange={set('description')} placeholder="Detalla lo ocurrido..." /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Tipo">
              <select className={inputCls} value={form.type} onChange={set('type')}>
                <option value="SAFETY_RISK">Riesgo de seguridad</option>
                <option value="ACCIDENT">Accidente</option>
                <option value="NEAR_MISS">Casi-accidente</option>
                <option value="EQUIPMENT_FAULT">Fallo de equipo</option>
                <option value="OTHER">Otro</option>
              </select>
            </Field>
            <Field label="Severidad">
              <select className={inputCls} value={form.severity} onChange={set('severity')}>
                <option value="LOW">Baja</option>
                <option value="MEDIUM">Media</option>
                <option value="HIGH">Alta</option>
                <option value="CRITICAL">Crítica</option>
              </select>
            </Field>
          </div>
          <Field label="Ubicación"><input className={inputCls} required value={form.location} onChange={set('location')} placeholder="Nave 3, Almacén..." /></Field>
        </form>
        <DialogFooter>
          <button type="button" onClick={() => onOpenChange(false)} className="inline-flex h-9 items-center rounded-lg border border-input px-4 text-sm hover:bg-accent">Cancelar</button>
          <button type="submit" form="cif" disabled={saving} className="inline-flex h-9 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
            {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}Reportar
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ── Detail dialog ─────────────────────────────────────────────────────────────
function DetailDialog({ open, onOpenChange, incident }) {
  if (!incident) return null
  const history = incident.statusHistory ?? []
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{incident.title}</DialogTitle></DialogHeader>
        <div className="space-y-4 text-sm">
          <div className="flex flex-wrap gap-2">
            <SevBadge sev={incident.severity} />
            <StatusBadge status={incident.status} />
            <span className="inline-flex rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">{TYPE_LABEL[incident.type] ?? incident.type}</span>
          </div>
          <div className="grid grid-cols-2 gap-3 text-muted-foreground">
            <div><p className="text-xs font-medium text-foreground">Reportado por</p><p>{incident.reportedByName ?? '—'}</p></div>
            <div><p className="text-xs font-medium text-foreground">Asignado a</p><p>{incident.assignedToName ?? 'Sin asignar'}</p></div>
            <div><p className="text-xs font-medium text-foreground">Ubicación</p><p>{incident.location ?? '—'}</p></div>
            <div><p className="text-xs font-medium text-foreground">Fecha</p><p>{formatDate(incident.createdAt)}</p></div>
          </div>
          {incident.description && (
            <div><p className="text-xs font-medium">Descripción</p><p className="text-muted-foreground">{incident.description}</p></div>
          )}
          {history.length > 0 && (
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Historial de cambios</p>
              <ol className="space-y-3">
                {history.map((h, i) => (
                  <li key={h.id ?? i} className="flex gap-3">
                    <div className="flex flex-col items-center gap-1">
                      <div className="h-2 w-2 rounded-full bg-primary mt-1.5 shrink-0" />
                      {i < history.length - 1 && <div className="w-px flex-1 bg-border" />}
                    </div>
                    <div className="pb-3 space-y-0.5">
                      <StatusBadge status={h.newStatus} />
                      {h.comment && <p className="text-muted-foreground">{h.comment}</p>}
                      <p className="text-xs text-muted-foreground">{h.changedByName ?? '—'} · {formatDate(h.changedAt)}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
        <DialogFooter>
          <button onClick={() => onOpenChange(false)} className="inline-flex h-9 items-center rounded-lg border border-input px-4 text-sm hover:bg-accent">Cerrar</button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ── Manage dialog (ADMIN/MANAGER) ─────────────────────────────────────────────
function ManageDialog({ open, onOpenChange, incident, managers, onSuccess }) {
  const [form, setForm] = useState({ newStatus: 'OPEN', assignedToId: '', comment: '' })
  const [saving, setSaving] = useState(false)
  useEffect(() => {
    if (open && incident) setForm({ newStatus: incident.status ?? 'OPEN', assignedToId: incident.assignedToId ?? '', comment: '' })
  }, [open, incident])
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))
  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      await incidentApi.updateStatus(incident.id, {
        newStatus: form.newStatus,
        assignedToId: form.assignedToId ? Number(form.assignedToId) : null,
        comment: form.comment || null,
      })
      toast.success('Estado actualizado')
      onSuccess(); onOpenChange(false)
    } catch (err) { toast.error(err.response?.data?.message ?? 'Error al actualizar') }
    finally { setSaving(false) }
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>Gestionar: {incident?.title}</DialogTitle></DialogHeader>
        <form id="mif" onSubmit={handleSubmit} className="grid gap-4 py-2">
          <Field label="Nuevo estado">
            <select className={inputCls} value={form.newStatus} onChange={set('newStatus')}>
              <option value="OPEN">Abierta</option>
              <option value="IN_PROGRESS">En progreso</option>
              <option value="RESOLVED">Resuelta</option>
              <option value="CLOSED">Cerrada</option>
            </select>
          </Field>
          <Field label="Asignar a (opcional)">
            <select className={inputCls} value={form.assignedToId} onChange={set('assignedToId')}>
              <option value="">Sin asignar</option>
              {managers.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </Field>
          <Field label="Comentario (opcional)">
            <textarea className={textareaCls} value={form.comment} onChange={set('comment')} placeholder="Motivo del cambio..." />
          </Field>
        </form>
        <DialogFooter>
          <button type="button" onClick={() => onOpenChange(false)} className="inline-flex h-9 items-center rounded-lg border border-input px-4 text-sm hover:bg-accent">Cancelar</button>
          <button type="submit" form="mif" disabled={saving} className="inline-flex h-9 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
            {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}Actualizar estado
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function IncidentsPage() {
  const { user } = useAuth()
  const isAdminOrManager = user?.role === 'ADMIN' || user?.role === 'MANAGER'

  const [incidents, setIncidents] = useState([])
  const [managers, setManagers] = useState([])
  const [loading, setLoading] = useState(true)

  const [statusFilter, setStatusFilter] = useState('ALL')
  const [sevFilter, setSevFilter] = useState('ALL')

  const [createOpen, setCreateOpen] = useState(false)
  const [detailInc, setDetailInc] = useState(null)
  const [manageInc, setManageInc] = useState(null)

  const load = async () => {
    try {
      const [inc, users] = await Promise.all([incidentApi.getAll(), userApi.getAll()])
      setIncidents(inc)
      setManagers(users.filter((u) => u.role === 'MANAGER'))
    } catch { toast.error('Error al cargar incidencias') }
    finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  const filtered = useMemo(() => incidents.filter((i) =>
    (statusFilter === 'ALL' || i.status === statusFilter) &&
    (sevFilter === 'ALL' || i.severity === sevFilter)
  ), [incidents, statusFilter, sevFilter])

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Incidencias</h1>
          <p className="text-sm text-muted-foreground">{incidents.length} incidencias registradas</p>
        </div>
        <button onClick={() => setCreateOpen(true)} className="inline-flex h-9 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          <Plus className="h-4 w-4" />Reportar incidencia
        </button>
      </div>

      {isAdminOrManager && (
        <div className="flex flex-wrap gap-3">
          <select className="h-9 rounded-lg border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="ALL">Todos los estados</option>
            <option value="OPEN">Abierta</option>
            <option value="IN_PROGRESS">En progreso</option>
            <option value="RESOLVED">Resuelta</option>
            <option value="CLOSED">Cerrada</option>
          </select>
          <select className="h-9 rounded-lg border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" value={sevFilter} onChange={(e) => setSevFilter(e.target.value)}>
            <option value="ALL">Todas las severidades</option>
            <option value="LOW">Baja</option>
            <option value="MEDIUM">Media</option>
            <option value="HIGH">Alta</option>
            <option value="CRITICAL">Crítica</option>
          </select>
        </div>
      )}

      {loading ? (
        <div className="flex h-48 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : (
        <div className="rounded-2xl border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Severidad</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Ubicación</TableHead>
                <TableHead>Reportado por</TableHead>
                <TableHead>Asignado a</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow><TableCell colSpan={9} className="h-24 text-center text-muted-foreground">No hay incidencias.</TableCell></TableRow>
              ) : filtered.map((inc) => (
                <TableRow key={inc.id}>
                  <TableCell className="font-medium max-w-[160px] truncate">{inc.title}</TableCell>
                  <TableCell className="text-muted-foreground text-xs">{TYPE_LABEL[inc.type] ?? inc.type}</TableCell>
                  <TableCell><SevBadge sev={inc.severity} /></TableCell>
                  <TableCell><StatusBadge status={inc.status} /></TableCell>
                  <TableCell className="text-muted-foreground text-xs">{inc.location ?? '—'}</TableCell>
                  <TableCell className="text-muted-foreground text-xs">{inc.reportedByName ?? '—'}</TableCell>
                  <TableCell className="text-muted-foreground text-xs">{inc.assignedToName ?? '—'}</TableCell>
                  <TableCell className="text-muted-foreground text-xs">{formatDate(inc.createdAt)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => setDetailInc(inc)} className="inline-flex h-8 items-center rounded-lg border border-input px-3 text-xs hover:bg-accent">Ver</button>
                      {isAdminOrManager && (
                        <button onClick={() => setManageInc(inc)} className="inline-flex h-8 items-center rounded-lg bg-primary/10 px-3 text-xs font-medium text-primary hover:bg-primary/20">Gestionar</button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <CreateIncidentDialog open={createOpen} onOpenChange={setCreateOpen} onSuccess={load} />
      <DetailDialog open={!!detailInc} onOpenChange={(v) => !v && setDetailInc(null)} incident={detailInc} />
      <ManageDialog open={!!manageInc} onOpenChange={(v) => !v && setManageInc(null)} incident={manageInc} managers={managers} onSuccess={load} />
    </div>
  )
}
