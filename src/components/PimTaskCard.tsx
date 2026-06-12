import type { MockTask } from '@/lib/mockData'
import { CATEGORY_COLORS, CATEGORY_ICONS, LICENSOR_META, STAGE_COLORS, PRIORITY_COLORS, PEOPLE } from '@/lib/mockData'
import type { ColorBy } from '@/lib/appState'
import { CheckSquare, MessageSquare, Paperclip, Flag } from 'lucide-react'

function cardBg(task: MockTask, colorBy: ColorBy): string {
  switch (colorBy) {
    case 'category': return CATEGORY_COLORS[task.category]?.bg ?? '#fff'
    case 'licensor': {
      const meta = LICENSOR_META[task.licensor]
      if (meta) {
        // derive a pastel tint from the first stop of the gradient
        const match = meta.gradient.match(/#[0-9A-Fa-f]{6}/)
        if (match) {
          const hex = match[0].slice(1)
          const r = parseInt(hex.slice(0, 2), 16)
          const g = parseInt(hex.slice(2, 4), 16)
          const b = parseInt(hex.slice(4, 6), 16)
          return `rgba(${r},${g},${b},0.12)`
        }
      }
      return '#F6F8FC'
    }
    case 'stage': return STAGE_COLORS[task.stage]?.bg ?? '#fff'
    case 'priority': {
      const map: Record<string, string> = {
        urgent: '#FBD9D9', high: '#FBE8D2', normal: '#DEEBFB', low: '#EEF1F6',
      }
      return map[task.priority] ?? '#fff'
    }
    default: return '#fff'
  }
}

const PILL_STYLES: Record<string, { bg: string; color: string }> = {
  blocked:   { bg: '#F6CDBC', color: '#9E3B1C' },
  Feedback:  { bg: '#C7E3FB', color: '#1C6BAA' },
  ASAP:      { bg: '#F4BBA4', color: '#8E3315' },
  'PI Req':  { bg: '#FBEBD3', color: '#9A6400' },
}

export function PimTaskCard({
  task,
  colorBy = 'category',
  onOpen,
  dragging = false,
}: {
  task: MockTask
  colorBy?: ColorBy
  onOpen: (t: MockTask) => void
  dragging?: boolean
}) {
  const catColors = CATEGORY_COLORS[task.category]
  const licMeta = LICENSOR_META[task.licensor]
  const pill = task.pill ? PILL_STYLES[task.pill] : null
  const priorityColor = PRIORITY_COLORS[task.priority]
  const bg = cardBg(task, colorBy)

  const assigneeObjects = task.assignees
    .map((id) => PEOPLE.find((p) => p.id === id))
    .filter(Boolean) as typeof PEOPLE

  return (
    <div
      onClick={() => !dragging && onOpen(task)}
      className="cursor-pointer select-none overflow-hidden rounded-xl transition-all"
      style={{
        background: colorBy === 'none' ? '#fff' : bg,
        border: colorBy === 'none' ? '1px solid #EAEEF5' : `1px solid ${bg}`,
        opacity: dragging ? 0.4 : 1,
        boxShadow: '0 1px 3px rgba(20,40,80,0.06)',
      }}
      onMouseEnter={e => {
        ;(e.currentTarget as HTMLElement).style.boxShadow = '0 10px 22px -10px rgba(20,40,80,0.28)'
        ;(e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'
      }}
      onMouseLeave={e => {
        ;(e.currentTarget as HTMLElement).style.boxShadow = '0 1px 3px rgba(20,40,80,0.06)'
        ;(e.currentTarget as HTMLElement).style.transform = 'translateY(0)'
      }}
    >
      {task.coverUrl && (
        <img
          src={task.coverUrl}
          alt=""
          loading="lazy"
          className="h-28 w-full object-cover"
        />
      )}
      <div className="p-[13px_14px]">
      {/* Title row: category tile + title */}
      <div className="flex items-start gap-2.5">
        <div
          className="flex size-[30px] shrink-0 items-center justify-center rounded-lg text-base"
          style={{ background: catColors?.bg ?? '#F6F8FC' }}
        >
          <span style={{ fontSize: 16 }}>{CATEGORY_ICONS[task.category] ?? '📦'}</span>
        </div>
        <p
          className="line-clamp-2 flex-1 font-semibold leading-[1.32]"
          style={{ fontSize: 13.5, color: '#1B2840', letterSpacing: '-0.01em' }}
        >
          {task.title}
        </p>
      </div>

      {/* Tags row: licensor badge + optional status pill */}
      <div className="mt-2.5 flex items-center gap-1.5">
        {licMeta && (
          <div
            className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold text-white"
            style={{ background: licMeta.gradient, fontSize: 11 }}
          >
            <span>{licMeta.letter}</span>
            <span className="font-semibold opacity-90" style={{ fontSize: 10.5 }}>{task.licensor}</span>
          </div>
        )}
        {pill && (
          <span
            className="rounded-full px-2 py-0.5 text-[10.5px] font-bold"
            style={{ background: pill.bg, color: pill.color }}
          >
            {task.pill}
          </span>
        )}
      </div>

      {/* Meta row */}
      <div className="mt-2.5 flex items-center justify-between">
        {/* Left: time + due */}
        <div className="flex items-center gap-2 text-[11.5px]" style={{ color: '#94A0B5' }}>
          {task.time && <span>{task.time}</span>}
          {task.due && (
            <>
              <span>·</span>
              <span style={{ color: task.dueOver ? '#D2502B' : '#94A0B5' }}>{task.due}</span>
            </>
          )}
          {task.priority !== 'normal' && (
            <Flag className="size-3 ml-0.5" style={{ color: priorityColor }} />
          )}
        </div>

        {/* Right: checklist / comments / attachments + avatars */}
        <div className="flex items-center gap-2">
          {task.checklist.total > 0 && (
            <span className="flex items-center gap-0.5 text-[10.5px] font-medium" style={{ color: '#3FA85C' }}>
              <CheckSquare className="size-3" />
              {task.checklist.done}/{task.checklist.total}
            </span>
          )}
          {task.comments > 0 && (
            <span className="flex items-center gap-0.5 text-[10.5px] font-medium" style={{ color: '#2C8FE0' }}>
              <MessageSquare className="size-3" />
              {task.comments}
            </span>
          )}
          {task.attach > 0 && (
            <span className="flex items-center gap-0.5 text-[10.5px] font-medium" style={{ color: '#D29A2E' }}>
              <Paperclip className="size-3" />
              {task.attach}
            </span>
          )}
          {/* Assignee avatars */}
          <div className="flex">
            {assigneeObjects.slice(0, 3).map((p, i) => (
              <div
                key={p.id}
                className="flex size-[22px] shrink-0 items-center justify-center rounded-full border-2 border-white text-[8px] font-bold text-white"
                style={{
                  background: p.color,
                  marginLeft: i === 0 ? 0 : -6,
                  position: 'relative',
                  zIndex: 3 - i,
                }}
                title={p.name}
              >
                {p.initials}
              </div>
            ))}
          </div>
        </div>
      </div>
      </div> {/* end p-[13px_14px] */}
    </div>
  )
}
