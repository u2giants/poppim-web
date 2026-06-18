import { createContext, useContext, useState, type ReactNode } from 'react'
import type { BusinessUnit } from '@/domain/products/types'

export type Screen =
  | 'home'
  | 'pipeline'
  | 'projects'
  | 'designs'
  | 'collections'
  | 'orders'
  | 'accounts'
  | 'reports'
  | 'submissions'
  | 'samples'
  | 'revisions'
  | 'schedule'
  | 'notes'
  | 'people'
  | 'mywork'
  | 'settings'
export type PipelineView = 'kanban' | 'table'
export type ColorBy = 'category' | 'licensor' | 'stage' | 'priority' | 'none'
export type GroupBy = 'stage' | 'licensor' | 'priority' | 'assignee' | 'list' | 'folder'
export type BusinessUnitFilter = Exclude<BusinessUnit, 'Unknown'>

interface AppState {
  screen: Screen
  setScreen: (s: Screen) => void
  pipelineView: PipelineView
  setPipelineView: (v: PipelineView) => void
  colorBy: ColorBy
  setColorBy: (c: ColorBy) => void
  groupBy: GroupBy
  setGroupBy: (g: GroupBy) => void
  businessUnit: BusinessUnitFilter
  setBusinessUnit: (b: BusinessUnitFilter) => void
  searchQuery: string
  setSearchQuery: (q: string) => void
  filterLicensorIds: Set<string>
  setFilterLicensorIds: (s: Set<string>) => void
  filterListNames: Set<string>
  setFilterListNames: (s: Set<string>) => void
  activeViewId: string | null
  setActiveViewId: (id: string | null) => void
  viewsRefreshKey: number
  bumpViewsRefresh: () => void
}

const AppStateCtx = createContext<AppState | null>(null)

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [screen, setScreen] = useState<Screen>('home')
  const [pipelineView, setPipelineView] = useState<PipelineView>('kanban')
  const [colorBy, setColorBy] = useState<ColorBy>('category')
  const [groupBy, setGroupBy] = useState<GroupBy>('stage')
  const [businessUnit, setBusinessUnit] = useState<BusinessUnitFilter>('Licensed')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterLicensorIds, setFilterLicensorIds] = useState<Set<string>>(new Set())
  const [filterListNames, setFilterListNames] = useState<Set<string>>(new Set())
  const [activeViewId, setActiveViewId] = useState<string | null>(null)
  const [viewsRefreshKey, setViewsRefreshKey] = useState(0)

  return (
    <AppStateCtx.Provider value={{
      screen, setScreen,
      pipelineView, setPipelineView,
      colorBy, setColorBy,
      groupBy, setGroupBy,
      businessUnit, setBusinessUnit,
      searchQuery, setSearchQuery,
      filterLicensorIds, setFilterLicensorIds,
      filterListNames, setFilterListNames,
      activeViewId, setActiveViewId,
      viewsRefreshKey, bumpViewsRefresh: () => setViewsRefreshKey((k) => k + 1),
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
