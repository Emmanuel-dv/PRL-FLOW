import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell } from 'lucide-react'
import * as notificationApi from '../../api/notificationApi'

const POLL_MS = 5_000

export default function NotificationBell() {
  const navigate = useNavigate()
  const [count, setCount] = useState(0)

  const fetchCount = () => {
    notificationApi
      .countUnread()
      .then((data) => setCount(data.count ?? 0))
      .catch(() => {})
  }

  useEffect(() => {
    fetchCount()
    const interval = setInterval(fetchCount, POLL_MS)
    return () => clearInterval(interval)
  }, [])

  return (
    <button
      id="notification-bell"
      onClick={() => navigate('/notifications')}
      aria-label="Ver notificaciones"
      className="relative rounded-md p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
    >
      <Bell className="h-5 w-5" />
      {count > 0 && (
        <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[9px] font-bold text-white">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </button>
  )
}
