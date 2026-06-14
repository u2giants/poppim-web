import { useAppState, type Screen } from '@/lib/appState'
import { BarChart3, Briefcase, Building2, CheckSquare, ChevronDown, Factory, FilePenLine, Gauge, Images, Layers3, ReceiptText, Search, Send, Settings, UserCheck } from 'lucide-react'
import popLogo from '@/assets/pop-logo.png'

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
