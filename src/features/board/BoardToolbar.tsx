import type { Licensor, DirectusUser } from '@/lib/types'
import {
  type Filters,
  type DuePreset,
  type SortKey,
  DUE_LABELS,
  SORT_LABELS,
  activeFilterCount,
  emptyFilters,
} from './filters'
import { userName } from './collab'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu'
import { Search, ChevronDown, SlidersHorizontal, X } from 'lucide-react'

function toggle(set: Set<string>, id: string): Set<string> {
  const next = new Set(set)
  next.has(id) ? next.delete(id) : next.add(id)
  return next
}

function FilterButton({ label, count }: { label: string; count?: number }) {
  return (
    <Button variant="outline" size="sm" className="h-8 gap-1.5">
      {label}
      {count ? <Badge variant="secondary" className="px-1.5 py-0 text-[10px]">{count}</Badge> : null}
      <ChevronDown className="size-3.5 text-muted-foreground" />
    </Button>
  )
}

export function BoardToolbar({
  filters,
  setFilters,
  licensors,
  users,
  shown,
  total,
}: {
  filters: Filters
  setFilters: (f: Filters) => void
  licensors: Licensor[]
  users: DirectusUser[]
  shown: number
  total: number
}) {
  const active = activeFilterCount(filters)
  const set = (patch: Partial<Filters>) => setFilters({ ...filters, ...patch })

  return (
    <>
      <div className="flex h-12 shrink-0 items-center gap-2 border-b px-5">
        <div className="relative w-[240px]">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={filters.search}
            onChange={(e) => set({ search: e.target.value })}
            placeholder="Search items…"
            className="h-8 pl-8"
          />
        </div>

        {/* Assignee */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild><div><FilterButton label="Assignee" count={filters.assignees.size} /></div></DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="max-h-72 w-56 overflow-y-auto">
            <DropdownMenuLabel>Assignee</DropdownMenuLabel>
            {users.length === 0 && <div className="px-2 py-1.5 text-xs text-muted-foreground">No users</div>}
            {users.map((u) => (
              <DropdownMenuCheckboxItem
                key={u.id}
                checked={filters.assignees.has(u.id)}
                onCheckedChange={() => set({ assignees: toggle(filters.assignees, u.id) })}
                onSelect={(e) => e.preventDefault()}
              >
                {userName(u)}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Licensor */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild><div><FilterButton label="Licensor" count={filters.licensors.size} /></div></DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="max-h-72 w-56 overflow-y-auto">
            <DropdownMenuLabel>Licensor</DropdownMenuLabel>
            {licensors.length === 0 && <div className="px-2 py-1.5 text-xs text-muted-foreground">None loaded</div>}
            {licensors.map((l) => (
              <DropdownMenuCheckboxItem
                key={l.id}
                checked={filters.licensors.has(l.id)}
                onCheckedChange={() => set({ licensors: toggle(filters.licensors, l.id) })}
                onSelect={(e) => e.preventDefault()}
              >
                {l.name}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Due */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild><div><FilterButton label="Due" count={filters.due !== 'all' ? 1 : 0} /></div></DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            <DropdownMenuLabel>On-shelf date</DropdownMenuLabel>
            <DropdownMenuRadioGroup value={filters.due} onValueChange={(v) => set({ due: v as DuePreset })}>
              {(Object.keys(DUE_LABELS) as DuePreset[]).map((k) => (
                <DropdownMenuRadioItem key={k} value={k}>{DUE_LABELS[k]}</DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Sort */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div>
              <Button variant="ghost" size="sm" className="ml-auto h-8 gap-1.5 text-muted-foreground">
                <SlidersHorizontal className="size-4" /> {SORT_LABELS[filters.sort]}
              </Button>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuLabel>Sort cards by</DropdownMenuLabel>
            <DropdownMenuRadioGroup value={filters.sort} onValueChange={(v) => set({ sort: v as SortKey })}>
              {(Object.keys(SORT_LABELS) as SortKey[]).map((k) => (
                <DropdownMenuRadioItem key={k} value={k}>{SORT_LABELS[k]}</DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Filter strip — only when filters active */}
      {active > 0 && (
        <div className="flex h-9 shrink-0 items-center gap-3 border-b bg-muted/30 px-5 text-xs">
          <span className="text-muted-foreground">Showing <b className="text-foreground">{shown}</b> of {total} loaded</span>
          <button
            onClick={() => setFilters({ ...emptyFilters(), search: filters.search })}
            className="flex items-center gap-1 text-muted-foreground hover:text-foreground"
          >
            <X className="size-3" /> Clear filters
          </button>
        </div>
      )}
    </>
  )
}
