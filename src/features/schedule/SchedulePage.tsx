import { useEffect, useMemo, useState } from 'react'
import { Bell, CalendarDays, ClipboardCheck, PackageCheck, Search, Send } from 'lucide-react'
import { useAppState } from '@/lib/appState'
import { fetchScheduleItems, type ScheduleItem } from './api'

const TYPE_META = {
  on_shelf: { label: 'Shelf', icon: CalendarDays, color: '#0094FF' },
  pps: { label: 'PPS', icon: ClipboardCheck, color: '#6B54C9' },
  sample: { label: 'Sample', icon: PackageCheck, color: '#10B981' },
  submission: { label: 'Submission', icon: Send, color: '#F2A23C' },
  reminder: { label: 'Reminder', icon: Bell, color: '#D64F7A' },
} as const

function formatDate(iso: string) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function monthKey(iso: string) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

export function SchedulePage() {
  const { searchQuery } = useAppState()
  const [items, setItems] = useState<ScheduleItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    setLoading(true)
    fetchScheduleItems(searchQuery)
      .then((next) => { if (active) setItems(next) })
      .catch((error) => {
        console.error(error)
        if (active) setItems([])
      })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [searchQuery])

  const groups = useMemo(() => {
    const map = new Map<string, ScheduleItem[]>()
    for (const item of items) (map.get(monthKey(item.date)) ?? map.set(monthKey(item.date), []).get(monthKey(item.date))!).push(item)
    return [...map.entries()]
  }, [items])

  if (loading) {
    return <div className="flex h-full items-center justify-center text-sm" style={{ color: '#94A0B5' }}>Loading schedule...</div>
  }

  return (
    <div className="h-full overflow-y-auto bg-white">
      <div className="mx-auto flex max-w-[1280px] flex-col gap-5 px-7 py-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-[22px] font-extrabold leading-tight" style={{ color: '#1B2840' }}>Schedule</h1>
            <p className="mt-1 text-[13.5px]" style={{ color: '#5A6883' }}>
              {items.length.toLocaleString()} dated product, sample, submission, and reminder item{items.length === 1 ? '' : 's'}
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-lg border px-3 py-2 text-[12.5px]" style={{ borderColor: '#EAEEF5', color: '#5A6883' }}>
            <Search className="size-4" />
            <span>{searchQuery.trim() ? `Searching "${searchQuery.trim()}"` : 'Use sidebar search'}</span>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="rounded-lg border px-5 py-10 text-center text-[13.5px]" style={{ borderColor: '#EAEEF5', color: '#94A0B5' }}>
            No dated schedule items match this view.
          </div>
        ) : (
          <div className="space-y-6">
            {groups.map(([month, rows]) => (
              <section key={month}>
                <h2 className="mb-3 text-[14px] font-bold" style={{ color: '#1B2840' }}>{month}</h2>
                <div className="overflow-hidden rounded-lg border" style={{ borderColor: '#EAEEF5' }}>
                  {rows.map((item) => <ScheduleRow key={item.id} item={item} />)}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function ScheduleRow({ item }: { item: ScheduleItem }) {
  const meta = TYPE_META[item.type]
  const Icon = meta.icon
  return (
    <div className="grid gap-3 px-4 py-3 md:grid-cols-[130px_150px_minmax(0,1fr)_140px]" style={{ borderBottom: '1px solid #EAEEF5' }}>
      <div className="text-[13px] font-semibold" style={{ color: '#1B2840' }}>{formatDate(item.date)}</div>
      <div className="flex items-center gap-2">
        <span className="flex size-7 items-center justify-center rounded-lg" style={{ background: `${meta.color}18` }}>
          <Icon className="size-3.5" style={{ color: meta.color }} />
        </span>
        <span className="text-[12.5px] font-bold" style={{ color: '#5A6883' }}>{meta.label}</span>
      </div>
      <div className="min-w-0">
        <p className="line-clamp-1 text-[13.5px] font-semibold" style={{ color: '#1B2840' }}>{item.title}</p>
        {item.context && <p className="mt-0.5 line-clamp-1 text-[12px]" style={{ color: '#5A6883' }}>{item.context}</p>}
      </div>
      <div className="text-[12.5px] font-semibold" style={{ color: '#5A6883' }}>{item.status ?? 'No status'}</div>
    </div>
  )
}
