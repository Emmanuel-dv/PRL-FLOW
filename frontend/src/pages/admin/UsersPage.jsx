import { useEffect, useState, useMemo } from 'react'
import { toast } from 'sonner'
import { Plus, Pencil, UserX, Search, Loader2 } from 'lucide-react'
import * as userApi from '../../api/userApi'
import * as jobPositionApi from '../../api/jobPositionApi'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table'

const inputCls = 'flex h-9 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50'

function Field({ label, error, children }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium leading-none">{label}</label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}

const ROLE_BADGE = {
  ADMIN:   'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  MANAGER: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  WORKER:  'bg-secondary text-secondary-foreground',
}

function RoleBadge({ role }) {
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${ROLE_BADGE[role] ?? 'bg-secondary text-secondary-foreground'}`}>
      {role}
    </span>
  )
}

const EMPTY = { name: '', email: '', password: '', role: 'WORKER', managerId: '', jobPositionId: '' }

function UserFormDialog({ open, onOpenChange, editUser, managers, positions, onSuccess }) {
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (open) {
      setErrors({})
      setForm(editUser
        ? { name: editUser.name ?? '', email: editUser.email ?? '', password: '', role: editUser.role ?? 'WORKER', managerId: editUser.managerId ?? '', jobPositionId: editUser.jobPositionId ?? '' }
        : EMPTY)
    }
  }, [open, editUser])

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setErrors({})
    const payload = {
      name: form.name, email: form.email, role: form.role,
      managerId: form.managerId ? Number(form.managerId) : null,
      jobPositionId: form.jobPositionId ? Number(form.jobPositionId) : null,
      ...(editUser ? { active: editUser.active } : { password: form.password }),
    }
    try {
      if (editUser) { await userApi.update(editUser.id, payload) }
      else { await userApi.create(payload) }
      onSuccess(); onOpenChange(false)
    } catch (err) {
      const data = err.response?.data
      if (data && typeof data === 'object' && !data.message) setErrors(data)
      else toast.error(data?.message ?? 'Error al guardar')
    } finally { setSaving(false) }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader><DialogTitle>{editUser ? 'Editar usuario' : 'Nuevo usuario'}</DialogTitle></DialogHeader>
        <form id="uf" onSubmit={handleSubmit} className="grid gap-4 py-2">
          <Field label="Nombre" error={errors.name}>
            <input className={inputCls} required value={form.name} onChange={set('name')} placeholder="Nombre completo" />
          </Field>
          <Field label="Correo electrónico" error={errors.email}>
            <input type="email" className={inputCls} required value={form.email} onChange={set('email')} placeholder="usuario@empresa.com" />
          </Field>
          {!editUser && (
            <Field label="Contraseña" error={errors.password}>
              <input type="password" className={inputCls} required minLength={8} value={form.password} onChange={set('password')} placeholder="Mínimo 8 caracteres" />
            </Field>
          )}
          <Field label="Rol" error={errors.role}>
            <select className={inputCls} value={form.role} onChange={set('role')}>
              <option value="ADMIN">Admin</option>
              <option value="MANAGER">Manager</option>
              <option value="WORKER">Worker</option>
            </select>
          </Field>
          <Field label="Manager (opcional)" error={errors.managerId}>
            <select className={inputCls} value={form.managerId} onChange={set('managerId')}>
              <option value="">Sin manager</option>
              {managers.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </Field>
          <Field label="Puesto de trabajo (opcional)" error={errors.jobPositionId}>
            <select className={inputCls} value={form.jobPositionId} onChange={set('jobPositionId')}>
              <option value="">Sin puesto</option>
              {positions.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </Field>
        </form>
        <DialogFooter>
          <button type="button" onClick={() => onOpenChange(false)} className="inline-flex h-9 items-center rounded-lg border border-input px-4 text-sm hover:bg-accent">Cancelar</button>
          <button type="submit" form="uf" disabled={saving} className="inline-flex h-9 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
            {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}Guardar
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function ConfirmDeactivateDialog({ open, onOpenChange, user, onConfirm, loading }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader><DialogTitle>Desactivar usuario</DialogTitle></DialogHeader>
        <p className="text-sm text-muted-foreground">¿Desactivar a <strong>{user?.name}</strong>? El usuario perderá el acceso a la plataforma.</p>
        <DialogFooter>
          <button onClick={() => onOpenChange(false)} className="inline-flex h-9 items-center rounded-lg border border-input px-4 text-sm hover:bg-accent">Cancelar</button>
          <button onClick={onConfirm} disabled={loading} className="inline-flex h-9 items-center gap-2 rounded-lg bg-destructive px-4 text-sm font-medium text-white hover:bg-destructive/90 disabled:opacity-50">
            {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}Desactivar
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default function UsersPage() {
  const [users, setUsers] = useState([])
  const [positions, setPositions] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('ALL')
  const [createOpen, setCreateOpen] = useState(false)
  const [editUser, setEditUser] = useState(null)
  const [deactivateUser, setDeactivateUser] = useState(null)
  const [deactivateLoading, setDeactivateLoading] = useState(false)

  const load = async () => {
    try {
      const [u, p] = await Promise.all([userApi.getAll(), jobPositionApi.getAll()])
      setUsers(u); setPositions(p)
    } catch { toast.error('Error al cargar los datos') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const managers = useMemo(() => users.filter((u) => u.role === 'MANAGER'), [users])

  const filtered = useMemo(() => users.filter((u) => {
    const q = search.toLowerCase()
    return (u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q))
      && (roleFilter === 'ALL' || u.role === roleFilter)
  }), [users, search, roleFilter])

  const handleDeactivate = async () => {
    setDeactivateLoading(true)
    try {
      await userApi.deactivate(deactivateUser.id)
      setDeactivateUser(null)
      load()
    } catch { toast.error('Error al desactivar') }
    finally { setDeactivateLoading(false) }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Gestión de Usuarios</h1>
          <p className="text-sm text-muted-foreground">{users.length} usuarios registrados</p>
        </div>
        <button onClick={() => setCreateOpen(true)} className="inline-flex h-9 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          <Plus className="h-4 w-4" />Nuevo Usuario
        </button>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input className="flex h-9 w-full rounded-lg border border-input bg-background pl-8 pr-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" placeholder="Buscar por nombre o email..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="h-9 rounded-lg border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
          <option value="ALL">Todos los roles</option>
          <option value="ADMIN">Admin</option>
          <option value="MANAGER">Manager</option>
          <option value="WORKER">Worker</option>
        </select>
      </div>

      {loading ? (
        <div className="flex h-48 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : (
        <div className="rounded-2xl border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Puesto</TableHead>
                <TableHead>Manager</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="h-24 text-center text-muted-foreground">No se encontraron usuarios.</TableCell></TableRow>
              ) : filtered.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">{u.name}</TableCell>
                  <TableCell className="text-muted-foreground">{u.email}</TableCell>
                  <TableCell><RoleBadge role={u.role} /></TableCell>
                  <TableCell className="text-muted-foreground">{u.jobPositionName ?? '—'}</TableCell>
                  <TableCell className="text-muted-foreground">{u.managerName ?? '—'}</TableCell>
                  <TableCell>
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${u.active ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40' : 'bg-destructive/10 text-destructive'}`}>
                      {u.active ? 'Activo' : 'Inactivo'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => setEditUser(u)} className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-input px-3 text-xs hover:bg-accent">
                        <Pencil className="h-3 w-3" />Editar
                      </button>
                      {u.active && (
                        <button onClick={() => setDeactivateUser(u)} className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-destructive/30 px-3 text-xs text-destructive hover:bg-destructive/10">
                          <UserX className="h-3 w-3" />Desactivar
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

      <UserFormDialog open={createOpen} onOpenChange={setCreateOpen} editUser={null} managers={managers} positions={positions} onSuccess={load} />
      <UserFormDialog open={!!editUser} onOpenChange={(v) => !v && setEditUser(null)} editUser={editUser} managers={managers} positions={positions} onSuccess={load} />
      <ConfirmDeactivateDialog open={!!deactivateUser} onOpenChange={(v) => !v && setDeactivateUser(null)} user={deactivateUser} onConfirm={handleDeactivate} loading={deactivateLoading} />
    </div>
  )
}
