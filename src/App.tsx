import { AuthProvider, useAuth } from '@/auth/auth'
import { AppStateProvider, useAppState } from '@/lib/appState'
import { AppShell } from '@/components/AppShell'
import { LoginPage } from '@/pages/LoginPage'
import { PipelinePage } from '@/features/pipeline/PipelinePage'
import { SchedulePage } from '@/features/schedule/SchedulePage'
import { NotesPage } from '@/features/notes/NotesPage'
import { PeoplePage } from '@/features/people/PeoplePage'
import { MyWorkPage } from '@/features/mywork/MyWorkPage'
import { SettingsPage } from '@/features/settings/SettingsPage'

function ActiveScreen() {
  const { screen } = useAppState()

  switch (screen) {
    case 'pipeline': return <PipelinePage />
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
