import { useEffect, useMemo, useState } from 'react'
import { Bell, FilePenLine, Search, UserRoundCheck } from 'lucide-react'
import { useAppState } from '@/lib/appState'
import { fetchPeopleWorkload, type PersonWorkload } from './api'

function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('') || '?'
}

export function PeoplePage() {
  const { searchQuery } = useAppState()
  const [people, setPeople] = useState<PersonWorkload[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    setLoading(true)
    fetchPeopleWorkload(searchQuery)
      .then((next) => { if (active) setPeople(next) })
      .catch((error) => {
        console.error(error)
        if (active) setPeople([])
      })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [searchQuery])

  const totals = useMemo(() => ({
    assignments: people.reduce((sum, person) => sum + person.assignments, 0),
    reminders: people.reduce((sum, person) => sum + person.reminders, 0),
    revisions: people.reduce((sum, person) => sum + person.revisions, 0),
  }), [people])

  if (loading) {
    return <div className="flex h-full items-center justify-center text-sm" style={{ color: '#94A0B5' }}>Loading people...</div>
  }

  return (
    <div className="h-full overflow-y-auto bg-white">
      <div className="mx-auto flex max-w-[1280px] flex-col gap-5 px-7 py-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-[22px] font-extrabold leading-tight" style={{ color: '#1B2840' }}>People</h1>
            <p className="mt-1 text-[13.5px]" style={{ color: '#5A6883' }}>
              {people.length.toLocaleString()} profile{people.length === 1 ? '' : 's'} · {totals.assignments} assignments · {totals.reminders} reminders · {totals.revisions} revisions
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-lg border px-3 py-2 text-[12.5px]" style={{ borderColor: '#EAEEF5', color: '#5A6883' }}>
            <Search className="size-4" />
            <span>{searchQuery.trim() ? `Searching "${searchQuery.trim()}"` : 'Use sidebar search'}</span>
          </div>
        </div>

        {people.length === 0 ? (
          <div className="rounded-lg border px-5 py-10 text-center text-[13.5px]" style={{ borderColor: '#EAEEF5', color: '#94A0B5' }}>
            No people match this view.
          </div>
        ) : (
          <div className="grid gap-3 lg:grid-cols-2 xl:grid-cols-3">
            {people.map((person) => <PersonCard key={person.id} person={person} />)}
          </div>
        )}
      </div>
    </div>
  )
}

function PersonCard({ person }: { person: PersonWorkload }) {
  return (
    <article className="rounded-lg border p-4" style={{ borderColor: '#EAEEF5' }}>
      <div className="flex items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg text-[13px] font-extrabold" style={{ background: '#EAF4FF', color: '#2D7BD0' }}>
          {person.avatarUrl ? <img src={person.avatarUrl} alt="" className="size-full object-cover" /> : initials(person.name)}
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-[14px] font-bold" style={{ color: '#1B2840' }}>{person.name}</h2>
          <p className="mt-0.5 truncate text-[12.5px]" style={{ color: '#5A6883' }}>{person.email ?? 'No email'}</p>
        </div>
        <span className="rounded px-1.5 py-0.5 text-[10.5px] font-bold uppercase" style={{ background: '#F6F8FC', color: '#5A6883' }}>
          {person.status ?? 'unknown'}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <Metric icon={UserRoundCheck} label="Assigned" value={person.assignments} color="#0094FF" />
        <Metric icon={Bell} label="Reminders" value={person.reminders} color="#D64F7A" />
        <Metric icon={FilePenLine} label="Revisions" value={person.revisions} color="#6B54C9" />
      </div>
    </article>
  )
}

function Metric({ icon: Icon, label, value, color }: { icon: typeof UserRoundCheck; label: string; value: number; color: string }) {
  return (
    <div className="rounded-md px-2 py-2" style={{ background: '#F6F8FC' }}>
      <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.04em]" style={{ color: '#94A0B5' }}>
        <Icon className="size-3" style={{ color }} />
        {label}
      </div>
      <div className="mt-1 text-[17px] font-extrabold leading-none" style={{ color: '#1B2840' }}>{value.toLocaleString()}</div>
    </div>
  )
}
