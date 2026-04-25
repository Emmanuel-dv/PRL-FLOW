import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute'
import MainLayout from '../components/shared/MainLayout'

// ── Public pages (eager) ──────────────────────────────────────────────────────
import LoginPage from '../pages/auth/LoginPage'

// ── Lazy-loaded pages ─────────────────────────────────────────────────────────
const DashboardPage        = lazy(() => import('../pages/admin/DashboardPage'))
const UsersPage            = lazy(() => import('../pages/admin/UsersPage'))
const JobPositionsPage     = lazy(() => import('../pages/admin/JobPositionsPage'))
const CatalogsPage         = lazy(() => import('../pages/admin/CatalogsPage'))
const PendingDocumentsPage = lazy(() => import('../pages/admin/PendingDocumentsPage'))

const IncidentsPage        = lazy(() => import('../pages/shared/IncidentsPage'))
const EpiDeliveriesPage    = lazy(() => import('../pages/shared/EpiDeliveriesPage'))
const NotificationsPage    = lazy(() => import('../pages/shared/NotificationsPage'))

const MyDocumentsPage      = lazy(() => import('../pages/worker/MyDocumentsPage'))
const MyEpisPage           = lazy(() => import('../pages/worker/MyEpisPage'))
const MyIncidentsPage      = lazy(() => import('../pages/worker/MyIncidentsPage'))

const PageLoader = () => (
  <div className="flex h-full items-center justify-center p-12">
    <p className="text-muted-foreground">Cargando...</p>
  </div>
)

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ── Public ────────────────────────────────────────────────────── */}
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/unauthorized"
          element={
            <div className="flex h-screen flex-col items-center justify-center gap-2">
              <h1 className="text-2xl font-semibold">Sin acceso</h1>
              <p className="text-muted-foreground">No tienes permiso para ver esta página.</p>
            </div>
          }
        />

        {/* ── Protected (any authenticated user) ────────────────────────── */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route
              path="/"
              element={<Navigate to="/dashboard" replace />}
            />

            {/* ADMIN only */}
            <Route element={<ProtectedRoute roles={['ADMIN']} />}>
              <Route
                path="/dashboard"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <DashboardPage />
                  </Suspense>
                }
              />
              <Route
                path="/users"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <UsersPage />
                  </Suspense>
                }
              />
              <Route
                path="/job-positions"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <JobPositionsPage />
                  </Suspense>
                }
              />
              <Route
                path="/catalogs"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <CatalogsPage />
                  </Suspense>
                }
              />
              <Route
                path="/documents/pending"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <PendingDocumentsPage />
                  </Suspense>
                }
              />
            </Route>

            {/* ADMIN + MANAGER */}
            <Route element={<ProtectedRoute roles={['ADMIN', 'MANAGER']} />}>
              <Route
                path="/incidents"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <IncidentsPage />
                  </Suspense>
                }
              />
              <Route
                path="/epi-deliveries"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <EpiDeliveriesPage />
                  </Suspense>
                }
              />
            </Route>

            {/* WORKER only */}
            <Route element={<ProtectedRoute roles={['WORKER']} />}>
              <Route
                path="/my-documents"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <MyDocumentsPage />
                  </Suspense>
                }
              />
              <Route
                path="/my-epis"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <MyEpisPage />
                  </Suspense>
                }
              />
            </Route>

            {/* Any authenticated user */}
            <Route
              path="/my-incidents"
              element={
                <Suspense fallback={<PageLoader />}>
                  <MyIncidentsPage />
                </Suspense>
              }
            />
            <Route
              path="/notifications"
              element={
                <Suspense fallback={<PageLoader />}>
                  <NotificationsPage />
                </Suspense>
              }
            />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
