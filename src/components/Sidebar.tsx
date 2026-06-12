import { useAppState, type Screen } from '@/lib/appState'
import {
  CheckSquare, Calendar, FileText, Users, Settings, ChevronDown, Search, Plus, Minus, Briefcase,
} from 'lucide-react'
import { useState } from 'react'
import popLogo from '@/assets/pop-logo.png'

const TEAMS = [
  { id: 'design',     label: 'Design',     iconColor: '#8B5CF6' },
  { id: 'sales',      label: 'Sales',      iconColor: '#22C55E' },
  { id: 'licensing',  label: 'Licensing',  iconColor: '#F59E0B' },
  { id: 'production', label: 'Production', iconColor: '#3B82F6' },
]

const COLLECTIONS = [
  { id: 'disney-encanto',   label: 'Disney · Encanto',   dotColor: '#4F9DF7' },
  { id: 'marvel-q4',        label: 'Marvel · Q4',        dotColor: '#F0564B' },
  { id: 'seasonal-holiday', label: 'Seasonal · Holiday', dotColor: '#5BC59C' },
  { id: 'product-pipeline', label: 'Product Pipeline',   dotColor: '#0094FF', active: true as const },
  { id: 'lucasfilm-mando',  label: 'Lucasfilm · Mando',  dotColor: '#C9A227' },
  { id: 'sanrio-spring',    label: 'Sanrio · Spring',    dotColor: '#FF9FC4' },
  { id: 'nick-bluey',       label: 'Nick · Bluey',       dotColor: '#FF9F43' },
]

const TOOL_ICONS: { screen: Screen; icon: typeof CheckSquare; label: string }[] = [
  { screen: 'pipeline',  icon: CheckSquare, label: 'Pipeline' },
  { screen: 'projects',  icon: Briefcase,   label: 'Projects' },
  { screen: 'schedule',  icon: Calendar,    label: 'Schedule' },
  { screen: 'notes',     icon: FileText,    label: 'Notes' },
  { screen: 'people',    icon: Users,       label: 'People' },
]

export function Sidebar() {
  const { screen, setScreen, searchQuery, setSearchQuery } = useAppState()
  const [teamsOpen, setTeamsOpen] = useState(true)
  const [collectionsOpen, setCollectionsOpen] = useState(true)

  return (
    <aside
      className="flex h-full w-[236px] shrink-0 flex-col overflow-hidden"
      style={{ background: '#16243F' }}
    >
      {/* Workspace switcher */}
      <div className="flex items-center gap-2.5 px-4 py-3.5 cursor-pointer hover:opacity-90 transition-opacity">
        <div
          className="flex size-[34px] shrink-0 items-center justify-center rounded-lg overflow-hidden bg-white"
        >
          {popLogo ? (
            <img src={popLogo} alt="POP" className="size-5 object-contain" style={{ filter: 'hue-rotate(202deg) saturate(1.45)' }} />
          ) : (
            <span className="text-[#0094FF] font-black text-sm">P</span>
          )}
        </div>
        <span className="flex-1 text-[15px] font-bold text-white truncate">POP Creations</span>
        <ChevronDown className="size-4 shrink-0" style={{ color: '#94A3C0' }} />
      </div>

      {/* Search box */}
      <div className="px-3 pb-2">
        <div
          className="flex items-center gap-2 rounded-lg px-3 py-2"
          style={{ background: 'rgba(255,255,255,0.06)' }}
        >
          <Search className="size-3.5 shrink-0" style={{ color: '#94A3C0' }} />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search…"
            className="flex-1 bg-transparent text-[13px] outline-none placeholder:text-[#94A3C0] text-white min-w-0"
          />
        </div>
      </div>

      {/* My work */}
      <div
        onClick={() => setScreen('mywork')}
        className="flex items-center gap-2.5 mx-2 rounded-lg px-3 py-2 cursor-pointer transition-colors"
        style={{
          background: screen === 'mywork' ? '#0094FF' : 'transparent',
        }}
        onMouseEnter={e => { if (screen !== 'mywork') (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)' }}
        onMouseLeave={e => { if (screen !== 'mywork') (e.currentTarget as HTMLElement).style.background = 'transparent' }}
      >
        <div
          className="size-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
          style={{ background: 'linear-gradient(135deg,#FF9F43,#F47B20)' }}
        >
          MY
        </div>
        <span
          className="text-[13.5px] font-medium"
          style={{ color: screen === 'mywork' ? '#fff' : '#94A3C0' }}
        >
          My work
        </span>
      </div>

      {/* Divider */}
      <div className="mx-4 my-2" style={{ height: 1, background: 'rgba(255,255,255,0.08)' }} />

      <div className="flex-1 overflow-y-auto min-h-0 space-y-0.5 px-2">
        {/* Teams section */}
        <SidebarSection
          label="Teams"
          open={teamsOpen}
          onToggle={() => setTeamsOpen(!teamsOpen)}
        >
          {TEAMS.map((t) => (
            <SidebarRow key={t.id} active={false}>
              <TeamIcon color={t.iconColor} id={t.id} />
              <span className="text-[13px]" style={{ color: '#94A3C0' }}>{t.label}</span>
            </SidebarRow>
          ))}
        </SidebarSection>

        {/* Divider */}
        <div className="mx-2 my-2" style={{ height: 1, background: 'rgba(255,255,255,0.08)' }} />

        {/* Collections section */}
        <SidebarSection
          label="Collections"
          open={collectionsOpen}
          onToggle={() => setCollectionsOpen(!collectionsOpen)}
        >
          {COLLECTIONS.map((c) => (
            <SidebarRow
              key={c.id}
              active={!!c.active && screen === 'pipeline'}
              onClick={c.active ? () => setScreen('pipeline') : undefined}
            >
              <span
                className="size-2 rounded-full shrink-0"
                style={{ background: c.dotColor }}
              />
              <span
                className="text-[13px]"
                style={{ color: c.active && screen === 'pipeline' ? '#fff' : '#94A3C0' }}
              >
                {c.label}
              </span>
            </SidebarRow>
          ))}
        </SidebarSection>
      </div>

      {/* Footer tool row */}
      <div
        className="flex items-center justify-between px-3 py-3"
        style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}
      >
        <div className="flex items-center gap-1">
          {TOOL_ICONS.map(({ screen: s, icon: Icon, label }) => (
            <button
              key={s}
              title={label}
              onClick={() => setScreen(s)}
              className="flex items-center justify-center rounded-lg p-2 transition-colors"
              style={{
                background: screen === s ? 'rgba(255,255,255,0.12)' : 'transparent',
              }}
            >
              <Icon
                className="size-4"
                style={{ color: screen === s ? '#0094FF' : '#94A3C0' }}
              />
            </button>
          ))}
        </div>
        <button
          title="Settings"
          onClick={() => setScreen('settings')}
          className="flex items-center justify-center rounded-lg p-2 transition-colors"
          style={{
            background: screen === 'settings' ? 'rgba(255,255,255,0.12)' : 'transparent',
          }}
        >
          <Settings
            className="size-4"
            style={{ color: screen === 'settings' ? '#0094FF' : '#94A3C0' }}
          />
        </button>
      </div>
    </aside>
  )
}

function SidebarSection({
  label,
  open,
  onToggle,
  children,
}: {
  label: string
  open: boolean
  onToggle: () => void
  children: React.ReactNode
}) {
  return (
    <div>
      <button
        onClick={onToggle}
        className="flex w-full items-center gap-1 px-3 py-1.5 rounded-lg transition-colors hover:bg-white/5"
      >
        {open ? (
          <Minus className="size-3 shrink-0" style={{ color: '#5A6883' }} />
        ) : (
          <Plus className="size-3 shrink-0" style={{ color: '#5A6883' }} />
        )}
        <span className="text-[11px] font-bold uppercase tracking-[0.06em]" style={{ color: '#5A6883' }}>{label}</span>
        <Plus className="size-3 ml-auto shrink-0 opacity-0 hover:opacity-100" style={{ color: '#5A6883' }} />
      </button>
      {open && <div className="space-y-0.5">{children}</div>}
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
      onMouseEnter={e => { if (!active && onClick) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)' }}
      onMouseLeave={e => { if (!active && onClick) (e.currentTarget as HTMLElement).style.background = 'transparent' }}
    >
      {children}
    </div>
  )
}

function TeamIcon({ color, id }: { color: string; id: string }) {
  const icons: Record<string, React.ReactNode> = {
    design: (
      <svg className="size-4 shrink-0" viewBox="0 0 16 16" fill="none" stroke={color} strokeWidth="1.5">
        <path d="M3 13L7 3l4 10M4.5 9.5h5" strokeLinecap="round" />
      </svg>
    ),
    sales: (
      <svg className="size-4 shrink-0" viewBox="0 0 16 16" fill="none" stroke={color} strokeWidth="1.5">
        <polyline points="2,11 6,6 10,8 14,3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    licensing: (
      <svg className="size-4 shrink-0" viewBox="0 0 16 16" fill="none" stroke={color} strokeWidth="1.5">
        <circle cx="8" cy="6" r="3" />
        <path d="M5.5 10.5l-1 4M10.5 10.5l1 4M6 14h4" strokeLinecap="round" />
      </svg>
    ),
    production: (
      <svg className="size-4 shrink-0" viewBox="0 0 16 16" fill="none" stroke={color} strokeWidth="1.5">
        <rect x="2" y="4" width="12" height="9" rx="1.5" />
        <path d="M5 4V3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1" strokeLinecap="round" />
      </svg>
    ),
  }
  return <>{icons[id] ?? <span className="size-4" />}</>
}
