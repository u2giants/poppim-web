import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const source = readFileSync(new URL('./App.tsx', import.meta.url), 'utf8')

describe('top-level screen loading', () => {
  it('keeps every named business screen behind React.lazy', () => {
    const screens = [
      'ControlRoomPage', 'PipelinePage', 'ProjectsPage', 'DesignLibraryPage',
      'DesignCollectionsPage', 'OrdersPage', 'AccountsPage', 'ReportsPage',
      'SubmissionsPage', 'SamplesPage', 'RevisionsPage', 'SchedulePage',
      'NotesPage', 'PeoplePage', 'MyWorkPage', 'SettingsPage',
    ]
    for (const screen of screens) {
      expect(source).toContain(`const ${screen} = lazy(`)
    }
    expect(source).toContain('<Suspense fallback={<ScreenFallback />}>')
    expect(source).toContain('role="status">Loading screen…</div>')
    expect(source).toContain('<ActiveScreen />')
  })
})
