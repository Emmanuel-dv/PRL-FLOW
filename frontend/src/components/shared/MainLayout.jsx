import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import NotificationBell from './NotificationBell'
import {
  LayoutDashboard,
  Users,
  Briefcase,
  BookOpen,
  AlertTriangle,
  FileCheck,
  Package,
  FileText,
  ShieldCheck,
  Bell,
  LogOut,
} from 'lucide-react'

const ADMIN_LINKS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/users', label: 'Usuarios', icon: Users },
  { to: '/job-positions', label: 'Puestos de trabajo', icon: Briefcase },
  { to: '/catalogs', label: 'Catálogos', icon: BookOpen },
  { to: '/incidents', label: 'Incidencias', icon: AlertTriangle },
  { to: '/documents/pending', label: 'Documentos pendientes', icon: FileCheck },
  { to: '/epi-deliveries', label: 'Entregas EPIs', icon: Package },
]

const MANAGER_LINKS = [
  { to: '/incidents', label: 'Incidencias', icon: AlertTriangle },
  { to: '/documents/pending', label: 'Documentos pendientes', icon: FileCheck },
  { to: '/epi-deliveries', label: 'Entregas EPIs', icon: Package },
]

const WORKER_LINKS = [
  { to: '/my-documents', label: 'Mis documentos', icon: FileText },
  { to: '/my-epis', label: 'Mis EPIs', icon: ShieldCheck },
  { to: '/my-incidents', label: 'Mis incidencias', icon: AlertTriangle },
]

const ROLE_LINKS = { ADMIN: ADMIN_LINKS, MANAGER: MANAGER_LINKS, WORKER: WORKER_LINKS }

const ROLE_BADGE_COLOR = {
  ADMIN: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
  MANAGER: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300',
  WORKER: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
}

export default function MainLayout() {
  const { user, logout } = useAuth()
  const links = ROLE_LINKS[user?.role] ?? []

  const navClass = ({ isActive }) =>
    [
      'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
      isActive
        ? 'bg-primary text-primary-foreground'
        : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
    ].join(' ')

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      { }
      <aside className="flex w-64 flex-shrink-0 flex-col border-r border-sidebar-border bg-sidebar">
        { }
        <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-4">
          <ShieldCheck className="h-6 w-6 text-primary" />
          <span className="text-lg font-semibold tracking-tight">PRL Flow</span>
        </div>

        { }
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="space-y-1">
            {links.map(({ to, label, icon: Icon }) => (
              <li key={to}>
                <NavLink to={to} className={navClass} end>
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{label}</span>
                </NavLink>
              </li>
            ))}
          </ul>

          <div className="my-4 border-t border-sidebar-border" />

          { }
          <NavLink to="/notifications" className={navClass}>
            <Bell className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">Notificaciones</span>
          </NavLink>
        </nav>

        { }
        <div className="border-t border-sidebar-border p-3">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
              {user?.name?.[0]?.toUpperCase() ?? '?'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{user?.name}</p>
              <span className={`inline-block rounded-sm px-1.5 py-0.5 text-[10px] font-semibold ${ROLE_BADGE_COLOR[user?.role] ?? ''}`}>
                {user?.role}
              </span>
            </div>
            <button
              onClick={logout}
              aria-label="Cerrar sesión"
              className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      { }
      <div className="flex flex-1 flex-col overflow-hidden">
        { }
        <header className="flex h-16 flex-shrink-0 items-center justify-between border-b border-border bg-background px-6">
          <div />
          <div className="flex items-center gap-4">
            { }
            <NotificationBell />

            { }
            <div className="text-right">
              <p className="text-sm font-medium leading-none">{user?.name}</p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>

            { }
            <button
              onClick={logout}
              className="flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <LogOut className="h-3.5 w-3.5" />
              Salir
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
