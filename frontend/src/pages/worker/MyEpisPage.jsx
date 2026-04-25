import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Loader2, ShieldCheck } from 'lucide-react'
import * as epiApi from '../../api/epiApi'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog'

const STATUS_BADGE = {
  PENDING:   'bg-secondary text-secondary-foreground',
  DELIVERED: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  CONFIRMED: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
}
const STATUS_LABEL = { PENDING: 'Pendiente', DELIVERED: 'Entregado', CONFIRMED: 'Confirmado' }

function StatusBadge({ status }) {
  return <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_BADGE[status] ?? 'bg-secondary text-secondary-foreground'}`}>{STATUS_LABEL[status] ?? status}</span>
}
function fmt(dt) { if (!dt) return '—'; return new Date(dt).toLocaleDateString('es-ES') }

// ── Confirm reception dialog ──────────────────────────────────────────────────
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
export default function MyEpisPage() {
  const [deliveries, setDeliveries] = useState([])
  const [loading, setLoading] = useState(true)
  const [confirmDel, setConfirmDel] = useState(null)
  const [confirmSaving, setConfirmSaving] = useState(false)

  const load = async () => {
    try { setDeliveries(await epiApi.getAll()) }
    catch { toast.error('Error al cargar EPIs') }
    finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  const handleConfirm = async () => {
    if (!confirmDel) return
    setConfirmSaving(true)
    try {
      const result = await epiApi.confirm(confirmDel.id)
      toast.success(`Recepción confirmada. Hash: ${result.confirmationHash?.substring(0, 8) ?? ''}...`)
      setConfirmDel(null); load()
    } catch (err) { toast.error(err.response?.data?.message ?? 'Error al confirmar') }
    finally { setConfirmSaving(false) }
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Mis EPIs</h1>
        <p className="text-sm text-muted-foreground">Aquí puedes ver y confirmar la recepción de tus equipos de protección individual</p>
      </div>

      {loading ? (
        <div className="flex h-48 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : deliveries.length === 0 ? (
        <div className="flex h-40 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border text-muted-foreground">
          <ShieldCheck className="h-8 w-8" />
          <p className="text-sm">No tienes entregas de EPIs pendientes.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {deliveries.map((d) => (
            <div key={d.id} className={`flex flex-col gap-3 rounded-2xl border bg-card p-4 shadow-sm ${d.status === 'DELIVERED' ? 'border-blue-200 dark:border-blue-800' : 'border-border'}`}>
              <div className="flex items-center justify-between">
                <StatusBadge status={d.status} />
                <span className="text-xs text-muted-foreground">#{d.id}</span>
              </div>

              <ul className="space-y-1">
                {(d.items ?? []).map((it, i) => (
                  <li key={i} className="flex justify-between text-sm">
                    <span>{it.epiName ?? it.epiCatalog?.name}</span>
                    <span className="text-muted-foreground">{it.quantityDelivered} ud.</span>
                  </li>
                ))}
              </ul>

              <div className="text-xs text-muted-foreground space-y-0.5 border-t border-border pt-2">
                <p>Entregado por: <span className="text-foreground">{d.managerName ?? '—'}</span></p>
                <p>Fecha apertura: {fmt(d.createdAt)}</p>
                {d.status === 'CONFIRMED' && (
                  <>
                    <p>Confirmado: {fmt(d.confirmedAt)}</p>
                    {d.confirmationHash && <p className="font-mono">Hash: {d.confirmationHash.substring(0, 8)}...</p>}
                  </>
                )}
              </div>

              {d.status === 'DELIVERED' && (
                <button
                  onClick={() => setConfirmDel(d)}
                  className="inline-flex h-9 w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                >
                  <ShieldCheck className="h-4 w-4" />✓ Confirmar recepción
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog open={!!confirmDel} onOpenChange={(v) => !v && setConfirmDel(null)} delivery={confirmDel} onConfirm={handleConfirm} saving={confirmSaving} />
    </div>
  )
}
