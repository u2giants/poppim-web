import { useAppState, type ColorBy, type GroupBy } from '@/lib/appState'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuTrigger,
  DropdownMenuCheckboxItem, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuLabel,
} from '@/components/ui/dropdown-menu'
import { Search, X } from 'lucide-react'
import { buildInfo, formatCommitDateInNewYork } from '@/lib/buildInfo'
import { useEffect, useRef, useState } from 'react'
import { fetchLicensors } from '@/domain/reference/api'
import { fetchListFacets, type ListFacet } from '@/features/pipeline/api'
import type { Licensor } from '@/lib/types'
import { useAuth } from '@/auth/auth'
import type { BusinessUnitFilter } from '@/lib/appState'

const COLOR_OPTIONS: { value: ColorBy; label: string }[] = [
  { value: 'category',  label: 'Category' },
  { value: 'licensor',  label: 'Licensor' },
  { value: 'stage',     label: 'Stage' },
  { value: 'priority',  label: 'Priority' },
  { value: 'none',      label: 'None' },
]

const GROUP_OPTIONS: { value: GroupBy; label: string }[] = [
  { value: 'stage',    label: 'Stage' },
  { value: 'list',     label: 'List' },
  { value: 'folder',   label: 'Folder' },
  { value: 'licensor', label: 'Licensor' },
  { value: 'priority', label: 'Priority' },
  { value: 'assignee', label: 'Assignee' },
]

const BUSINESS_UNITS: { value: BusinessUnitFilter; label: string }[] = [
  { value: 'Licensed', label: 'Licensed' },
  { value: 'Generic', label: 'Generic' },
  { value: 'Software', label: 'Software' },
]

// Group list facets under their folder, preserving the count-desc order within
// each folder; folders are ordered by their largest list.
function groupFacetsByFolder(facets: ListFacet[]): Array<{ folder: string | null; lists: ListFacet[] }> {
  const order: (string | null)[] = []
  const byFolder = new Map<string | null, ListFacet[]>()
  for (const f of facets) {
    if (!byFolder.has(f.folderName)) {
      byFolder.set(f.folderName, [])
      order.push(f.folderName)
    }
    byFolder.get(f.folderName)!.push(f)
  }
  return order.map((folder) => ({ folder, lists: byFolder.get(folder)! }))
}

export function Topbar() {
  const {
    screen, pipelineView, setPipelineView,
    colorBy, setColorBy,
    groupBy, setGroupBy,
    businessUnit, setBusinessUnit,
    filterLicensorIds, setFilterLicensorIds,
    filterListNames, setFilterListNames,
    searchQuery, setSearchQuery,
  } = useAppState()
  const { user } = useAuth()
  const [licensors, setLicensors] = useState<Licensor[]>([])
  const [listFacets, setListFacets] = useState<ListFacet[]>([])
  const [searchOpen, setSearchOpen] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { if (searchOpen) searchInputRef.current?.focus() }, [searchOpen])

  function openSearch() { setSearchOpen(true) }
  function closeSearch() { setSearchOpen(false); setSearchQuery('') }

  function toggleList(name: string) {
    const next = new Set(filterListNames)
    if (next.has(name)) next.delete(name)
    else next.add(name)
    setFilterListNames(next)
  }

  const isPipeline = screen === 'pipeline'
  const showsBusinessUnit = screen === 'home'
    || screen === 'pipeline'
    || screen === 'designs'
    || screen === 'collections'
    || screen === 'orders'
    || screen === 'reports'
    || screen === 'submissions'
    || screen === 'samples'
    || screen === 'revisions'
  const commitDate = formatCommitDateInNewYork(buildInfo.commitDateIso)

  useEffect(() => {
    if (!isPipeline) return
    fetchLicensors().then(setLicensors).catch(() => setLicensors([]))
  }, [isPipeline])

  useEffect(() => {
    if (!isPipeline) return
    fetchListFacets(businessUnit).then(setListFacets).catch(() => setListFacets([]))
  }, [isPipeline, businessUnit])

  function toggleLicensor(id: string) {
    const next = new Set(filterLicensorIds)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setFilterLicensorIds(next)
  }

  const initials = [user?.first_name, user?.last_name]
    .filter(Boolean)
    .map((part) => part?.[0]?.toUpperCase())
    .join('') || user?.email?.[0]?.toUpperCase() || 'U'

  return (
    <header
      className="flex h-[72px] shrink-0 items-center gap-3 px-6"
      style={{ borderBottom: '1px solid #EAEEF5', background: '#fff' }}
    >
      {/* Business unit + pipeline controls */}
      {showsBusinessUnit && (
        <>
          <div className="flex items-center rounded-[10px] p-1" style={{ background: '#F6F8FC' }}>
            {BUSINESS_UNITS.map((b) => (
              <button
                key={b.value}
                onClick={() => { setBusinessUnit(b.value); setFilterListNames(new Set()) }}
                className="rounded-lg px-3.5 py-1.5 text-[13px] font-medium transition-all"
                style={
                  businessUnit === b.value
                    ? { background: '#fff', color: '#1B2840', boxShadow: '0 1px 4px rgba(20,40,80,0.10)' }
                    : { color: '#5A6883' }
                }
              >
                {b.label}
              </button>
            ))}
          </div>
        </>
      )}
      {isPipeline && (
        <>
          <div className="flex items-center rounded-[10px] p-1" style={{ background: '#F6F8FC' }}>
            {(['table', 'kanban'] as const).map((v) => (
              <button
                key={v}
                onClick={() => setPipelineView(v)}
                className="rounded-lg px-3.5 py-1.5 text-[13px] font-medium transition-all"
                style={
                  pipelineView === v
                    ? { background: '#fff', color: '#1B2840', boxShadow: '0 1px 4px rgba(20,40,80,0.10)' }
                    : { color: '#5A6883' }
                }
              >
                {v === 'table' ? 'Table view' : 'Kanban board'}
              </button>
            ))}
          </div>
        </>
      )}

      <div className="flex-1" />

      <div
        className="hidden min-w-[178px] max-w-[240px] shrink-0 flex-col justify-center rounded-md border px-2.5 py-1 text-[10.5px] leading-tight lg:flex"
        style={{ borderColor: '#EAEEF5', background: '#F6F8FC', color: '#5A6883' }}
        title={`Commit ${buildInfo.gitSha} · ${commitDate}`}
      >
        <span className="font-mono font-semibold" style={{ color: '#1B2840' }}>
          {buildInfo.shortGitSha}
        </span>
        <span className="truncate">{commitDate}</span>
      </div>

      {/* Search */}
      {searchOpen ? (
        <div
          className="flex items-center gap-2 rounded-[10px] border px-3 py-1.5"
          style={{ borderColor: '#0094FF', background: '#fff', minWidth: 220 }}
        >
          <Search className="size-4 shrink-0" style={{ color: '#0094FF' }} />
          <input
            ref={searchInputRef}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Escape') closeSearch() }}
            onBlur={() => { if (!searchQuery) setSearchOpen(false) }}
            placeholder="Search products…"
            className="w-full bg-transparent text-[13.5px] outline-none"
            style={{ color: '#1B2840' }}
          />
          <button onClick={closeSearch} className="shrink-0 transition-colors hover:text-[#1B2840]" style={{ color: '#94A0B5' }}>
            <X className="size-3.5" />
          </button>
        </div>
      ) : (
        <button
          className="flex items-center justify-center rounded-lg p-2 transition-colors hover:bg-[#F6F8FC]"
          title="Search (⌘F)"
          onClick={openSearch}
        >
          <Search className="size-[18px]" style={{ color: '#5A6883' }} />
        </button>
      )}

      {/* Pipeline-only controls: Group, Filter, Color */}
      {isPipeline && (
        <>
          {/* Group */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="flex items-center gap-1.5 rounded-[10px] border px-3.5 py-2 text-[13px] font-medium transition-colors hover:bg-[#F6F8FC]"
                style={{ borderColor: '#EAEEF5', color: '#5A6883' }}
              >
                <svg className="size-3.5" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="1" y="2" width="12" height="3" rx="1" />
                  <rect x="1" y="7" width="8" height="3" rx="1" />
                  <rect x="1" y="12" width="5" height="1.5" rx="0.75" />
                </svg>
                Group
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuLabel>Group by</DropdownMenuLabel>
              <DropdownMenuRadioGroup value={groupBy} onValueChange={(v) => setGroupBy(v as GroupBy)}>
                {GROUP_OPTIONS.map((o) => (
                  <DropdownMenuRadioItem key={o.value} value={o.value}>{o.label}</DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* List filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="flex items-center gap-1.5 rounded-[10px] border px-3.5 py-2 text-[13px] font-medium transition-colors hover:bg-[#F6F8FC]"
                style={{ borderColor: '#EAEEF5', color: '#5A6883' }}
              >
                <svg className="size-3.5" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M5 3h8M5 7h8M5 11h8" strokeLinecap="round" />
                  <circle cx="2" cy="3" r="1" fill="currentColor" stroke="none" />
                  <circle cx="2" cy="7" r="1" fill="currentColor" stroke="none" />
                  <circle cx="2" cy="11" r="1" fill="currentColor" stroke="none" />
                </svg>
                List
                {filterListNames.size > 0 && (
                  <span
                    className="flex size-4 items-center justify-center rounded-full text-[10px] font-bold text-white"
                    style={{ background: '#0094FF' }}
                  >
                    {filterListNames.size}
                  </span>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="max-h-[70vh] w-72 overflow-y-auto">
              <div className="flex items-center justify-between px-2 py-1.5">
                <DropdownMenuLabel className="p-0">List</DropdownMenuLabel>
                {filterListNames.size > 0 && (
                  <button
                    className="text-[11px] font-semibold transition-colors hover:text-[#1B2840]"
                    style={{ color: '#0094FF' }}
                    onClick={() => setFilterListNames(new Set())}
                  >
                    Clear
                  </button>
                )}
              </div>
              {groupFacetsByFolder(listFacets).map(({ folder, lists }) => (
                <div key={folder ?? '__none__'}>
                  <div className="px-2 pt-1.5 pb-0.5 text-[10.5px] font-bold uppercase tracking-[0.04em]" style={{ color: '#94A0B5' }}>
                    {folder ?? 'No folder'}
                  </div>
                  {lists.map((l) => (
                    <DropdownMenuCheckboxItem
                      key={l.listName}
                      checked={filterListNames.has(l.listName)}
                      onCheckedChange={() => toggleList(l.listName)}
                      onSelect={(e) => e.preventDefault()}
                    >
                      <span className="flex w-full items-center justify-between gap-2">
                        <span className="truncate">{l.listName}</span>
                        <span className="shrink-0 text-[11px]" style={{ color: '#94A0B5' }}>{l.count.toLocaleString()}</span>
                      </span>
                    </DropdownMenuCheckboxItem>
                  ))}
                </div>
              ))}
              {listFacets.length === 0 && (
                <div className="px-2 py-1.5 text-[12px]" style={{ color: '#94A0B5' }}>
                  No lists loaded
                </div>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="flex items-center gap-1.5 rounded-[10px] border px-3.5 py-2 text-[13px] font-medium transition-colors hover:bg-[#F6F8FC]"
                style={{ borderColor: '#EAEEF5', color: '#5A6883' }}
              >
                <svg className="size-3.5" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M1 3h12M3 7h8M5 11h4" strokeLinecap="round" />
                </svg>
                Filter
                {filterLicensorIds.size > 0 && (
                  <span
                    className="flex size-4 items-center justify-center rounded-full text-[10px] font-bold text-white"
                    style={{ background: '#0094FF' }}
                  >
                    {filterLicensorIds.size}
                  </span>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuLabel>Licensor</DropdownMenuLabel>
              {licensors.map((l) => (
                <DropdownMenuCheckboxItem
                  key={l.id}
                  checked={filterLicensorIds.has(l.id)}
                  onCheckedChange={() => toggleLicensor(l.id)}
                  onSelect={(e) => e.preventDefault()}
                >
                  {l.name}
                </DropdownMenuCheckboxItem>
              ))}
              {licensors.length === 0 && (
                <div className="px-2 py-1.5 text-[12px]" style={{ color: '#94A0B5' }}>
                  No licensors loaded
                </div>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Color */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="flex items-center gap-1.5 rounded-[10px] border px-3.5 py-2 text-[13px] font-medium transition-colors hover:bg-[#F6F8FC]"
                style={{ borderColor: '#EAEEF5', color: '#5A6883' }}
              >
                <svg className="size-3.5" viewBox="0 0 14 14" fill="none">
                  <circle cx="4" cy="4" r="2.5" fill="#4F9DF7" />
                  <circle cx="10" cy="4" r="2.5" fill="#F0564B" />
                  <circle cx="4" cy="10" r="2.5" fill="#3F9A50" />
                  <circle cx="10" cy="10" r="2.5" fill="#F59E0B" />
                </svg>
                Color
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuLabel>Color cards by</DropdownMenuLabel>
              <DropdownMenuRadioGroup value={colorBy} onValueChange={(v) => setColorBy(v as ColorBy)}>
                {COLOR_OPTIONS.map((o) => (
                  <DropdownMenuRadioItem key={o.value} value={o.value}>{o.label}</DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      )}

      {/* User avatar */}
      <button
        className="flex size-9 shrink-0 items-center justify-center rounded-full text-[13px] font-bold text-white"
        style={{ background: 'linear-gradient(135deg,#FF9F43,#F47B20)' }}
        title={user?.email ?? undefined}
      >
        {initials}
      </button>
    </header>
  )
}
