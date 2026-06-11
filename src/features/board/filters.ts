import type { Product, Licensor } from '@/lib/types'

export type DuePreset = 'all' | 'overdue' | 'week' | 'month' | 'hasdate' | 'nodate'
export type SortKey = 'none' | 'name' | 'code' | 'onshelf_asc' | 'onshelf_desc'

export interface Filters {
  search: string
  licensors: Set<string>
  assignees: Set<string>
  due: DuePreset
  sort: SortKey
}

export const emptyFilters = (): Filters => ({
  search: '',
  licensors: new Set(),
  assignees: new Set(),
  due: 'all',
  sort: 'none',
})

export const DUE_LABELS: Record<DuePreset, string> = {
  all: 'Any time',
  overdue: 'Overdue',
  week: 'Next 7 days',
  month: 'Next 30 days',
  hasdate: 'Has a date',
  nodate: 'No date',
}

export const SORT_LABELS: Record<SortKey, string> = {
  none: 'Default',
  name: 'Name A–Z',
  code: 'Code A–Z',
  onshelf_asc: 'On-shelf ↑',
  onshelf_desc: 'On-shelf ↓',
}

export function licensorOf(p: Product) {
  if (!p.licensor) return null
  return typeof p.licensor === 'string' ? null : (p.licensor as Licensor)
}

// distinct licensors present in the loaded products, for the filter dropdown
export function distinctLicensors(products: Product[]): Licensor[] {
  const m = new Map<string, Licensor>()
  for (const p of products) {
    const l = licensorOf(p)
    if (l && !m.has(l.id)) m.set(l.id, l)
  }
  return [...m.values()].sort((a, b) => a.name.localeCompare(b.name))
}

function dueMatches(date: string | null, preset: DuePreset): boolean {
  if (preset === 'all') return true
  if (preset === 'nodate') return !date
  if (preset === 'hasdate') return !!date
  if (!date) return false
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const d = new Date(date); d.setHours(0, 0, 0, 0)
  if (isNaN(d.getTime())) return false
  const days = Math.round((d.getTime() - today.getTime()) / 86_400_000)
  if (preset === 'overdue') return days < 0
  if (preset === 'week') return days >= 0 && days <= 7
  if (preset === 'month') return days >= 0 && days <= 30
  return true
}

export function applyFilters(
  products: Product[],
  f: Filters,
  assigneeMap: Map<string, Set<string>>,
): Product[] {
  const q = f.search.trim().toLowerCase()
  return products.filter((p) => {
    if (q && !`${p.name ?? ''} ${p.code ?? ''}`.toLowerCase().includes(q)) return false
    if (f.licensors.size) {
      const l = licensorOf(p)
      if (!l || !f.licensors.has(l.id)) return false
    }
    if (f.assignees.size) {
      const a = assigneeMap.get(p.id)
      if (!a || ![...f.assignees].some((id) => a.has(id))) return false
    }
    if (!dueMatches(p.on_shelf_date, f.due)) return false
    return true
  })
}

export function sortItems(items: Product[], sort: SortKey): Product[] {
  if (sort === 'none') return items
  const arr = [...items]
  const dateVal = (p: Product) => (p.on_shelf_date ? new Date(p.on_shelf_date).getTime() : NaN)
  arr.sort((a, b) => {
    switch (sort) {
      case 'name': return (a.name ?? '').localeCompare(b.name ?? '')
      case 'code': return (a.code ?? '').localeCompare(b.code ?? '')
      case 'onshelf_asc':
      case 'onshelf_desc': {
        const av = dateVal(a), bv = dateVal(b)
        if (isNaN(av) && isNaN(bv)) return 0
        if (isNaN(av)) return 1
        if (isNaN(bv)) return -1
        return sort === 'onshelf_asc' ? av - bv : bv - av
      }
      default: return 0
    }
  })
  return arr
}

export function activeFilterCount(f: Filters): number {
  return f.licensors.size + f.assignees.size + (f.due !== 'all' ? 1 : 0) + (f.sort !== 'none' ? 1 : 0)
}
