import { useEffect, useState } from 'react'
import {
  Users,
  FileText,
  AlertTriangle,
  ShieldCheck,
  Package,
  CheckCircle2,
  Clock,
  Flame,
  TrendingUp,
} from 'lucide-react'
import { getDashboard } from '../../api/dashboardApi'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import { Skeleton } from '../../components/ui/skeleton'
import { Alert, AlertDescription, AlertTitle } from '../../components/ui/alert'

// ── Helpers ─────────────────────────────────────────────────────────────────

function complianceColor(rate) {
  if (rate >= 80) return 'text-emerald-600 dark:text-emerald-400'
  if (rate >= 50) return 'text-amber-600 dark:text-amber-400'
  return 'text-destructive'
}

// ── Metric card (large) ───────────────────────────────────────────────────────

function MetricCard({ title, value, icon: Icon, iconColor, description, badge }) {
  return (
    <Card className="rounded-2xl">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          <div className={`rounded-lg p-2 ${iconColor ?? 'bg-primary/10'}`}>
            <Icon className={`h-4 w-4 ${iconColor ? 'text-current' : 'text-primary'}`} />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-1">
        <div className="flex items-end gap-2">
          <span className="text-3xl font-bold tracking-tight">{value}</span>
          {badge}
        </div>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </CardContent>
    </Card>
  )
}

// ── Small stat card ───────────────────────────────────────────────────────────

function StatCard({ title, value, icon: Icon, className = '' }) {
  return (
    <Card className={`rounded-2xl ${className}`}>
      <CardContent className="flex items-center gap-4 pt-5">
        <div className="rounded-xl bg-muted p-2.5">
          <Icon className="h-5 w-5 text-muted-foreground" />
        </div>
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-xs text-muted-foreground">{title}</p>
        </div>
      </CardContent>
    </Card>
  )
}

// ── Skeleton loading state ────────────────────────────────────────────────────

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Row 1: 4 cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-2xl" />
        ))}
      </div>
      {/* Row 2: 3 cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-2xl" />
        ))}
      </div>
      {/* Row 3: 3 cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-2xl" />
        ))}
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    getDashboard()
      .then(setData)
      .catch((err) =>
        setError(
          err.response?.data?.message ||
            'No se pudo cargar el dashboard. Inténtalo de nuevo.',
        ),
      )
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="p-6 space-y-8">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground text-sm">
          Resumen ejecutivo de seguridad y prevención laboral
        </p>
      </div>

      {/* Loading */}
      {loading && <DashboardSkeleton />}

      {/* Error */}
      {!loading && error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error al cargar los datos</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Data */}
      {!loading && data && (
        <div className="space-y-6">

          {/* ── Sección 4 — Alertas críticas (top, llamada a la acción) ─────── */}
          {(data.totalDocumentsExpired > 0 ||
            data.totalDocumentsPendingReview > 0 ||
            data.totalIncidentsCritical > 0) && (
            <div className="space-y-3">
              {data.totalDocumentsExpired > 0 && (
                <Alert variant="destructive">
                  <Flame className="h-4 w-4" />
                  <AlertTitle>Documentos caducados</AlertTitle>
                  <AlertDescription>
                    Hay <strong>{data.totalDocumentsExpired}</strong> documento
                    {data.totalDocumentsExpired !== 1 ? 's' : ''} caducado
                    {data.totalDocumentsExpired !== 1 ? 's' : ''} que requieren
                    atención inmediata.
                  </AlertDescription>
                </Alert>
              )}
              {data.totalIncidentsCritical > 0 && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Incidencias críticas</AlertTitle>
                  <AlertDescription>
                    Hay <strong>{data.totalIncidentsCritical}</strong> incidencia
                    {data.totalIncidentsCritical !== 1 ? 's' : ''} crítica
                    {data.totalIncidentsCritical !== 1 ? 's' : ''} abiertas.
                  </AlertDescription>
                </Alert>
              )}
              {data.totalDocumentsPendingReview > 0 && (
                <Alert className="border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-100">
                  <Clock className="h-4 w-4" />
                  <AlertTitle>Documentos pendientes de revisión</AlertTitle>
                  <AlertDescription>
                    Hay <strong>{data.totalDocumentsPendingReview}</strong> documento
                    {data.totalDocumentsPendingReview !== 1 ? 's' : ''} esperando revisión.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {/* ── Sección 1 — Métricas principales (4 cards) ───────────────── */}
          <div>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Métricas principales
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <MetricCard
                title="Trabajadores activos"
                value={data.totalWorkers}
                icon={Users}
                iconColor="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                description={`${data.totalManagers} manager${data.totalManagers !== 1 ? 's' : ''} · ${data.activeUsers} usuarios activos`}
              />

              <MetricCard
                title="Documentos pendientes"
                value={data.totalDocumentsPendingReview}
                icon={FileText}
                iconColor="bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400"
                description={`${data.totalDocumentsExpiringSoon} próximos a caducar`}
                badge={
                  data.totalDocumentsPendingReview > 0 ? (
                    <Badge
                      variant="secondary"
                      className="mb-0.5 bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
                    >
                      Revisión pendiente
                    </Badge>
                  ) : null
                }
              />

              <MetricCard
                title="Incidencias abiertas"
                value={data.totalIncidentsOpen}
                icon={AlertTriangle}
                iconColor="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
                description={`${data.totalIncidentsInProgress} en progreso`}
                badge={
                  data.totalIncidentsCritical > 0 ? (
                    <Badge variant="destructive">
                      {data.totalIncidentsCritical} crítica
                      {data.totalIncidentsCritical !== 1 ? 's' : ''}
                    </Badge>
                  ) : null
                }
              />

              <MetricCard
                title="Cumplimiento documental"
                value={`${data.documentComplianceRate}%`}
                icon={TrendingUp}
                iconColor="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
                description="Trabajadores con documentación al día"
                badge={
                  <span
                    className={`mb-0.5 text-sm font-semibold ${complianceColor(data.documentComplianceRate)}`}
                  >
                    {data.documentComplianceRate >= 80
                      ? '✓ Bueno'
                      : data.documentComplianceRate >= 50
                        ? '⚠ Mejorable'
                        : '✗ Crítico'}
                  </span>
                }
              />
            </div>
          </div>

          {/* ── Sección 2 — EPIs (3 cards) ──────────────────────────────────── */}
          <div>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Entregas de EPIs
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <StatCard
                title="Entregas pendientes"
                value={data.totalEpiDeliveriesPending}
                icon={Package}
              />
              <StatCard
                title="Entregas realizadas"
                value={data.totalEpiDeliveriesDelivered}
                icon={ShieldCheck}
              />
              <StatCard
                title="Confirmadas por trabajador"
                value={data.totalEpiDeliveriesConfirmed}
                icon={CheckCircle2}
              />
            </div>
          </div>

          {/* ── Sección 3 — Incidencias detalle (3 cards) ───────────────────── */}
          <div>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Estado de incidencias
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <StatCard
                title="Abiertas"
                value={data.totalIncidentsOpen}
                icon={AlertTriangle}
              />
              <StatCard
                title="En progreso"
                value={data.totalIncidentsInProgress}
                icon={Clock}
              />
              <StatCard
                title="Críticas"
                value={data.totalIncidentsCritical}
                icon={Flame}
                className={
                  data.totalIncidentsCritical > 0
                    ? 'border-destructive ring-1 ring-destructive/30'
                    : ''
                }
              />
            </div>
          </div>

          {/* ── Pie: resueltas este mes ──────────────────────────────────────── */}
          <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 dark:border-emerald-800 dark:bg-emerald-950/30">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <p className="text-sm text-emerald-800 dark:text-emerald-300">
              <strong>{data.totalIncidentsResolvedThisMonth}</strong> incidencia
              {data.totalIncidentsResolvedThisMonth !== 1 ? 's' : ''} resuelta
              {data.totalIncidentsResolvedThisMonth !== 1 ? 's' : ''} este mes
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
