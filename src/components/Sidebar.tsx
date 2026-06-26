import { useEffect, useState } from 'react'
import { useAppState, type BusinessUnitFilter, type Screen } from '@/lib/appState'
import { BarChart3, Briefcase, Building2, CalendarDays, CheckSquare, ChevronDown, ChevronRight, Factory, FilePenLine, Gauge, Home, Images, Layers3, List, NotebookPen, ReceiptText, Search, Send, Settings, Trash2, UserCheck, Users } from 'lucide-react'
import popLogo from '@/assets/pop-logo.png'
import { useAuth } from '@/auth/auth'
import { fetchViews, fetchViewPrefs, upsertViewPref, deleteView } from '@/features/views/api'
import type { PmSavedView, PmViewPref, ViewFilters } from '@/lib/types'

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
  { screen: 'schedule', icon: CalendarDays, label: 'Schedule' },
  { screen: 'notes', icon: NotebookPen, label: 'Notes' },
  { screen: 'people', icon: Users, label: 'People' },
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

        <ViewsTree />
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

// ─── Views tree (Space = department > Master view + saved/shared views) ───────

const DEPTS: BusinessUnitFilter[] = ['Licensed', 'Generic', 'Software']
const SWATCHES = ['#0094FF', '#3F9A50', '#D24B83', '#DB6645', '#C8942A', '#6B54C9', '#239281', '#8C9BB5']

function viewOrder(v: PmSavedView, pref?: PmViewPref): number {
  return pref?.sort_order ?? v.sort_order ?? 9999
}

function ViewsTree() {
  const app = useAppState()
  const { user } = useAuth()
  const userId = user?.id ?? ''
  const [views, setViews] = useState<PmSavedView[]>([])
  const [prefs, setPrefs] = useState<Map<string, PmViewPref>>(new Map())
  const [expanded, setExpanded] = useState<Set<string>>(new Set([app.businessUnit]))
  const [menu, setMenu] = useState<{ id: string; owned: boolean; x: number; y: number } | null>(null)
  const [dragId, setDragId] = useState<string | null>(null)

  useEffect(() => {
    if (!userId) return
    fetchViews(userId).then(setViews).catch(() => setViews([]))
    fetchViewPrefs(userId).then((rows) => {
      const m = new Map<string, PmViewPref>()
      for (const p of rows) {
        const vid = typeof p.view === 'string' ? p.view : p.view?.id
        if (vid) m.set(vid, p)
      }
      setPrefs(m)
    }).catch(() => setPrefs(new Map()))
  }, [userId, app.viewsRefreshKey])

  useEffect(() => {
    if (!menu) return
    const close = () => setMenu(null)
    document.addEventListener('click', close)
    return () => document.removeEventListener('click', close)
  }, [menu])

  function toggle(dept: string) {
    setExpanded((p) => { const n = new Set(p); if (n.has(dept)) n.delete(dept); else n.add(dept); return n })
  }

  function viewsFor(dept: BusinessUnitFilter): PmSavedView[] {
    return views
      .filter((v) => v.business_unit === dept && !prefs.get(v.id)?.hidden)
      .sort((a, b) => viewOrder(a, prefs.get(a.id)) - viewOrder(b, prefs.get(b.id)) || (a.name ?? '').localeCompare(b.name ?? ''))
  }

  function applyMaster(dept: BusinessUnitFilter) {
    app.setBusinessUnit(dept)
    app.setSearchQuery('')
    app.setFilterLicensorIds(new Set())
    app.setFilterListNames(new Set())
    app.setScreen('pipeline')
    app.setActiveViewId(`master:${dept}`)
  }

  function applyView(v: PmSavedView) {
    const f = (v.filters_json ?? {}) as ViewFilters
    app.setBusinessUnit((v.business_unit as BusinessUnitFilter) ?? app.businessUnit)
    app.setSearchQuery(f.search ?? '')
    app.setFilterLicensorIds(new Set(f.licensorIds ?? []))
    app.setFilterListNames(new Set(f.listNames ?? []))
    if (f.groupBy) app.setGroupBy(f.groupBy as never)
    if (f.colorBy) app.setColorBy(f.colorBy as never)
    app.setScreen('pipeline')
    app.setActiveViewId(v.id)
  }

  function patchPref(viewId: string, patch: Partial<PmViewPref>) {
    setPrefs((p) => {
      const n = new Map(p)
      const cur = n.get(viewId) ?? ({ id: '', user: userId, view: viewId, sort_order: null, color: null, hidden: false } as PmViewPref)
      n.set(viewId, { ...cur, ...patch })
      return n
    })
  }

  async function recolor(viewId: string, color: string | null) {
    setMenu(null)
    patchPref(viewId, { color })
    try { await upsertViewPref(userId, viewId, { color }) } catch { /* best-effort */ }
  }

  async function removeView(v: PmSavedView, owned: boolean) {
    setMenu(null)
    if (owned) {
      setViews((vs) => vs.filter((x) => x.id !== v.id))
      try { await deleteView(v.id) } catch { /* keep optimistic */ }
    } else {
      patchPref(v.id, { hidden: true })
      try { await upsertViewPref(userId, v.id, { hidden: true }) } catch { /* */ }
    }
  }

  async function onDrop(dept: BusinessUnitFilter, targetId: string) {
    const id = dragId
    setDragId(null)
    if (!id || id === targetId) return
    const ordered = viewsFor(dept)
    const from = ordered.findIndex((v) => v.id === id)
    const to = ordered.findIndex((v) => v.id === targetId)
    if (from < 0 || to < 0) return
    const reordered = [...ordered]
    const [moved] = reordered.splice(from, 1)
    reordered.splice(to, 0, moved)
    reordered.forEach((v, i) => patchPref(v.id, { sort_order: i }))
    for (let i = 0; i < reordered.length; i++) {
      try { await upsertViewPref(userId, reordered[i].id, { sort_order: i }) } catch { /* */ }
    }
  }

  if (!userId) return null

  return (
    <div className="mt-3">
      <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.06em]" style={{ color: '#5A6883' }}>
        Spaces
      </div>
      <div className="space-y-0.5">
        {DEPTS.map((dept) => {
          const open = expanded.has(dept)
          const masterId = `master:${dept}`
          const deptViews = viewsFor(dept)
          return (
            <div key={dept}>
              <div
                onClick={() => toggle(dept)}
                className="flex cursor-pointer items-center gap-1.5 rounded-lg py-1.5 pr-2 pl-3 transition-colors"
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
              >
                {open
                  ? <ChevronDown className="size-3.5 shrink-0" style={{ color: '#94A3C0' }} />
                  : <ChevronRight className="size-3.5 shrink-0" style={{ color: '#94A3C0' }} />}
                <span className="truncate text-[13px] font-semibold" style={{ color: '#fff' }}>{dept}</span>
              </div>
              {open && (
                <>
                  <ViewLeaf
                    active={app.activeViewId === masterId}
                    color={null}
                    icon={<Home className="size-3.5 shrink-0" style={{ color: app.activeViewId === masterId ? '#fff' : '#94A3C0' }} />}
                    label="All (everything)"
                    onClick={() => applyMaster(dept)}
                  />
                  {deptViews.map((v) => {
                    const owned = (typeof v.user === 'string' ? v.user : v.user?.id) === userId
                    const color = prefs.get(v.id)?.color ?? v.color ?? null
                    const active = app.activeViewId === v.id
                    return (
                      <ViewLeaf
                        key={v.id}
                        active={active}
                        color={color}
                        seeded={v.origin === 'clickup_list'}
                        draggable
                        onDragStart={() => setDragId(v.id)}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={() => onDrop(dept, v.id)}
                        icon={<List className="size-3.5 shrink-0" style={{ color: active ? '#fff' : (color ?? '#94A3C0') }} />}
                        label={v.name ?? 'Untitled'}
                        onClick={() => applyView(v)}
                        onContextMenu={(e) => { e.preventDefault(); setMenu({ id: v.id, owned, x: e.clientX, y: e.clientY }) }}
                      />
                    )
                  })}
                </>
              )}
            </div>
          )
        })}
      </div>

      {menu && (
        <div
          className="fixed z-[70] min-w-[180px] overflow-hidden rounded-xl border py-2 shadow-xl"
          style={{ left: menu.x, top: menu.y, background: '#fff', borderColor: '#EAEEF5' }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-3 pb-1.5 text-[11px] font-bold uppercase" style={{ color: '#94A0B5' }}>Color</div>
          <div className="flex flex-wrap gap-1.5 px-3 pb-2">
            {SWATCHES.map((c) => (
              <button key={c} onClick={() => recolor(menu.id, c)} className="size-5 rounded-full" style={{ background: c, boxShadow: '0 0 0 1px #EAEEF5' }} />
            ))}
            <button onClick={() => recolor(menu.id, null)} title="Reset color" className="flex size-5 items-center justify-center rounded-full text-[10px]" style={{ boxShadow: '0 0 0 1px #EAEEF5', color: '#94A0B5' }}>✕</button>
          </div>
          <div className="my-1 h-px" style={{ background: '#EAEEF5' }} />
          <button
            onClick={() => { const v = views.find((x) => x.id === menu.id); if (v) removeView(v, menu.owned) }}
            className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-[13px] font-medium transition-colors hover:bg-[#F6F8FC]"
            style={{ color: '#D2502B' }}
          >
            <Trash2 className="size-3.5" />
            {menu.owned ? 'Delete view' : 'Remove from my sidebar'}
          </button>
        </div>
      )}
    </div>
  )
}

function ViewLeaf({ active, color, seeded, icon, label, onClick, onContextMenu, draggable, onDragStart, onDragOver, onDrop }: {
  active: boolean
  color: string | null
  seeded?: boolean
  icon: React.ReactNode
  label: string
  onClick: () => void
  onContextMenu?: (e: React.MouseEvent) => void
  draggable?: boolean
  onDragStart?: () => void
  onDragOver?: (e: React.DragEvent) => void
  onDrop?: () => void
}) {
  return (
    <div
      onClick={onClick}
      onContextMenu={onContextMenu}
      draggable={draggable}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      className="flex cursor-pointer items-center gap-1.5 rounded-lg py-1.5 pr-2 transition-colors"
      style={{ paddingLeft: 26, background: active ? '#0094FF' : 'transparent' }}
      onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.06)' }}
      onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = 'transparent' }}
      title={seeded ? `${label} (imported list)` : label}
    >
      {icon}
      <span className="truncate text-[12.5px]" style={{ color: active ? '#fff' : (color ?? '#C7D0E0') }}>{label}</span>
      {seeded && <span className="ml-auto size-1.5 shrink-0 rounded-full" style={{ background: active ? 'rgba(255,255,255,0.6)' : '#8C9BB5' }} />}
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
