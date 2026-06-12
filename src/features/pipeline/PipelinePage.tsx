import { useState, useMemo } from 'react'
import { DndContext, DragOverlay, PointerSensor, useDroppable, useSensor, useSensors, type DragEndEvent, type DragStartEvent } from '@dnd-kit/core'
import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { useAppState } from '@/lib/appState'
import { TASKS, STAGES, STAGE_COLORS, LICENSOR_META, CATEGORY_ICONS, CATEGORY_COLORS, PEOPLE, PRIORITY_COLORS, type MockTask } from '@/lib/mockData'
import { PimTaskCard } from '@/components/PimTaskCard'
import { TaskDetailModal } from '@/components/TaskDetailModal'
import { Checkbox } from '@/components/ui/checkbox'
import { ChevronRight } from 'lucide-react'

export function PipelinePage() {
  const { pipelineView } = useAppState()
  const [activeTask, setActiveTask] = useState<MockTask | null>(null)

  return (
    <>
      {pipelineView === 'kanban' ? (
        <KanbanView onOpen={setActiveTask} />
      ) : (
        <TableView onOpen={setActiveTask} />
      )}
      <TaskDetailModal task={activeTask} onClose={() => setActiveTask(null)} />
    </>
  )
}

// ─── Kanban ────────────────────────────────────────────────────────────────

function KanbanView({ onOpen }: { onOpen: (t: MockTask) => void }) {
  const { colorBy, searchQuery, filterLicensors } = useAppState()
  const [tasks, setTasks] = useState<MockTask[]>(TASKS)
  const [dragging, setDragging] = useState<MockTask | null>(null)

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }))

  const visible = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    return tasks.filter((t) => {
      if (q && !t.title.toLowerCase().includes(q)) return false
      if (filterLicensors.size && !filterLicensors.has(t.licensor)) return false
      return true
    })
  }, [tasks, searchQuery, filterLicensors])

  const columns = useMemo(() =>
    STAGES.map((stage) => ({
      stage,
      items: visible.filter((t) => t.stage === stage),
    })), [visible])

  function onDragStart(e: DragStartEvent) {
    setDragging(tasks.find((t) => t.id === e.active.id) ?? null)
  }

  function onDragEnd(e: DragEndEvent) {
    setDragging(null)
    const overId = e.over?.id as string | undefined
    if (!overId || !e.active.id) return
    const taskId = e.active.id as string
    if (STAGES.includes(overId)) {
      setTasks((prev) => prev.map((t) => t.id === taskId ? { ...t, stage: overId } : t))
    }
  }

  return (
    <DndContext sensors={sensors} onDragStart={onDragStart} onDragEnd={onDragEnd} onDragCancel={() => setDragging(null)}>
      <div
        className="flex h-full gap-[14px] overflow-x-auto px-6 py-5"
        style={{ background: '#fff' }}
      >
        {columns.map(({ stage, items }) => (
          <KanbanColumn
            key={stage}
            stage={stage}
            items={items}
            colorBy={colorBy}
            onOpen={onOpen}
          />
        ))}
      </div>
      <DragOverlay>
        {dragging && (
          <PimTaskCard task={dragging} colorBy={colorBy} onOpen={() => {}} dragging />
        )}
      </DragOverlay>
    </DndContext>
  )
}

function KanbanColumn({
  stage,
  items,
  colorBy,
  onOpen,
}: {
  stage: string
  items: MockTask[]
  colorBy: ReturnType<typeof useAppState>['colorBy']
  onOpen: (t: MockTask) => void
}) {
  const { setNodeRef, isOver } = useDroppable({ id: stage })
  const stageStyle = STAGE_COLORS[stage]

  return (
    <div
      ref={setNodeRef}
      className="flex w-[296px] shrink-0 flex-col rounded-xl transition-colors"
      style={{ background: isOver ? '#E4F1FF' : '#F6F8FC' }}
    >
      {/* Column header */}
      <div className="flex items-center gap-2 px-3 py-3">
        <span
          className="size-2 rounded-full shrink-0"
          style={{ background: stageStyle?.dot ?? '#94A0B5' }}
        />
        <span className="text-[14px] font-bold" style={{ color: '#1B2840', letterSpacing: '-0.01em' }}>
          {stage}
        </span>
        <span
          className="ml-1 rounded px-1.5 py-0.5 text-[11px] font-semibold"
          style={{ background: '#EAEEF5', color: '#5A6883' }}
        >
          {items.length}
        </span>
      </div>

      {/* Cards */}
      <div className="flex flex-col gap-[9px] overflow-y-auto px-2 pb-3 min-h-2">
        {items.map((task) => (
          <DraggableCard key={task.id} task={task} colorBy={colorBy} onOpen={onOpen} />
        ))}
      </div>
    </div>
  )
}

function DraggableCard({
  task,
  colorBy,
  onOpen,
}: {
  task: MockTask
  colorBy: ReturnType<typeof useAppState>['colorBy']
  onOpen: (t: MockTask) => void
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
    data: { task },
  })

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform) }}
      {...listeners}
      {...attributes}
    >
      <PimTaskCard task={task} colorBy={colorBy} onOpen={onOpen} dragging={isDragging} />
    </div>
  )
}

// ─── Table ─────────────────────────────────────────────────────────────────

function TableView({ onOpen }: { onOpen: (t: MockTask) => void }) {
  const { groupBy, searchQuery, filterLicensors } = useAppState()
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set())

  const visible = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    return TASKS.filter((t) => {
      if (q && !t.title.toLowerCase().includes(q)) return false
      if (filterLicensors.size && !filterLicensors.has(t.licensor)) return false
      return true
    })
  }, [searchQuery, filterLicensors])

  const groups = useMemo(() => {
    const map = new Map<string, MockTask[]>()
    for (const t of visible) {
      const key =
        groupBy === 'stage'    ? t.stage :
        groupBy === 'licensor' ? t.licensor :
        groupBy === 'priority' ? t.priority :
        t.assignees[0] ?? 'Unassigned'
      ;(map.get(key) ?? map.set(key, []).get(key)!).push(t)
    }
    const order = groupBy === 'stage' ? STAGES : [...map.keys()].sort()
    return order.map((k) => ({ key: k, items: map.get(k) ?? [] })).filter((g) => g.items.length > 0)
  }, [visible, groupBy])

  function toggleCollapse(key: string) {
    setCollapsed((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  return (
    <div className="h-full overflow-auto">
      <table className="w-full text-left">
        <thead>
          <tr style={{ borderBottom: '1px solid #EAEEF5' }}>
            <th
              className="sticky top-0 bg-white px-5 py-3 text-[11px] font-bold uppercase tracking-[0.04em] w-[45%]"
              style={{ color: '#94A0B5', zIndex: 1 }}
            >
              Task
            </th>
            <th className="sticky top-0 bg-white px-4 py-3 text-[11px] font-bold uppercase tracking-[0.04em]" style={{ color: '#94A0B5', zIndex: 1 }}>
              Stage
            </th>
            <th className="sticky top-0 bg-white px-4 py-3 text-[11px] font-bold uppercase tracking-[0.04em]" style={{ color: '#94A0B5', zIndex: 1 }}>
              Licensor
            </th>
            <th className="sticky top-0 bg-white px-4 py-3 text-[11px] font-bold uppercase tracking-[0.04em]" style={{ color: '#94A0B5', zIndex: 1 }}>
              Time
            </th>
            <th className="sticky top-0 bg-white px-4 py-3 text-[11px] font-bold uppercase tracking-[0.04em]" style={{ color: '#94A0B5', zIndex: 1 }}>
              Responsible
            </th>
          </tr>
        </thead>
        <tbody>
          {groups.map(({ key, items }) => (
            <>
              {/* Group header row */}
              <tr
                key={`header-${key}`}
                className="cursor-pointer"
                onClick={() => toggleCollapse(key)}
                style={{ background: '#F6F8FC', borderBottom: '1px solid #EAEEF5' }}
              >
                <td colSpan={5} className="px-5 py-2.5">
                  <div className="flex items-center gap-2">
                    <ChevronRight
                      className="size-4 transition-transform"
                      style={{
                        color: '#5A6883',
                        transform: collapsed.has(key) ? 'rotate(0deg)' : 'rotate(90deg)',
                      }}
                    />
                    {groupBy === 'stage' && (
                      <span
                        className="size-2 rounded-full"
                        style={{ background: STAGE_COLORS[key]?.dot ?? '#94A0B5' }}
                      />
                    )}
                    <span className="text-[13px] font-bold capitalize" style={{ color: '#1B2840' }}>
                      {key}
                    </span>
                    <span
                      className="rounded px-1.5 py-0.5 text-[11px] font-semibold"
                      style={{ background: '#EAEEF5', color: '#5A6883' }}
                    >
                      {items.length}
                    </span>
                  </div>
                </td>
              </tr>
              {/* Task rows */}
              {!collapsed.has(key) && items.map((task) => (
                <TableTaskRow key={task.id} task={task} onOpen={onOpen} />
              ))}
            </>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function TableTaskRow({ task, onOpen }: { task: MockTask; onOpen: (t: MockTask) => void }) {
  const licMeta = LICENSOR_META[task.licensor]
  const stageStyle = STAGE_COLORS[task.stage]
  const catColors = CATEGORY_COLORS[task.category]
  const priorityColor = PRIORITY_COLORS[task.priority]
  const assignee = PEOPLE.find((p) => p.id === task.assignees[0])

  return (
    <tr
      className="cursor-pointer transition-colors hover:bg-[#F6F8FC]"
      style={{ borderBottom: '1px solid #EAEEF5' }}
      onClick={() => onOpen(task)}
    >
      {/* Task cell */}
      <td className="px-5 py-3">
        <div className="flex items-center gap-3">
          <Checkbox
            className="shrink-0"
            onClick={(e) => e.stopPropagation()}
          />
          <div
            className="flex size-[26px] shrink-0 items-center justify-center rounded-lg text-sm"
            style={{ background: catColors?.bg ?? '#F6F8FC' }}
          >
            {CATEGORY_ICONS[task.category]}
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[13.5px] font-semibold line-clamp-1" style={{ color: '#1B2840' }}>
              {task.title}
            </span>
          </div>
          {task.pill && (
            <span
              className="rounded-full px-2 py-0.5 text-[10.5px] font-bold shrink-0"
              style={
                task.pill === 'blocked' ? { background: '#F6CDBC', color: '#9E3B1C' } :
                task.pill === 'Feedback' ? { background: '#C7E3FB', color: '#1C6BAA' } :
                { background: '#F4BBA4', color: '#8E3315' }
              }
            >
              {task.pill}
            </span>
          )}
          {task.checklist.total > 0 && (
            <span className="text-[11px]" style={{ color: '#3FA85C' }}>
              {task.checklist.done}/{task.checklist.total}
            </span>
          )}
        </div>
      </td>

      {/* Stage cell */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <span
            className="flex size-[22px] shrink-0 items-center justify-center rounded-lg text-[10px]"
            style={{ background: stageStyle?.bg ?? '#F6F8FC' }}
          >
            <span
              className="size-2 rounded-full"
              style={{ background: stageStyle?.dot ?? '#94A0B5' }}
            />
          </span>
          <span className="text-[13px]" style={{ color: '#1B2840' }}>{task.stage}</span>
        </div>
      </td>

      {/* Licensor cell */}
      <td className="px-4 py-3">
        {licMeta && (
          <div
            className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11.5px] font-bold text-white"
            style={{ background: licMeta.gradient }}
          >
            {licMeta.letter} {task.licensor}
          </div>
        )}
      </td>

      {/* Time cell */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-1.5">
          {task.priority !== 'normal' && (
            <svg className="size-3 shrink-0" viewBox="0 0 12 12" fill={priorityColor}>
              <path d="M6 1L1 11h10L6 1z" />
            </svg>
          )}
          <span className="text-[13px]" style={{ color: '#5A6883' }}>{task.time}</span>
        </div>
      </td>

      {/* Responsible cell */}
      <td className="px-4 py-3">
        {assignee && (
          <div className="flex items-center gap-2">
            <div
              className="flex size-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
              style={{ background: assignee.color }}
            >
              {assignee.initials}
            </div>
            <span className="text-[13px]" style={{ color: '#1B2840' }}>{assignee.name}</span>
          </div>
        )}
      </td>
    </tr>
  )
}
