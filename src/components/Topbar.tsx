import { useAppState, type ColorBy, type GroupBy } from '@/lib/appState'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuTrigger,
  DropdownMenuCheckboxItem, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuLabel,
} from '@/components/ui/dropdown-menu'
import { Bell, Search, Plus } from 'lucide-react'
import { LICENSORS, PEOPLE } from '@/lib/mockData'
import { buildInfo, formatCommitDateInNewYork } from '@/lib/buildInfo'

const COLOR_OPTIONS: { value: ColorBy; label: string }[] = [
  { value: 'category',  label: 'Category' },
  { value: 'licensor',  label: 'Licensor' },
  { value: 'stage',     label: 'Stage' },
  { value: 'priority',  label: 'Priority' },
  { value: 'none',      label: 'None' },
]

const GROUP_OPTIONS: { value: GroupBy; label: string }[] = [
  { value: 'stage',    label: 'Stage' },
  { value: 'licensor', label: 'Licensor' },
  { value: 'priority', label: 'Priority' },
  { value: 'assignee', label: 'Assignee' },
]

const AVATAR_COLORS = ['#4F9DF7', '#6B54C9', '#3F9A50', '#D24B83', '#DB6645']

export function Topbar() {
  const {
    screen, pipelineView, setPipelineView,
    colorBy, setColorBy,
    groupBy, setGroupBy,
    searchQuery,
    filterLicensors, setFilterLicensors,
  } = useAppState()

  const isPipeline = screen === 'pipeline'
  const commitDate = formatCommitDateInNewYork(buildInfo.commitDateIso)

  function toggleLicensor(name: string) {
    const next = new Set(filterLicensors)
    if (next.has(name)) next.delete(name)
    else next.add(name)
    setFilterLicensors(next)
  }

  return (
    <header
      className="flex h-[72px] shrink-0 items-center gap-3 px-6"
      style={{ borderBottom: '1px solid #EAEEF5', background: '#fff' }}
    >
      {/* Add new button */}
      <button
        className="flex items-center gap-1.5 rounded-[10px] px-4 py-2.5 text-[13.5px] font-semibold text-white transition-colors"
        style={{
          background: '#0094FF',
          boxShadow: '0 6px 16px -6px rgba(0,148,255,0.6)',
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#0080E0' }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#0094FF' }}
      >
        <Plus className="size-4" />
        Add new
      </button>

      {/* Pipeline-only controls: segmented view toggle */}
      {isPipeline && (
        <div
          className="flex items-center rounded-[10px] p-1"
          style={{ background: '#F6F8FC' }}
        >
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

      {/* Search icon */}
      <button
        className="flex items-center justify-center rounded-lg p-2 transition-colors hover:bg-[#F6F8FC]"
        title="Search"
        onClick={() => {
          const el = document.querySelector<HTMLInputElement>('aside input')
          el?.focus()
        }}
      >
        <Search className="size-[18px]" style={{ color: '#5A6883' }} />
      </button>

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
                {filterLicensors.size > 0 && (
                  <span
                    className="flex size-4 items-center justify-center rounded-full text-[10px] font-bold text-white"
                    style={{ background: '#0094FF' }}
                  >
                    {filterLicensors.size}
                  </span>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuLabel>Licensor</DropdownMenuLabel>
              {LICENSORS.map((l) => (
                <DropdownMenuCheckboxItem
                  key={l}
                  checked={filterLicensors.has(l)}
                  onCheckedChange={() => toggleLicensor(l)}
                  onSelect={(e) => e.preventDefault()}
                >
                  {l}
                </DropdownMenuCheckboxItem>
              ))}
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

      {/* Avatar stack */}
      <div className="flex items-center">
        {PEOPLE.slice(0, 5).map((p, i) => (
          <div
            key={p.id}
            className="flex size-8 shrink-0 items-center justify-center rounded-full border-2 border-white text-[11px] font-bold text-white"
            style={{
              background: AVATAR_COLORS[i % AVATAR_COLORS.length],
              marginLeft: i === 0 ? 0 : -8,
              zIndex: 5 - i,
              position: 'relative',
            }}
            title={p.name}
          >
            {p.initials}
          </div>
        ))}
        <div
          className="flex size-8 shrink-0 items-center justify-center rounded-full border-2 border-white text-[10px] font-bold"
          style={{
            background: '#F6F8FC',
            color: '#5A6883',
            marginLeft: -8,
            position: 'relative',
          }}
        >
          +3
        </div>
      </div>

      {/* Notification bell */}
      <button className="relative p-1.5">
        <Bell className="size-[18px]" style={{ color: '#5A6883' }} />
        <span
          className="absolute right-0.5 top-0.5 flex size-4 items-center justify-center rounded-full text-[9px] font-bold text-white"
          style={{ background: '#FF4D4F' }}
        >
          12
        </span>
      </button>

      {/* User avatar */}
      <button
        className="flex size-9 shrink-0 items-center justify-center rounded-full text-[13px] font-bold text-white"
        style={{ background: 'linear-gradient(135deg,#FF9F43,#F47B20)' }}
      >
        {searchQuery ? 'U' : 'U'}
      </button>
    </header>
  )
}
