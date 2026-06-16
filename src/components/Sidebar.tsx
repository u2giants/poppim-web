import { useEffect, useMemo, useState } from 'react'
import { useAppState, type Screen } from '@/lib/appState'
import { BarChart3, Briefcase, Building2, CheckSquare, ChevronDown, ChevronRight, Factory, FilePenLine, Folder, Gauge, Images, Layers3, List, ReceiptText, Search, Send, Settings, UserCheck } from 'lucide-react'
import popLogo from '@/assets/pop-logo.png'
import { fetchHierarchyFacets, type HierarchyFacet } from '@/features/pipeline/api'
import { spaceToBusinessUnit } from '@/domain/products/adapters'
import type { BusinessUnit } from '@/domain/products/types'

const NAV_ITEMS: { screen: Screen; icon: typeof CheckSquare; label: string }[] = [
  { screen: 'home', icon: Gauge, label: 'Control room' },
  { screen: 'pipeline', icon: CheckSquare, label: 'Product pipeline' },
  { screen: 'projects', icon: Briefcase, label: 'Projects / offers' },
  { screen: 'designs', icon: Images, label: 'Design library' },
  { screen: 'collections', icon: Layers3, label: 'Design collections' },
  { screen: 'submissions', icon: Send, label: 'Submissions' },
  { screen: 'samples', icon: Factory, label: 'Samples / factory' },
  { screen: 'revisions', icon: FilePenLine, label: 'Reviews / revisions' },
  { screen: 'orders', icon: ReceiptText, label: 'Orders' },
  { screen: 'accounts', icon: Building2, label: 'Accounts' },
  { screen: 'reports', icon: BarChart3, label: 'Reports' },
  { screen: 'mywork', icon: UserCheck, label: 'My work' },
]

export function Sidebar() {
  const { screen, setScreen, searchQuery, setSearchQuery } = useAppState()

  return (
    <aside className="flex h-full w-[236px] shrink-0 flex-col overflow-hidden" style={{ background: '#16243F' }}>
      <div className="flex items-center gap-2.5 px-4 py-3.5">
        <div className="flex size-[34px] shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white">
          <img src={popLogo} alt="POP" className="size-5 object-contain" style={{ filter: 'hue-rotate(202deg) saturate(1.45)' }} />
        </div>
        <span className="flex-1 truncate text-[15px] font-bold text-white">POP Creations</span>
        <ChevronDown className="size-4 shrink-0" style={{ color: '#94A3C0' }} />
      </div>

      <div className="px-3 pb-2">
        <div className="flex items-center gap-2 rounded-lg px-3 py-2" style={{ background: 'rgba(255,255,255,0.06)' }}>
          <Search className="size-3.5 shrink-0" style={{ color: '#94A3C0' }} />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search..."
            className="min-w-0 flex-1 bg-transparent text-[13px] text-white outline-none placeholder:text-[#94A3C0]"
          />
        </div>
      </div>

      <div className="mx-4 my-2" style={{ height: 1, background: 'rgba(255,255,255,0.08)' }} />

      <div className="min-h-0 flex-1 overflow-y-auto px-2">
        <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.06em]" style={{ color: '#5A6883' }}>
          Workflows
        </div>
        <div className="space-y-0.5">
          {NAV_ITEMS.map(({ screen: s, icon: Icon, label }) => (
            <SidebarRow key={s} active={screen === s} onClick={() => setScreen(s)}>
              <Icon className="size-4 shrink-0" style={{ color: screen === s ? '#fff' : '#94A3C0' }} />
              <span className="truncate text-[13px]" style={{ color: screen === s ? '#fff' : '#94A3C0' }}>
                {label}
              </span>
            </SidebarRow>
          ))}
        </div>

        <SpacesTree />
      </div>

      <div className="flex items-center justify-between px-3 py-3" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="flex items-center gap-1">
          {NAV_ITEMS.map(({ screen: s, icon: Icon, label }) => (
            <button
              key={s}
              title={label}
              onClick={() => setScreen(s)}
              className="flex items-center justify-center rounded-lg p-2 transition-colors"
              style={{ background: screen === s ? 'rgba(255,255,255,0.12)' : 'transparent' }}
            >
              <Icon className="size-4" style={{ color: screen === s ? '#0094FF' : '#94A3C0' }} />
            </button>
          ))}
        </div>
        <button
          title="Settings"
          onClick={() => setScreen('settings')}
          className="flex items-center justify-center rounded-lg p-2 transition-colors"
          style={{ background: screen === 'settings' ? 'rgba(255,255,255,0.12)' : 'transparent' }}
        >
          <Settings className="size-4" style={{ color: screen === 'settings' ? '#0094FF' : '#94A3C0' }} />
        </button>
      </div>
    </aside>
  )
}

// ─── Spaces tree (ClickUp-style space > folder > list navigation) ─────────────

interface TreeList { listName: string; count: number }
interface TreeFolder { folderName: string | null; lists: TreeList[]; count: number }
interface TreeSpace { spaceName: string; businessUnit: BusinessUnit; folders: TreeFolder[]; count: number }

const BU_ORDER: Record<BusinessUnit, number> = { Licensed: 0, Generic: 1, Software: 2, Unknown: 3 }

function buildTree(facets: HierarchyFacet[]): TreeSpace[] {
  const spaces = new Map<string, TreeSpace>()
  for (const f of facets) {
    const spaceName = f.spaceName ?? 'Other'
    let space = spaces.get(spaceName)
    if (!space) {
      space = { spaceName, businessUnit: spaceToBusinessUnit(f.spaceName), folders: [], count: 0 }
      spaces.set(spaceName, space)
    }
    let folder = space.folders.find((fo) => fo.folderName === f.folderName)
    if (!folder) {
      folder = { folderName: f.folderName, lists: [], count: 0 }
      space.folders.push(folder)
    }
    folder.lists.push({ listName: f.listName, count: f.count })
    folder.count += f.count
    space.count += f.count
  }
  for (const space of spaces.values()) {
    // folderless lists (null) sort last; named folders by count desc
    space.folders.sort((a, b) => {
      if ((a.folderName === null) !== (b.folderName === null)) return a.folderName === null ? 1 : -1
      return b.count - a.count
    })
    for (const folder of space.folders) folder.lists.sort((a, b) => b.count - a.count)
  }
  return [...spaces.values()].sort((a, b) => BU_ORDER[a.businessUnit] - BU_ORDER[b.businessUnit])
}

function SpacesTree() {
  const { screen, setScreen, businessUnit, setBusinessUnit, filterListNames, setFilterListNames } = useAppState()
  const [facets, setFacets] = useState<HierarchyFacet[]>([])
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [seeded, setSeeded] = useState(false)

  useEffect(() => {
    fetchHierarchyFacets().then(setFacets).catch(() => setFacets([]))
  }, [])

  const tree = useMemo(() => buildTree(facets), [facets])

  // On first load, expand the space + its folders for the active department.
  useEffect(() => {
    if (seeded || tree.length === 0) return
    const active = tree.find((s) => s.businessUnit === businessUnit)
    if (active) {
      const keys = new Set<string>([`s:${active.spaceName}`])
      for (const folder of active.folders) if (folder.folderName) keys.add(`f:${active.spaceName}:${folder.folderName}`)
      setExpanded(keys)
    }
    setSeeded(true)
  }, [tree, seeded, businessUnit])

  function toggle(key: string) {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  function openList(space: TreeSpace, listName: string) {
    if (space.businessUnit !== 'Unknown') setBusinessUnit(space.businessUnit)
    setScreen('pipeline')
    setFilterListNames(new Set([listName]))
  }

  function isActiveList(listName: string): boolean {
    return screen === 'pipeline' && filterListNames.has(listName)
  }

  if (tree.length === 0) return null

  return (
    <div className="mt-3">
      <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.06em]" style={{ color: '#5A6883' }}>
        Spaces
      </div>
      <div className="space-y-0.5">
        {tree.map((space) => {
          const spaceKey = `s:${space.spaceName}`
          const spaceOpen = expanded.has(spaceKey)
          return (
            <div key={spaceKey}>
              <TreeRow depth={0} open={spaceOpen} onToggle={() => toggle(spaceKey)} count={space.count}>
                <span className="truncate text-[13px] font-semibold" style={{ color: '#fff' }}>{space.spaceName}</span>
              </TreeRow>
              {spaceOpen && space.folders.map((folder) => {
                // Folderless lists render directly under the space.
                if (folder.folderName === null) {
                  return folder.lists.map((l) => (
                    <TreeLeaf
                      key={`l:${space.spaceName}:${l.listName}`}
                      depth={1}
                      active={isActiveList(l.listName)}
                      count={l.count}
                      onClick={() => openList(space, l.listName)}
                    >
                      <List className="size-3.5 shrink-0" style={{ color: isActiveList(l.listName) ? '#fff' : '#94A3C0' }} />
                      <span className="truncate text-[12.5px]" style={{ color: isActiveList(l.listName) ? '#fff' : '#C7D0E0' }}>{l.listName}</span>
                    </TreeLeaf>
                  ))
                }
                const folderKey = `f:${space.spaceName}:${folder.folderName}`
                const folderOpen = expanded.has(folderKey)
                return (
                  <div key={folderKey}>
                    <TreeRow depth={1} open={folderOpen} onToggle={() => toggle(folderKey)} count={folder.count} icon={<Folder className="size-3.5 shrink-0" style={{ color: '#94A3C0' }} />}>
                      <span className="truncate text-[12.5px] font-medium" style={{ color: '#C7D0E0' }}>{folder.folderName}</span>
                    </TreeRow>
                    {folderOpen && folder.lists.map((l) => (
                      <TreeLeaf
                        key={`l:${space.spaceName}:${l.listName}`}
                        depth={2}
                        active={isActiveList(l.listName)}
                        count={l.count}
                        onClick={() => openList(space, l.listName)}
                      >
                        <List className="size-3.5 shrink-0" style={{ color: isActiveList(l.listName) ? '#fff' : '#94A3C0' }} />
                        <span className="truncate text-[12.5px]" style={{ color: isActiveList(l.listName) ? '#fff' : '#C7D0E0' }}>{l.listName}</span>
                      </TreeLeaf>
                    ))}
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function TreeRow({
  depth,
  open,
  onToggle,
  count,
  icon,
  children,
}: {
  depth: number
  open: boolean
  onToggle: () => void
  count: number
  icon?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div
      onClick={onToggle}
      className="flex cursor-pointer items-center gap-1.5 rounded-lg py-1.5 pr-2 transition-colors"
      style={{ paddingLeft: 12 + depth * 14 }}
      onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)' }}
      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
    >
      {open
        ? <ChevronDown className="size-3.5 shrink-0" style={{ color: '#94A3C0' }} />
        : <ChevronRight className="size-3.5 shrink-0" style={{ color: '#94A3C0' }} />}
      {icon}
      {children}
      <span className="ml-auto shrink-0 text-[10.5px] font-semibold" style={{ color: '#5A6883' }}>{count.toLocaleString()}</span>
    </div>
  )
}

function TreeLeaf({
  depth,
  active,
  count,
  onClick,
  children,
}: {
  depth: number
  active: boolean
  count: number
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <div
      onClick={onClick}
      className="flex cursor-pointer items-center gap-1.5 rounded-lg py-1.5 pr-2 transition-colors"
      style={{ paddingLeft: 12 + depth * 14, background: active ? '#0094FF' : 'transparent' }}
      onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.06)' }}
      onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = 'transparent' }}
    >
      {children}
      <span className="ml-auto shrink-0 text-[10.5px] font-semibold" style={{ color: active ? 'rgba(255,255,255,0.7)' : '#5A6883' }}>{count.toLocaleString()}</span>
    </div>
  )
}

function SidebarRow({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick?: () => void
  children: React.ReactNode
}) {
  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-2.5 rounded-lg px-3 py-2 ${onClick ? 'cursor-pointer' : ''} transition-colors`}
      style={{
        background: active ? '#0094FF' : 'transparent',
        borderLeft: active ? '2px solid rgba(255,255,255,0.4)' : '2px solid transparent',
      }}
      onMouseEnter={(e) => { if (!active && onClick) e.currentTarget.style.background = 'rgba(255,255,255,0.06)' }}
      onMouseLeave={(e) => { if (!active && onClick) e.currentTarget.style.background = 'transparent' }}
    >
      {children}
    </div>
  )
}
