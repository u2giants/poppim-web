import { useEffect, useState } from 'react'
import { Activity, MessageSquareText, Search } from 'lucide-react'
import { useAppState } from '@/lib/appState'
import { fetchNotes, type NoteItem } from './api'

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
}

export function NotesPage() {
  const { searchQuery } = useAppState()
  const [notes, setNotes] = useState<NoteItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    setLoading(true)
    fetchNotes(searchQuery)
      .then((next) => { if (active) setNotes(next) })
      .catch((error) => {
        console.error(error)
        if (active) setNotes([])
      })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [searchQuery])

  if (loading) {
    return <div className="flex h-full items-center justify-center text-sm" style={{ color: '#94A0B5' }}>Loading notes...</div>
  }

  return (
    <div className="h-full overflow-y-auto bg-white">
      <div className="mx-auto flex max-w-[1180px] flex-col gap-5 px-7 py-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-[22px] font-extrabold leading-tight" style={{ color: '#1B2840' }}>Notes</h1>
            <p className="mt-1 text-[13.5px]" style={{ color: '#5A6883' }}>
              {notes.length.toLocaleString()} recent comment and activity note{notes.length === 1 ? '' : 's'}
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-lg border px-3 py-2 text-[12.5px]" style={{ borderColor: '#EAEEF5', color: '#5A6883' }}>
            <Search className="size-4" />
            <span>{searchQuery.trim() ? `Searching "${searchQuery.trim()}"` : 'Use sidebar search'}</span>
          </div>
        </div>

        {notes.length === 0 ? (
          <div className="rounded-lg border px-5 py-10 text-center text-[13.5px]" style={{ borderColor: '#EAEEF5', color: '#94A0B5' }}>
            No notes match this view.
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border" style={{ borderColor: '#EAEEF5' }}>
            {notes.map((note) => <NoteRow key={`${note.kind}:${note.id}`} note={note} />)}
          </div>
        )}
      </div>
    </div>
  )
}

function NoteRow({ note }: { note: NoteItem }) {
  const Icon = note.kind === 'comment' ? MessageSquareText : Activity
  const color = note.kind === 'comment' ? '#0094FF' : '#6B54C9'
  return (
    <article className="grid gap-3 px-4 py-3 md:grid-cols-[34px_minmax(0,1fr)_170px]" style={{ borderBottom: '1px solid #EAEEF5' }}>
      <span className="flex size-8 items-center justify-center rounded-lg" style={{ background: `${color}18` }}>
        <Icon className="size-4" style={{ color }} />
      </span>
      <div className="min-w-0">
        <p className="line-clamp-2 text-[13.5px] font-medium" style={{ color: '#1B2840' }}>{note.body}</p>
        <p className="mt-1 line-clamp-1 text-[12px]" style={{ color: '#5A6883' }}>
          {[note.target, note.author].filter(Boolean).join(' · ')}
        </p>
      </div>
      <div className="text-[12px]" style={{ color: '#94A0B5' }}>{formatDate(note.createdAt)}</div>
    </article>
  )
}
