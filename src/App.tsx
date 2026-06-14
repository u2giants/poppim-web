import { AuthProvider, useAuth } from '@/auth/auth'
import { AppStateProvider, useAppState } from '@/lib/appState'
import { AppShell } from '@/components/AppShell'
import { LoginPage } from '@/pages/LoginPage'
import { ControlRoomPage } from '@/features/control-room/ControlRoomPage'
import { PipelinePage } from '@/features/pipeline/PipelinePage'
import { ProjectsPage } from '@/features/projects/ProjectsPage'
import { DesignLibraryPage } from '@/features/designs/DesignLibraryPage'
import { DesignCollectionsPage } from '@/features/designs/DesignCollectionsPage'
import { OrdersPage } from '@/features/orders/OrdersPage'
import { AccountsPage } from '@/features/accounts/AccountsPage'
import { ReportsPage } from '@/features/reports/ReportsPage'
import { SubmissionsPage } from '@/features/submissions/SubmissionsPage'
import { SamplesPage } from '@/features/samples/SamplesPage'
import { RevisionsPage } from '@/features/revisions/RevisionsPage'
import { SchedulePage } from '@/features/schedule/SchedulePage'
import { NotesPage } from '@/features/notes/NotesPage'
import { PeoplePage } from '@/features/people/PeoplePage'
import { MyWorkPage } from '@/features/mywork/MyWorkPage'
import { SettingsPage } from '@/features/settings/SettingsPage'

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
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-svh items-center justify-center text-sm" style={{ color: '#94A0B5' }}>
        Loading…
      </div>
    )
  }
  if (!user) return <LoginPage />

  return (
    <AppStateProvider>
      <AppShell>
        <ActiveScreen />
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
