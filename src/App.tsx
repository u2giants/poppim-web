import { lazy, Suspense } from 'react'
import { AuthProvider, useAuth } from '@/auth/auth'
import { AppStateProvider, useAppState } from '@/lib/appState'
import { AppShell } from '@/components/AppShell'
import { LoginPage } from '@/pages/LoginPage'
const ControlRoomPage = lazy(() => import('@/features/control-room/ControlRoomPage').then((module) => ({ default: module.ControlRoomPage })))
const PipelinePage = lazy(() => import('@/features/pipeline/PipelinePage').then((module) => ({ default: module.PipelinePage })))
const ProjectsPage = lazy(() => import('@/features/projects/ProjectsPage').then((module) => ({ default: module.ProjectsPage })))
const DesignLibraryPage = lazy(() => import('@/features/designs/DesignLibraryPage').then((module) => ({ default: module.DesignLibraryPage })))
const DesignCollectionsPage = lazy(() => import('@/features/designs/DesignCollectionsPage').then((module) => ({ default: module.DesignCollectionsPage })))
const OrdersPage = lazy(() => import('@/features/orders/OrdersPage').then((module) => ({ default: module.OrdersPage })))
const AccountsPage = lazy(() => import('@/features/accounts/AccountsPage').then((module) => ({ default: module.AccountsPage })))
const ReportsPage = lazy(() => import('@/features/reports/ReportsPage').then((module) => ({ default: module.ReportsPage })))
const SubmissionsPage = lazy(() => import('@/features/submissions/SubmissionsPage').then((module) => ({ default: module.SubmissionsPage })))
const SamplesPage = lazy(() => import('@/features/samples/SamplesPage').then((module) => ({ default: module.SamplesPage })))
const RevisionsPage = lazy(() => import('@/features/revisions/RevisionsPage').then((module) => ({ default: module.RevisionsPage })))
const SchedulePage = lazy(() => import('@/features/schedule/SchedulePage').then((module) => ({ default: module.SchedulePage })))
const NotesPage = lazy(() => import('@/features/notes/NotesPage').then((module) => ({ default: module.NotesPage })))
const PeoplePage = lazy(() => import('@/features/people/PeoplePage').then((module) => ({ default: module.PeoplePage })))
const MyWorkPage = lazy(() => import('@/features/mywork/MyWorkPage').then((module) => ({ default: module.MyWorkPage })))
const SettingsPage = lazy(() => import('@/features/settings/SettingsPage').then((module) => ({ default: module.SettingsPage })))

function ScreenFallback() {
  return <div className="flex h-full items-center justify-center p-8 text-sm text-muted-foreground" role="status">Loading screen…</div>
}

function ActiveScreen() {
  const { screen } = useAppState()

  switch (screen) {
    case 'home':     return <ControlRoomPage />
    case 'pipeline': return <PipelinePage />
    case 'projects': return <ProjectsPage />
    case 'designs':  return <DesignLibraryPage />
    case 'collections': return <DesignCollectionsPage />
    case 'orders':   return <OrdersPage />
    case 'accounts': return <AccountsPage />
    case 'reports':  return <ReportsPage />
    case 'submissions': return <SubmissionsPage />
    case 'samples':  return <SamplesPage />
    case 'revisions': return <RevisionsPage />
    case 'schedule': return <SchedulePage />
    case 'notes':    return <NotesPage />
    case 'people':   return <PeoplePage />
    case 'mywork':   return <MyWorkPage />
    case 'settings': return <SettingsPage />
  }
}

function Gate() {
  const { user, status, refresh, logout } = useAuth()

  if (status === 'loading') {
    return (
      <div className="flex min-h-svh items-center justify-center text-sm" style={{ color: '#94A0B5' }}>
        Loading…
      </div>
    )
  }
  if (status === 'profile_error' || status === 'profile_missing') {
    return (
      <div className="flex min-h-svh items-center justify-center bg-muted/40 p-4">
        <div className="w-full max-w-md rounded-xl border bg-white p-6 text-center shadow-sm">
          <h1 className="text-lg font-semibold text-[#1B2840]">
            {status === 'profile_missing' ? 'Your PIM profile is not set up' : 'We could not load your PIM profile'}
          </h1>
          <p className="mt-2 text-sm text-[#5A6883]">
            {status === 'profile_missing'
              ? 'Your Microsoft sign-in is valid, but it is not linked to a POP PIM profile. Contact an administrator or sign out.'
              : 'The profile service may be temporarily unavailable. Retry now or sign out.'}
          </p>
          <div className="mt-5 flex justify-center gap-3">
            <button className="rounded-md bg-[#0094FF] px-4 py-2 text-sm font-semibold text-white" onClick={() => void refresh()}>
              Retry
            </button>
            <button className="rounded-md border px-4 py-2 text-sm font-semibold text-[#5A6883]" onClick={() => void logout()}>
              Sign out
            </button>
          </div>
        </div>
      </div>
    )
  }
  if (status === 'signed_out' || !user) return <LoginPage />

  return (
    <AppStateProvider>
      <AppShell>
        <Suspense fallback={<ScreenFallback />}>
          <ActiveScreen />
        </Suspense>
      </AppShell>
    </AppStateProvider>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <Gate />
    </AuthProvider>
  )
}
