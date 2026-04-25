import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Bell, FileText, Package, AlertTriangle, Loader2, X, CheckCheck } from 'lucide-react'
import * as notificationApi from '../../api/notificationApi'

// ── Helpers ───────────────────────────────────────────────────────────────────
function relativeTime(dateStr) {
  if (!dateStr) return ''
  const diff = Date.now() - new Date(dateStr).getTime()
  const minutes = Math.floor(diff / 60_000)
  if (minutes < 1)  return 'Ahora mismo'
  if (minutes < 60) return `Hace ${minutes} min`
  const hours = Math.floor(minutes / 60)
  if (hours < 24)   return `Hace ${hours} h`
  const days = Math.floor(hours / 24)
  return `Hace ${days} día${days !== 1 ? 's' : ''}`
}

function typeIcon(type = '') {
  if (type.startsWith('DOCUMENT'))  return FileText
  if (type.startsWith('EPI'))       return Package
  if (type.startsWith('INCIDENT'))  return AlertTriangle
  return Bell
}

// ── Notification card ─────────────────────────────────────────────────────────
function NotifCard({ notif, onMarkRead }) {
  const Icon = typeIcon(notif.type)
  const unread = !notif.isRead

  return (
    <div
      className={[
        'flex gap-4 rounded-2xl border p-4 transition-colors',
        unread
          ? 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/30'
          : 'border-border bg-card',
      ].join(' ')}
    >
      {/* Icon */}
      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${unread ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400' : 'bg-muted text-muted-foreground'}`}>
        <Icon className="h-4 w-4" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-0.5">
        <p className={`text-sm leading-snug ${unread ? 'font-semibold' : 'font-medium'}`}>
          {notif.title}
        </p>
        <p className="text-sm text-muted-foreground">{notif.message}</p>
        <p className="text-xs text-muted-foreground">{relativeTime(notif.createdAt)}</p>
      </div>

      {/* Dismiss button */}
      {unread && (
        <button
          onClick={() => onMarkRead(notif.id)}
          title="Marcar como leída"
          className="shrink-0 self-start rounded-md p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [markingAll, setMarkingAll] = useState(false)

  const load = async () => {
    try { setNotifications(await notificationApi.getAll()) }
    catch { toast.error('Error al cargar notificaciones') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const unreadCount = notifications.filter((n) => !n.isRead).length

  // Optimistic update for single mark-as-read
  const handleMarkRead = async (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
    )
    try { await notificationApi.markAsRead(id) }
    catch { toast.error('No se pudo marcar como leída') }
  }

  const handleMarkAll = async () => {
    setMarkingAll(true)
    try {
      await notificationApi.markAllAsRead()
      await load()
    } catch { toast.error('Error al marcar todas como leídas') }
    finally { setMarkingAll(false) }
  }

  return (
    <div className="mx-auto max-w-2xl p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Notificaciones</h1>
          <p className="text-sm text-muted-foreground">
            {unreadCount > 0 ? `${unreadCount} sin leer` : 'Todas leídas'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAll}
            disabled={markingAll}
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-input px-4 text-sm hover:bg-accent disabled:opacity-50"
          >
            {markingAll
              ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
              : <CheckCheck className="h-3.5 w-3.5" />
            }
            Marcar todas como leídas
          </button>
        )}
      </div>

      {/* List */}
      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 py-24 text-muted-foreground">
          <Bell className="h-16 w-16 opacity-20" />
          <p className="text-base">No tienes notificaciones</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <NotifCard key={n.id} notif={n} onMarkRead={handleMarkRead} />
          ))}
        </div>
      )}
    </div>
  )
}
