import { useEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'

const EDIT_INPUT_STYLE = {
  fontSize: 13.5,
  color: '#1B2840',
  fontWeight: 600,
  background: '#F6F8FC',
  border: '1px solid #0094FF',
  borderRadius: 6,
  padding: '2px 6px',
  outline: 'none',
  width: '100%',
}

export function EditText({ value, onSave, placeholder = '—', multiline = false, textStyle }: {
  value: string | null | undefined
  onSave: (value: string) => void
  placeholder?: string
  multiline?: boolean
  textStyle?: CSSProperties
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value ?? '')
  const ref = useRef<HTMLInputElement & HTMLTextAreaElement>(null)
  useEffect(() => { if (editing) ref.current?.focus() }, [editing])
  function commit() { setEditing(false); if (draft !== (value ?? '')) onSave(draft) }
  function cancel() { setEditing(false); setDraft(value ?? '') }
  if (editing) {
    const sharedProps = {
      value: draft,
      onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setDraft(event.target.value),
      onBlur: commit,
      style: { ...EDIT_INPUT_STYLE, resize: 'none' as const },
    }
    if (multiline) return <textarea ref={ref} rows={3} onKeyDown={(event) => { if (event.key === 'Escape') cancel() }} {...sharedProps} />
    return <input ref={ref} type="text" onKeyDown={(event) => { if (event.key === 'Enter') commit(); if (event.key === 'Escape') cancel() }} {...sharedProps} />
  }
  return (
    <span onClick={() => { setDraft(value ?? ''); setEditing(true) }} className="group -ml-1 inline-block cursor-text rounded px-1 transition-colors hover:bg-[#F6F8FC]" title="Click to edit" style={textStyle ?? { fontSize: 13.5, color: value ? '#1B2840' : '#94A0B5', fontWeight: 600 }}>
      {value || placeholder}
    </span>
  )
}

export function EditSelect({ value, options, onSave, renderValue }: {
  value: string
  options: Array<{ value: string; label: string }>
  onSave: (value: string) => void
  renderValue: (value: string) => ReactNode
}) {
  const [editing, setEditing] = useState(false)
  const [query, setQuery] = useState('')
  const [highlight, setHighlight] = useState(0)
  const boxRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    return normalized ? options.filter((option) => option.label.toLowerCase().includes(normalized)) : options
  }, [options, query])
  function close() { setEditing(false); setQuery('') }
  function commit(nextValue: string) { close(); if (nextValue !== value) onSave(nextValue) }
  useEffect(() => { if (editing) inputRef.current?.focus() }, [editing])
  useEffect(() => {
    if (!editing) return
    function onDocumentMouseDown(event: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(event.target as Node)) close()
    }
    document.addEventListener('mousedown', onDocumentMouseDown)
    return () => document.removeEventListener('mousedown', onDocumentMouseDown)
  }, [editing])
  if (!editing) return <span onClick={() => { setQuery(''); setHighlight(0); setEditing(true) }} className="-ml-1 inline-block cursor-pointer rounded px-1 transition-colors hover:bg-[#F6F8FC]" title="Click to edit">{renderValue(value)}</span>
  return (
    <div ref={boxRef} style={{ position: 'relative', width: '100%' }}>
      <input
        ref={inputRef}
        value={query}
        placeholder="Type to search…"
        onChange={(event) => { setQuery(event.target.value); setHighlight(0) }}
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown') { event.preventDefault(); setHighlight((current) => Math.min(current + 1, filtered.length - 1)) }
          else if (event.key === 'ArrowUp') { event.preventDefault(); setHighlight((current) => Math.max(current - 1, 0)) }
          else if (event.key === 'Enter') { event.preventDefault(); const option = filtered[highlight]; if (option) commit(option.value) }
          else if (event.key === 'Escape') { event.preventDefault(); close() }
        }}
        style={EDIT_INPUT_STYLE}
      />
      <div style={{ position: 'absolute', zIndex: 60, top: '100%', left: 0, right: 0, marginTop: 3, maxHeight: 220, overflowY: 'auto', background: '#fff', border: '1px solid #E2E8F0', borderRadius: 6, boxShadow: '0 6px 20px rgba(15,40,80,0.14)' }}>
        {filtered.length === 0 ? <div style={{ padding: '6px 10px', fontSize: 12.5, color: '#94A3B8' }}>No matches</div> : filtered.map((option, index) => (
          <div key={option.value} onMouseDown={(event) => { event.preventDefault(); commit(option.value) }} onMouseEnter={() => setHighlight(index)} style={{ padding: '5px 10px', fontSize: 13, cursor: 'pointer', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', background: index === highlight ? '#EFF6FF' : option.value === value ? '#F6F8FC' : '#fff', color: '#1B2840', fontWeight: option.value === value ? 700 : 500 }}>
            {option.label || '—'}
          </div>
        ))}
      </div>
    </div>
  )
}

export function EditDate({ value, onSave, displayValue, overdue }: {
  value: string
  onSave: (value: string) => void
  displayValue: string
  overdue?: boolean
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)
  const ref = useRef<HTMLInputElement>(null)
  useEffect(() => { if (editing) ref.current?.focus() }, [editing])
  function commit() { setEditing(false); if (draft !== value) onSave(draft) }
  if (editing) return <input ref={ref} type="date" value={draft} onChange={(event) => setDraft(event.target.value)} onBlur={commit} onKeyDown={(event) => { if (event.key === 'Enter') commit(); if (event.key === 'Escape') { setEditing(false); setDraft(value) } }} style={{ ...EDIT_INPUT_STYLE, width: 'auto' }} />
  return <span onClick={() => { setDraft(value); setEditing(true) }} className="-ml-1 inline-block cursor-pointer rounded px-1 transition-colors hover:bg-[#F6F8FC]" title="Click to edit" style={{ fontSize: 13.5, color: overdue ? '#D2502B' : (displayValue === '—' ? '#94A0B5' : '#1B2840'), fontWeight: 600 }}>{displayValue}</span>
}
