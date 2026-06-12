import { createContext, useContext, useState, type ReactNode } from 'react'

export type Screen = 'pipeline' | 'schedule' | 'notes' | 'people' | 'mywork' | 'settings'
export type PipelineView = 'kanban' | 'table'
export type ColorBy = 'category' | 'licensor' | 'stage' | 'priority' | 'none'
export type GroupBy = 'stage' | 'licensor' | 'priority' | 'assignee'

interface AppState {
  screen: Screen
  setScreen: (s: Screen) => void
  pipelineView: PipelineView
  setPipelineView: (v: PipelineView) => void
  colorBy: ColorBy
  setColorBy: (c: ColorBy) => void
  groupBy: GroupBy
  setGroupBy: (g: GroupBy) => void
  searchQuery: string
  setSearchQuery: (q: string) => void
  filterLicensors: Set<string>
  setFilterLicensors: (s: Set<string>) => void
}

const AppStateCtx = createContext<AppState | null>(null)

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [screen, setScreen] = useState<Screen>('pipeline')
  const [pipelineView, setPipelineView] = useState<PipelineView>('kanban')
  const [colorBy, setColorBy] = useState<ColorBy>('category')
  const [groupBy, setGroupBy] = useState<GroupBy>('stage')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterLicensors, setFilterLicensors] = useState<Set<string>>(new Set())

  return (
    <AppStateCtx.Provider value={{
      screen, setScreen,
      pipelineView, setPipelineView,
      colorBy, setColorBy,
      groupBy, setGroupBy,
      searchQuery, setSearchQuery,
      filterLicensors, setFilterLicensors,
    }}>
      {children}
    </AppStateCtx.Provider>
  )
}

export function useAppState() {
  const ctx = useContext(AppStateCtx)
  if (!ctx) throw new Error('useAppState must be used within AppStateProvider')
  return ctx
}
