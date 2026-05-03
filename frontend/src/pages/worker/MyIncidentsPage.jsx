import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Plus, Loader2, AlertTriangle } from 'lucide-react'
import * as incidentApi from '../../api/incidentApi'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog'
import { formatDate } from '@/lib/utils'

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
const SEV_LABEL    = { LOW: 'Baja', MEDIUM: 'Media', HIGH: 'Alta', CRITICAL: 'Crítica' }
const STATUS_LABEL = { OPEN: 'Abierta', IN_PROGRESS: 'En progreso', RESOLVED: 'Resuelta', CLOSED: 'Cerrada' }
const TYPE_LABEL   = { SAFETY_RISK: 'Riesgo', ACCIDENT: 'Accidente', NEAR_MISS: 'Casi-accidente', EQUIPMENT_FAULT: 'Fallo equipo', OTHER: 'Otro' }

function SevBadge({ sev }) {
  return <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${SEV_BADGE[sev] ?? ''}`}>{SEV_LABEL[sev] ?? sev}</span>
}
function StatusBadge({ status }) {
  return <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_BADGE[status] ?? ''}`}>{STATUS_LABEL[status] ?? status}</span>
}

// ── Create dialog ─────────────────────────────────────────────────────────────
const EMPTY = { title: '', description: '', type: 'SAFETY_RISK', severity: 'LOW', location: '' }

function CreateIncidentDialog({ open, onOpenChange, onSuccess }) {
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  useEffect(() => { if (open) setForm(EMPTY) }, [open])
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
        <form id="mcif" onSubmit={handleSubmit} className="grid gap-4 py-2">
          <div className="space-y-1.5"><label className="text-sm font-medium">Título</label><input className={inputCls} required value={form.title} onChange={set('title')} placeholder="Descripción breve" /></div>
          <div className="space-y-1.5"><label className="text-sm font-medium">Descripción</label><textarea className={textareaCls} required value={form.description} onChange={set('description')} placeholder="Detalla lo ocurrido..." /></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Tipo</label>
              <select className={inputCls} value={form.type} onChange={set('type')}>
                <option value="SAFETY_RISK">Riesgo de seguridad</option>
                <option value="ACCIDENT">Accidente</option>
                <option value="NEAR_MISS">Casi-accidente</option>
                <option value="EQUIPMENT_FAULT">Fallo de equipo</option>
                <option value="OTHER">Otro</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Severidad</label>
              <select className={inputCls} value={form.severity} onChange={set('severity')}>
                <option value="LOW">Baja</option>
                <option value="MEDIUM">Media</option>
                <option value="HIGH">Alta</option>
                <option value="CRITICAL">Crítica</option>
              </select>
            </div>
          </div>
          <div className="space-y-1.5"><label className="text-sm font-medium">Ubicación</label><input className={inputCls} required value={form.location} onChange={set('location')} placeholder="Nave 3, Almacén..." /></div>
        </form>
        <DialogFooter>
          <button type="button" onClick={() => onOpenChange(false)} className="inline-flex h-9 items-center rounded-lg border border-input px-4 text-sm hover:bg-accent">Cancelar</button>
          <button type="submit" form="mcif" disabled={saving} className="inline-flex h-9 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
            {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}Reportar
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ── History dialog ────────────────────────────────────────────────────────────
function HistoryDialog({ open, onOpenChange, incident }) {
  if (!incident) return null
  const history = incident.statusHistory ?? []
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Historial: {incident.title}</DialogTitle></DialogHeader>
        <div className="space-y-2">
          <div className="flex gap-2 flex-wrap">
            <SevBadge sev={incident.severity} />
            <StatusBadge status={incident.status} />
          </div>
          {history.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">Sin historial de cambios.</p>
          ) : (
            <ol className="space-y-3 pt-2">
              {history.map((h, i) => (
                <li key={h.id ?? i} className="flex gap-3">
                  <div className="flex flex-col items-center gap-1">
                    <div className="h-2 w-2 rounded-full bg-primary mt-1.5 shrink-0" />
                    {i < history.length - 1 && <div className="w-px flex-1 bg-border" />}
                  </div>
                  <div className="pb-3 space-y-0.5">
                    <StatusBadge status={h.newStatus} />
                    {h.comment && <p className="text-sm text-muted-foreground">{h.comment}</p>}
                    <p className="text-xs text-muted-foreground">{h.changedByName ?? '—'} · {formatDate(h.changedAt)}</p>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </div>
        <DialogFooter>
          <button onClick={() => onOpenChange(false)} className="inline-flex h-9 items-center rounded-lg border border-input px-4 text-sm hover:bg-accent">Cerrar</button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function MyIncidentsPage() {
  const [incidents, setIncidents] = useState([])
  const [loading, setLoading] = useState(true)
  const [createOpen, setCreateOpen] = useState(false)
  const [historyInc, setHistoryInc] = useState(null)

  const load = async () => {
    try { setIncidents(await incidentApi.getAll()) }
    catch { toast.error('Error al cargar incidencias') }
    finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Mis Incidencias</h1>
          <p className="text-sm text-muted-foreground">{incidents.length} incidencias reportadas</p>
        </div>
        <button onClick={() => setCreateOpen(true)} className="inline-flex h-9 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          <Plus className="h-4 w-4" />Reportar incidencia
        </button>
      </div>

      {loading ? (
        <div className="flex h-48 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : incidents.length === 0 ? (
        <div className="flex h-40 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border text-muted-foreground">
          <AlertTriangle className="h-8 w-8" />
          <p className="text-sm">No has reportado ninguna incidencia.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {incidents.map((inc) => (
            <div key={inc.id} className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm">
              <div className="flex items-start justify-between gap-2">
                <p className="font-semibold leading-tight">{inc.title}</p>
                <SevBadge sev={inc.severity} />
              </div>

              <div className="flex flex-wrap gap-2">
                <StatusBadge status={inc.status} />
                <span className="inline-flex rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
                  {TYPE_LABEL[inc.type] ?? inc.type}
                </span>
              </div>

              <div className="text-xs text-muted-foreground space-y-0.5">
                <p>Ubicación: <span className="text-foreground">{inc.location ?? '—'}</span></p>
                <p>Fecha: {formatDate(inc.createdAt)}</p>
                {inc.assignedToName && <p>Asignado a: <span className="text-foreground">{inc.assignedToName}</span></p>}
              </div>

              <div className="pt-1 border-t border-border">
                <button
                  onClick={() => setHistoryInc(inc)}
                  className="inline-flex h-8 w-full items-center justify-center rounded-lg border border-input text-xs hover:bg-accent"
                >
                  Ver historial
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <CreateIncidentDialog open={createOpen} onOpenChange={setCreateOpen} onSuccess={load} />
      <HistoryDialog open={!!historyInc} onOpenChange={(v) => !v && setHistoryInc(null)} incident={historyInc} />
    </div>
  )
}
