import { useEffect, useRef, useState } from 'react'
import type { MockTask } from '@/lib/mockData'
import { PEOPLE, LICENSOR_META, STAGE_COLORS, PRIORITY_COLORS, CATEGORY_ICONS } from '@/lib/mockData'
import { X, Paperclip, Flag } from 'lucide-react'

const MOCK_COMMENTS = [
  { id: 'c1', author: 'Marco Ruiz', initials: 'MR', color: '#6B54C9', body: null, time: 'Apr 15', isSystem: true },
  { id: 'c2', author: 'Kat Park', initials: 'KP', color: '#3F9A50', body: 'Artwork files sent to licensor for review — expecting feedback within 3–5 business days.', time: '2h ago', isSystem: false },
]

interface Props {
  task: MockTask | null
  onClose: () => void
}

export function TaskDetailModal({ task, onClose }: Props) {
  const [comment, setComment] = useState('')
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!task) return
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [task, onClose])

  if (!task) return null

  const licMeta = LICENSOR_META[task.licensor]
  const stageStyle = STAGE_COLORS[task.stage]
  const assigneeObjects = task.assignees
    .map((id) => PEOPLE.find((p) => p.id === id))
    .filter(Boolean) as typeof PEOPLE
  const priorityColor = PRIORITY_COLORS[task.priority]

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(20,40,80,0.45)' }}
      onClick={(e) => { if (e.target === overlayRef.current) onClose() }}
    >
      <div
        className="flex overflow-hidden"
        style={{
          width: 'min(1080px, 95vw)',
          height: 'min(750px, 92vh)',
          borderRadius: 16,
          background: '#fff',
          boxShadow: '0 24px 64px -16px rgba(20,40,80,0.40)',
        }}
      >
        {/* Left pane */}
        <div className="flex min-w-0 flex-1 flex-col overflow-y-auto">
          {/* Modal top bar */}
          <div
            className="flex shrink-0 items-center justify-between px-6 py-4"
            style={{ borderBottom: '1px solid #EAEEF5' }}
          >
            <span className="text-[13px]" style={{ color: '#5A6883' }}>
              POP Creations / Licensing Management
            </span>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 text-[13px]" style={{ color: '#5A6883' }}>
                <Paperclip className="size-4" />
                <span>{task.attach}</span>
              </div>
              <button
                onClick={onClose}
                className="flex items-center justify-center rounded-lg p-1.5 transition-colors hover:bg-[#F6F8FC]"
              >
                <X className="size-5" style={{ color: '#5A6883' }} />
              </button>
            </div>
          </div>

          {/* Task type + id */}
          <div className="px-6 pt-5">
            <span
              className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[12px] font-semibold"
              style={{ background: '#F6F8FC', color: '#5A6883' }}
            >
              <span>{CATEGORY_ICONS[task.category]}</span>
              Task · #{task.id.replace('t', '')}
            </span>
          </div>

          {/* Title */}
          <h2
            className="px-6 pt-3 font-extrabold leading-tight"
            style={{ fontSize: 25, color: '#1B2840', letterSpacing: '-0.02em' }}
          >
            {task.title}
          </h2>

          {/* Fields grid */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-4 px-6 pt-5">
            <ModalField label="Status">
              <span
                className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[12.5px] font-semibold"
                style={{ background: stageStyle?.bg ?? '#F6F8FC', color: '#1B2840' }}
              >
                <span
                  className="size-2 rounded-full shrink-0"
                  style={{ background: stageStyle?.dot ?? '#94A0B5' }}
                />
                {task.stage}
              </span>
            </ModalField>

            <ModalField label="Assignees">
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex">
                  {assigneeObjects.map((p, i) => (
                    <div
                      key={p.id}
                      className="flex size-7 shrink-0 items-center justify-center rounded-full border-2 border-white text-[10px] font-bold text-white"
                      style={{ background: p.color, marginLeft: i === 0 ? 0 : -8, position: 'relative', zIndex: 3 - i }}
                      title={p.name}
                    >
                      {p.initials}
                    </div>
                  ))}
                </div>
                <span className="text-[13px]" style={{ color: '#1B2840' }}>
                  {assigneeObjects.map((p) => p.name.split(' ')[0]).join(', ')}
                </span>
              </div>
            </ModalField>

            <ModalField label="Due">
              <span className="text-[13.5px] font-semibold" style={{ color: task.dueOver ? '#D2502B' : '#1B2840' }}>
                {task.due ?? '—'}
              </span>
            </ModalField>

            <ModalField label="Priority">
              <span className="flex items-center gap-1.5 text-[13.5px] font-semibold" style={{ color: priorityColor }}>
                <Flag className="size-3.5" style={{ color: priorityColor }} />
                {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
              </span>
            </ModalField>

            <ModalField label="Time est.">
              <span className="text-[13.5px] font-semibold" style={{ color: '#1B2840' }}>
                {task.time}
              </span>
            </ModalField>

            <ModalField label="Licensor">
              {licMeta && (
                <div
                  className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[12.5px] font-bold text-white"
                  style={{ background: licMeta.gradient }}
                >
                  {licMeta.letter} {task.licensor}
                </div>
              )}
            </ModalField>
          </div>

          {/* Description */}
          {task.description && (
            <p
              className="px-6 pt-5 text-[13.5px] leading-[1.7]"
              style={{ color: '#5A6883' }}
            >
              {task.description}
            </p>
          )}

          {/* Fields section */}
          <div className="px-6 pt-6 pb-4">
            <h3 className="mb-3 text-[12px] font-bold uppercase tracking-[0.04em]" style={{ color: '#94A0B5' }}>
              Fields
            </h3>
            <div className="space-y-2">
              {task.buyer && (
                <div className="flex gap-4 text-[13.5px]">
                  <span className="w-36 shrink-0" style={{ color: '#0094FF' }}>Buyer</span>
                  <span style={{ color: '#1B2840' }}>{task.buyer}</span>
                </div>
              )}
              {task.retailer && (
                <div className="flex gap-4 text-[13.5px]">
                  <span className="w-36 shrink-0" style={{ color: '#0094FF' }}>Customer / Retailer</span>
                  <span style={{ color: '#1B2840' }}>{task.retailer}</span>
                </div>
              )}
              {task.factory && (
                <div className="flex gap-4 text-[13.5px]">
                  <span className="w-36 shrink-0" style={{ color: '#0094FF' }}>Factory</span>
                  <span style={{ color: '#1B2840' }}>{task.factory}</span>
                </div>
              )}
              <div className="flex gap-4 text-[13.5px]">
                <span className="w-36 shrink-0" style={{ color: '#0094FF' }}>Category</span>
                <span style={{ color: '#1B2840' }}>
                  {task.category.charAt(0).toUpperCase() + task.category.slice(1)}
                </span>
              </div>
              {task.dueLicensor && (
                <div className="flex gap-4 text-[13.5px]">
                  <span className="w-36 shrink-0" style={{ color: '#0094FF' }}>Due Date Licensor</span>
                  <span style={{ color: '#1B2840' }}>{task.dueLicensor}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right pane: Activity */}
        <div
          className="flex w-[374px] shrink-0 flex-col"
          style={{ borderLeft: '1px solid #EAEEF5' }}
        >
          <div className="shrink-0 px-6 py-4" style={{ borderBottom: '1px solid #EAEEF5' }}>
            <h3 className="text-[15px] font-bold" style={{ color: '#1B2840' }}>Activity</h3>
          </div>

          {/* Feed */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            {MOCK_COMMENTS.map((c) => (
              <div key={c.id} className="flex gap-2.5">
                <div
                  className="flex size-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white mt-0.5"
                  style={{ background: c.color }}
                >
                  {c.initials}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-[13px] font-semibold" style={{ color: '#1B2840' }}>{c.author}</span>
                    {c.isSystem ? (
                      <span className="text-[12px]" style={{ color: '#94A0B5' }}>created this task · {c.time}</span>
                    ) : (
                      <span className="text-[12px]" style={{ color: '#94A0B5' }}>{c.time}</span>
                    )}
                  </div>
                  {c.body && (
                    <p className="mt-0.5 text-[13px] leading-relaxed" style={{ color: '#5A6883' }}>{c.body}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Comment composer */}
          <div className="shrink-0 px-6 py-4" style={{ borderTop: '1px solid #EAEEF5' }}>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Write a comment…"
              rows={3}
              className="w-full resize-none rounded-xl border px-4 py-3 text-[13.5px] outline-none transition-colors placeholder:text-[#94A0B5]"
              style={{
                borderColor: '#EAEEF5',
                color: '#1B2840',
                background: '#fff',
              }}
              onFocus={e => { (e.currentTarget as HTMLElement).style.borderColor = '#0094FF' }}
              onBlur={e => { (e.currentTarget as HTMLElement).style.borderColor = '#EAEEF5' }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function ModalField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-1 text-[12px] font-medium" style={{ color: '#0094FF' }}>{label}</div>
      <div>{children}</div>
    </div>
  )
}
