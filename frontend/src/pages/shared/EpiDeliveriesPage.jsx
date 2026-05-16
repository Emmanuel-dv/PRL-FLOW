import { useEffect, useState, useMemo } from 'react'
import { toast } from 'sonner'
import { Plus, Loader2, PackageCheck } from 'lucide-react'
import * as epiApi from '../../api/epiApi'
import * as userApi from '../../api/userApi'
import * as catalogApi from '../../api/catalogApi'
import { useAuth } from '../../context/AuthContext'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table'
import { formatDate } from '@/lib/utils'

const inputCls = 'flex h-9 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50'
const STATUS_BADGE = {
  PENDING:   'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  DELIVERED: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  CONFIRMED: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
}
const STATUS_LABEL = { PENDING: 'Pendiente', DELIVERED: 'Entregado', CONFIRMED: 'Confirmado' }

function StatusBadge({ status }) {
  return <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_BADGE[status] ?? 'bg-secondary text-secondary-foreground'}`}>{STATUS_LABEL[status] ?? status}</span>
}
function epiSummary(items) { return (items ?? []).map((i) => `${i.epiCatalogName ?? i.epiName ?? '?'}${i.quantityDelivered > 1 ? ` x${i.quantityDelivered}` : ''}`).join(', ') || '—' }

// ── Create delivery dialog (MANAGER) ─────────────────────────────────────────
function CreateDeliveryDialog({ open, onOpenChange, workers, epiCatalog, onSuccess }) {
  const [workerId, setWorkerId] = useState('')
  const [items, setItems] = useState([{ epiCatalogId: '', quantity: 1 }])
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) { setWorkerId(''); setItems([{ epiCatalogId: '', quantity: 1 }]); setNotes('') }
  }, [open])

  const addItem = () => setItems((prev) => [...prev, { epiCatalogId: '', quantity: 1 }])
  const removeItem = (i) => setItems((prev) => prev.filter((_, idx) => idx !== i))
  const setItem = (i, k, v) => setItems((prev) => prev.map((item, idx) => idx === i ? { ...item, [k]: v } : item))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!workerId) { toast.error('Selecciona un trabajador'); return }
    if (items.some((it) => !it.epiCatalogId)) { toast.error('Selecciona el EPI para cada línea'); return }
    setSaving(true)
    try {
      await epiApi.create({
        workerId: Number(workerId),
        notes: notes?.trim() || null,
        items: items.map((it) => ({
          epiCatalogId: Number(it.epiCatalogId),
          quantity: parseInt(it.quantity, 10) || 1,
        })),
      })
      onSuccess(); onOpenChange(false)
    } catch (err) {
      const msg = err.response?.data?.message
        || (typeof err.response?.data === 'string' ? err.response.data : null)
        || err.message
        || 'Error al crear la entrega'
      toast.error(msg)
    }
    finally { setSaving(false) }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Nueva entrega de EPIs</DialogTitle></DialogHeader>
        <form id="cef" onSubmit={handleSubmit} className="grid gap-4 py-2">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Trabajador</label>
            <select className={inputCls} required value={workerId} onChange={(e) => setWorkerId(e.target.value)}>
              <option value="">Selecciona un trabajador...</option>
              {workers.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">EPIs a entregar</label>
            {items.map((item, i) => (
              <div key={i} className="flex gap-2 items-center">
                <select className={`${inputCls} flex-1`} value={item.epiCatalogId} onChange={(e) => setItem(i, 'epiCatalogId', e.target.value)}>
                  <option value="">Selecciona EPI...</option>
                  {epiCatalog.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
                </select>
                <input type="number" min={1} className="h-9 w-20 rounded-lg border border-input bg-background px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" value={item.quantity} onChange={(e) => setItem(i, 'quantity', e.target.value)} />
                {items.length > 1 && (
                  <button type="button" onClick={() => removeItem(i)} className="text-muted-foreground hover:text-destructive text-lg leading-none px-1">×</button>
                )}
              </div>
            ))}
            <button type="button" onClick={addItem} className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-dashed border-input px-3 text-xs text-muted-foreground hover:bg-accent">
              <Plus className="h-3 w-3" />Añadir EPI
            </button>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Notas (opcional)</label>
            <textarea className="flex min-h-[60px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Observaciones..." />
          </div>
        </form>
        <DialogFooter>
          <button type="button" onClick={() => onOpenChange(false)} className="inline-flex h-9 items-center rounded-lg border border-input px-4 text-sm hover:bg-accent">Cancelar</button>
          <button type="submit" form="cef" disabled={saving} className="inline-flex h-9 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
            {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}Crear entrega
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ── Detail dialog ─────────────────────────────────────────────────────────────
function DetailDialog({ open, onOpenChange, delivery }) {
  if (!delivery) return null
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>Detalle de entrega #{delivery.id}</DialogTitle></DialogHeader>
        <div className="space-y-4 text-sm">
          <div className="flex gap-2 items-center"><StatusBadge status={delivery.status} /></div>
          <div className="grid grid-cols-2 gap-3 text-muted-foreground">
            <div><p className="text-xs font-medium text-foreground">Trabajador</p><p>{delivery.workerName ?? '—'}</p></div>
            <div><p className="text-xs font-medium text-foreground">Manager</p><p>{delivery.managerName ?? '—'}</p></div>
            <div><p className="text-xs font-medium text-foreground">Fecha apertura</p><p>{formatDate(delivery.createdAt)}</p></div>
            {delivery.status === 'CONFIRMED' && (
              <div><p className="text-xs font-medium text-foreground">Fecha confirmación</p><p>{formatDate(delivery.confirmedAt)}</p></div>
            )}
          </div>
          <div>
            <p className="text-xs font-medium mb-2">EPIs incluidos</p>
            <ul className="space-y-1">
              {(delivery.items ?? []).map((it, i) => (
                <li key={i} className="flex justify-between rounded-lg border border-border px-3 py-1.5 text-xs">
                  <span>{it.epiName ?? it.epiCatalog?.name}</span>
                  <span className="text-muted-foreground">{it.quantityDelivered} ud.</span>
                </li>
              ))}
            </ul>
          </div>
          {delivery.status === 'CONFIRMED' && delivery.confirmationHash && (
            <div className="rounded-lg bg-muted px-3 py-2 text-xs space-y-0.5">
              <p className="font-medium">Firma digital</p>
              <p className="font-mono text-muted-foreground">{delivery.confirmationHash.substring(0, 16)}...</p>
              {delivery.confirmationIp && <p className="text-muted-foreground">IP: {delivery.confirmationIp}</p>}
            </div>
          )}
          {delivery.notes && <div><p className="text-xs font-medium">Notas</p><p className="text-muted-foreground">{delivery.notes}</p></div>}
        </div>
        <DialogFooter>
          <button onClick={() => onOpenChange(false)} className="inline-flex h-9 items-center rounded-lg border border-input px-4 text-sm hover:bg-accent">Cerrar</button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ── Confirm reception dialog (WORKER) ─────────────────────────────────────────
function ConfirmDialog({ open, onOpenChange, delivery, onConfirm, saving }) {
  const [agreed, setAgreed] = useState(false)
  useEffect(() => { if (open) setAgreed(false) }, [open])
  if (!delivery) return null
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader><DialogTitle>Confirmar recepción de EPIs</DialogTitle></DialogHeader>
        <div className="space-y-4 text-sm">
          <p className="text-muted-foreground">¿Confirmas que has recibido los siguientes EPIs?</p>
          <ul className="space-y-1">
            {(delivery.items ?? []).map((it, i) => (
              <li key={i} className="flex justify-between rounded-lg border border-border px-3 py-1.5 text-xs">
                <span>{it.epiName ?? it.epiCatalog?.name}</span>
                <span className="text-muted-foreground">{it.quantityDelivered} ud.</span>
              </li>
            ))}
          </ul>
          <label className="flex items-start gap-2 cursor-pointer">
            <input type="checkbox" className="mt-0.5 rounded border-input" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
            <span className="text-xs">Confirmo haber recibido todos los EPIs listados</span>
          </label>
        </div>
        <DialogFooter>
          <button onClick={() => onOpenChange(false)} className="inline-flex h-9 items-center rounded-lg border border-input px-4 text-sm hover:bg-accent">Cancelar</button>
          <button onClick={onConfirm} disabled={!agreed || saving} className="inline-flex h-9 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
            {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}Confirmar recepción
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function EpiDeliveriesPage() {
  const { user } = useAuth()
  const isManager = user?.role === 'MANAGER'

  const [deliveries, setDeliveries] = useState([])
  const [workers, setWorkers] = useState([])
  const [epiCatalog, setEpiCatalog] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('ALL')

  const [createOpen, setCreateOpen] = useState(false)
  const [detailDel, setDetailDel] = useState(null)
  const [confirmDel, setConfirmDel] = useState(null)
  const [confirmSaving, setConfirmSaving] = useState(false)
  const [actionLoading, setActionLoading] = useState(null)

  const load = async () => {
    try {
      const [del, users, epis] = await Promise.all([epiApi.getAll(), userApi.getAll(), catalogApi.getAllEpiCatalog()])
      setDeliveries(del)
      setWorkers(users.filter((u) => u.role === 'WORKER'))
      setEpiCatalog(epis)
    } catch { toast.error('Error al cargar entregas') }
    finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  const filtered = useMemo(() => deliveries.filter((d) => statusFilter === 'ALL' || d.status === statusFilter), [deliveries, statusFilter])

  const handleMarkDelivered = async (id) => {
    setActionLoading(id)
    try { await epiApi.markDelivered(id); load() }
    catch (err) { toast.error(err.response?.data?.message ?? 'Error') }
    finally { setActionLoading(null) }
  }

  const handleConfirm = async () => {
    if (!confirmDel) return
    setConfirmSaving(true)
    try {
      await epiApi.confirm(confirmDel.id)
      setConfirmDel(null); load()
    } catch (err) { toast.error(err.response?.data?.message ?? 'Error al confirmar') }
    finally { setConfirmSaving(false) }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Entregas de EPIs</h1>
          <p className="text-sm text-muted-foreground">{deliveries.length} entregas registradas</p>
        </div>
        {isManager && (
          <button onClick={() => setCreateOpen(true)} className="inline-flex h-9 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90">
            <Plus className="h-4 w-4" />Nueva entrega
          </button>
        )}
      </div>

      <div>
        <select className="h-9 rounded-lg border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="ALL">Todos los estados</option>
          <option value="PENDING">Pendiente</option>
          <option value="DELIVERED">Entregado</option>
          <option value="CONFIRMED">Confirmado</option>
        </select>
      </div>

      {loading ? (
        <div className="flex h-48 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : (
        <div className="rounded-2xl border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Trabajador</TableHead>
                <TableHead>Manager</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>EPIs incluidos</TableHead>
                <TableHead>Fecha apertura</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="h-24 text-center text-muted-foreground">No hay entregas.</TableCell></TableRow>
              ) : filtered.map((d) => (
                <TableRow key={d.id}>
                  <TableCell className="text-muted-foreground text-xs">#{d.id}</TableCell>
                  <TableCell className="font-medium">{d.workerName ?? '—'}</TableCell>
                  <TableCell className="text-muted-foreground">{d.managerName ?? '—'}</TableCell>
                  <TableCell><StatusBadge status={d.status} /></TableCell>
                  <TableCell className="max-w-[200px] truncate text-xs text-muted-foreground">{epiSummary(d.items)}</TableCell>
                  <TableCell className="text-muted-foreground text-xs">{formatDate(d.createdAt)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => setDetailDel(d)} className="inline-flex h-8 items-center rounded-lg border border-input px-3 text-xs hover:bg-accent">Ver</button>
                      {isManager && d.status === 'PENDING' && (
                        <button onClick={() => handleMarkDelivered(d.id)} disabled={actionLoading === d.id} className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-blue-100 px-3 text-xs font-medium text-blue-700 hover:bg-blue-200 disabled:opacity-50">
                          {actionLoading === d.id && <Loader2 className="h-3 w-3 animate-spin" />}<PackageCheck className="h-3 w-3" />Marcar entregado
                        </button>
                      )}
                      {user?.role === 'WORKER' && d.status === 'DELIVERED' && (
                        <button onClick={() => setConfirmDel(d)} className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-emerald-100 px-3 text-xs font-medium text-emerald-700 hover:bg-emerald-200">
                          Confirmar recepción
                        </button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <CreateDeliveryDialog open={createOpen} onOpenChange={setCreateOpen} workers={workers} epiCatalog={epiCatalog} onSuccess={load} />
      <DetailDialog open={!!detailDel} onOpenChange={(v) => !v && setDetailDel(null)} delivery={detailDel} />
      <ConfirmDialog open={!!confirmDel} onOpenChange={(v) => !v && setConfirmDel(null)} delivery={confirmDel} onConfirm={handleConfirm} saving={confirmSaving} />
    </div>
  )
}
