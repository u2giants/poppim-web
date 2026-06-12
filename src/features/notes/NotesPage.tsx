import { useState } from 'react'
import { NOTES, type MockNote } from '@/lib/mockData'
import { Bold, Italic, Underline, List } from 'lucide-react'

export function NotesPage() {
  const [selected, setSelected] = useState<MockNote>(NOTES[0])

  return (
    <div className="flex h-full overflow-hidden">
      {/* Notes list */}
      <div
        className="flex w-[336px] shrink-0 flex-col overflow-y-auto"
        style={{ borderRight: '1px solid #EAEEF5' }}
      >
        {NOTES.map((note) => {
          const isActive = note.id === selected.id
          return (
            <div
              key={note.id}
              onClick={() => setSelected(note)}
              className="cursor-pointer px-4 py-3.5 transition-colors"
              style={{
                background: isActive ? '#E4F1FF' : 'transparent',
                borderBottom: '1px solid #EAEEF5',
              }}
              onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = '#F6F8FC' }}
              onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'transparent' }}
            >
              <p className="truncate text-[13.5px] font-semibold" style={{ color: '#1B2840' }}>
                {note.title}
              </p>
              <p className="mt-0.5 line-clamp-2 text-[12.5px] leading-relaxed" style={{ color: '#5A6883' }}>
                {note.preview}
              </p>
              <p className="mt-1.5 text-[11px]" style={{ color: '#94A0B5' }}>{note.date}</p>
            </div>
          )
        })}
      </div>

      {/* Document editor */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Formatting toolbar */}
        <div
          className="flex shrink-0 items-center gap-1 px-6 py-3"
          style={{ borderBottom: '1px solid #EAEEF5' }}
        >
          <select
            className="h-8 rounded-lg border-0 bg-[#F6F8FC] px-2 text-[12.5px] font-medium outline-none"
            style={{ color: '#5A6883' }}
          >
            <option>Normal text</option>
            <option>Heading 1</option>
            <option>Heading 2</option>
          </select>
          <div
            className="mx-2"
            style={{ width: 1, height: 20, background: '#EAEEF5' }}
          />
          {[
            { Icon: Italic, label: 'Italic' },
            { Icon: Bold, label: 'Bold' },
            { Icon: Underline, label: 'Underline' },
            { Icon: List, label: 'List' },
          ].map(({ Icon, label }) => (
            <button
              key={label}
              title={label}
              className="flex items-center justify-center rounded-lg p-1.5 transition-colors hover:bg-[#F6F8FC]"
            >
              <Icon className="size-4" style={{ color: '#5A6883' }} />
            </button>
          ))}
        </div>

        {/* Note body */}
        <div className="flex-1 overflow-y-auto px-10 py-8" style={{ maxWidth: 720, margin: '0 auto', width: '100%' }}>
          <NoteBody note={selected} />
        </div>
      </div>
    </div>
  )
}

function NoteBody({ note }: { note: MockNote }) {
  const lines = note.body.split('\n')

  return (
    <div>
      {lines.map((line, i) => {
        if (line.startsWith('# ')) {
          return (
            <h1 key={i} className="mb-4 font-extrabold" style={{ fontSize: 30, color: '#1B2840', letterSpacing: '-0.02em' }}>
              {line.slice(2)}
            </h1>
          )
        }
        if (line.startsWith('## ')) {
          return (
            <h2 key={i} className="mb-2 mt-6 font-bold" style={{ fontSize: 18, color: '#1B2840' }}>
              {line.slice(3)}
            </h2>
          )
        }
        if (line.startsWith('- ')) {
          return (
            <li key={i} className="ml-4 text-[14.5px] leading-[1.7]" style={{ color: '#5A6883' }}>
              {line.slice(2)}
            </li>
          )
        }
        if (line === '') {
          return <div key={i} className="h-2" />
        }
        return (
          <p key={i} className="text-[14.5px] leading-[1.7]" style={{ color: '#5A6883' }}>
            {line}
          </p>
        )
      })}
    </div>
  )
}
