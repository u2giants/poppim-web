import { useEffect, useMemo, useState } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useDroppable,
  useDraggable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { ChevronRight } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { useAppState } from '@/lib/appState'
import { STAGE_COLORS, LICENSOR_META, CATEGORY_ICONS, CATEGORY_COLORS, type MockTask } from '@/lib/mockData'
import { PimTaskCard } from '@/components/PimTaskCard'
import { TaskDetailModal } from '@/components/TaskDetailModal'
import { fetchStages, fetchPipelineProducts, setProductStage } from './api'
import { productToTask, orderedStageNames, stageColor } from './adapter'
import type { Stage } from '@/lib/types'

// Merge real stage colors with mock stage colors (mock colors win for known names)
function resolveStageColor(name: string): { bg: string; dot: string } {
  return STAGE_COLORS[name] ?? stageColor(name)
}

function setItemParam(id: string | null) {
  const url = new URL(window.location.href)
  if (id) url.searchParams.set('item', id)
  else url.searchParams.delete('item')
  history.replaceState(null, '', url)
}

export function PipelinePage() {
  const { pipelineView } = useAppState()
  const [tasks, setTasks] = useState<MockTask[]>([])
  const [stageNames, setStageNames] = useState<string[]>([])
  const [stageIdMap, setStageIdMap] = useState<Map<string, string>>(new Map()) // name → id
  const [loading, setLoading] = useState(true)
  const [activeTask, setActiveTask] = useState<MockTask | null>(null)

  useEffect(() => {
    const pendingId = new URLSearchParams(window.location.search).get('item')
    Promise.all([fetchStages(), fetchPipelineProducts()])
      .then(([stages, products]) => {
        const mapped = products.map(productToTask)
        setStageNames(orderedStageNames(stages as Stage[]))
        setStageIdMap(new Map((stages as Stage[]).map((s) => [s.name, s.id])))
        setTasks(mapped)
        if (pendingId) {
          const match = mapped.find((t) => t.id === pendingId)
          if (match) setActiveTask(match)
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  function openTask(t: MockTask) {
    setActiveTask(t)
    setItemParam(t.id)
  }

  function closeTask() {
    setActiveTask(null)
    setItemParam(null)
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center text-sm" style={{ color: '#94A0B5' }}>
        Loading pipeline…
      </div>
    )
  }

  return (
    <>
      {pipelineView === 'kanban' ? (
        <KanbanView
          tasks={tasks}
          stageNames={stageNames}
          onOpen={openTask}
          onMove={(taskId, toStageName) => {
            const prevStage = tasks.find((t) => t.id === taskId)?.stage ?? toStageName
            setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, stage: toStageName } : t)))
            const toStageId = stageIdMap.get(toStageName)
            if (toStageId) {
              setProductStage(taskId, toStageId).catch(() => {
                setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, stage: prevStage } : t)))
              })
            }
          }}
        />
      ) : (
        <TableView tasks={tasks} stageNames={stageNames} onOpen={openTask} />
      )}
      <TaskDetailModal task={activeTask} onClose={closeTask} />
    </>
  )
}

// ─── Kanban ─────────────────────────────────────────────────────────────────

function KanbanView({
  tasks,
  stageNames,
  onOpen,
  onMove,
}: {
  tasks: MockTask[]
  stageNames: string[]
  onOpen: (t: MockTask) => void
  onMove: (taskId: string, toStage: string) => void
}) {
  const { colorBy, searchQuery, filterLicensors } = useAppState()
  const [dragging, setDragging] = useState<MockTask | null>(null)

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }))

  const visible = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    return tasks.filter((t) => {
      if (q && !t.title.toLowerCase().includes(q) && !t.licensor.toLowerCase().includes(q)) return false
      if (filterLicensors.size && !filterLicensors.has(t.licensor)) return false
      return true
    })
  }, [tasks, searchQuery, filterLicensors])

  const columns = useMemo(() =>
    stageNames.map((name) => ({
      name,
      items: visible.filter((t) => t.stage === name),
    })), [visible, stageNames])

  function onDragStart(e: DragStartEvent) {
    setDragging(tasks.find((t) => t.id === e.active.id) ?? null)
  }

  function onDragEnd(e: DragEndEvent) {
    setDragging(null)
    const toStage = e.over?.id as string | undefined
    const taskId = e.active.id as string
    if (!toStage || !taskId) return
    if (stageNames.includes(toStage)) {
      onMove(taskId, toStage)
    }
  }

  return (
    <DndContext sensors={sensors} onDragStart={onDragStart} onDragEnd={onDragEnd} onDragCancel={() => setDragging(null)}>
      <div className="flex h-full gap-[14px] overflow-x-auto px-6 py-5" style={{ background: '#fff' }}>
        {columns.map(({ name, items }) => (
          <KanbanColumn key={name} stageName={name} items={items} colorBy={colorBy} onOpen={onOpen} />
        ))}
      </div>
      <DragOverlay>
        {dragging && <PimTaskCard task={dragging} colorBy={colorBy} onOpen={() => {}} dragging />}
      </DragOverlay>
    </DndContext>
  )
}

function KanbanColumn({
  stageName,
  items,
  colorBy,
  onOpen,
}: {
  stageName: string
  items: MockTask[]
  colorBy: ReturnType<typeof useAppState>['colorBy']
  onOpen: (t: MockTask) => void
}) {
  const { setNodeRef, isOver } = useDroppable({ id: stageName })
  const colors = resolveStageColor(stageName)

  return (
    <div
      ref={setNodeRef}
      className="flex w-[296px] shrink-0 flex-col rounded-xl transition-colors"
      style={{ background: isOver ? '#E4F1FF' : '#F6F8FC' }}
    >
      <div className="flex items-center gap-2 px-3 py-3">
        <span className="size-2 rounded-full shrink-0" style={{ background: colors.dot }} />
        <span className="text-[14px] font-bold capitalize" style={{ color: '#1B2840', letterSpacing: '-0.01em' }}>
          {stageName}
        </span>
        <span
          className="ml-1 rounded px-1.5 py-0.5 text-[11px] font-semibold"
          style={{ background: '#EAEEF5', color: '#5A6883' }}
        >
          {items.length}
        </span>
      </div>
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
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: task.id, data: { task } })
  return (
    <div ref={setNodeRef} style={{ transform: CSS.Translate.toString(transform) }} {...listeners} {...attributes}>
      <PimTaskCard task={task} colorBy={colorBy} onOpen={onOpen} dragging={isDragging} />
    </div>
  )
}

// ─── Table ───────────────────────────────────────────────────────────────────

function TableView({
  tasks,
  stageNames,
  onOpen,
}: {
  tasks: MockTask[]
  stageNames: string[]
  onOpen: (t: MockTask) => void
}) {
  const { groupBy, searchQuery, filterLicensors } = useAppState()
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set())

  const visible = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    return tasks.filter((t) => {
      if (q && !t.title.toLowerCase().includes(q) && !t.licensor.toLowerCase().includes(q)) return false
      if (filterLicensors.size && !filterLicensors.has(t.licensor)) return false
      return true
    })
  }, [tasks, searchQuery, filterLicensors])

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
    const order = groupBy === 'stage' ? stageNames : [...map.keys()].sort()
    return order.map((k) => ({ key: k, items: map.get(k) ?? [] })).filter((g) => g.items.length > 0)
  }, [visible, groupBy, stageNames])

  return (
    <div className="h-full overflow-auto">
      <table className="w-full text-left">
        <thead>
          <tr style={{ borderBottom: '1px solid #EAEEF5' }}>
            {(['Task', 'Stage', 'Licensor', 'Due', 'Assignee'] as const).map((h) => (
              <th
                key={h}
                className="sticky top-0 bg-white px-5 py-3 text-[11px] font-bold uppercase tracking-[0.04em]"
                style={{ color: '#94A0B5', zIndex: 1, width: h === 'Task' ? '45%' : undefined }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {groups.map(({ key, items }) => (
            <>
              <tr
                key={`h-${key}`}
                className="cursor-pointer"
                onClick={() => setCollapsed((p) => { const n = new Set(p); n.has(key) ? n.delete(key) : n.add(key); return n })}
                style={{ background: '#F6F8FC', borderBottom: '1px solid #EAEEF5' }}
              >
                <td colSpan={5} className="px-5 py-2.5">
                  <div className="flex items-center gap-2">
                    <ChevronRight
                      className="size-4 transition-transform"
                      style={{ color: '#5A6883', transform: collapsed.has(key) ? 'rotate(0deg)' : 'rotate(90deg)' }}
                    />
                    {groupBy === 'stage' && (
                      <span className="size-2 rounded-full" style={{ background: resolveStageColor(key).dot }} />
                    )}
                    <span className="text-[13px] font-bold capitalize" style={{ color: '#1B2840' }}>{key}</span>
                    <span className="rounded px-1.5 py-0.5 text-[11px] font-semibold" style={{ background: '#EAEEF5', color: '#5A6883' }}>
                      {items.length}
                    </span>
                  </div>
                </td>
              </tr>
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
  const stageColors = resolveStageColor(task.stage)
  const catColors = CATEGORY_COLORS[task.category]

  return (
    <tr
      className="cursor-pointer transition-colors hover:bg-[#F6F8FC]"
      style={{ borderBottom: '1px solid #EAEEF5' }}
      onClick={() => onOpen(task)}
    >
      {/* Task */}
      <td className="px-5 py-3">
        <div className="flex items-center gap-3">
          <Checkbox className="shrink-0" onClick={(e) => e.stopPropagation()} />
          <div
            className="flex size-[26px] shrink-0 items-center justify-center rounded-lg text-sm"
            style={{ background: catColors?.bg ?? '#F6F8FC' }}
          >
            {CATEGORY_ICONS[task.category]}
          </div>
          <span className="text-[13.5px] font-semibold line-clamp-1 flex-1 min-w-0" style={{ color: '#1B2840' }}>
            {task.title}
          </span>
          {task.pill && (
            <span
              className="rounded-full px-2 py-0.5 text-[10.5px] font-bold shrink-0"
              style={{ background: '#C7E3FB', color: '#1C6BAA' }}
            >
              {task.pill}
            </span>
          )}
        </div>
      </td>
      {/* Stage */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <span
            className="flex size-[22px] shrink-0 items-center justify-center rounded-lg"
            style={{ background: stageColors.bg }}
          >
            <span className="size-2 rounded-full" style={{ background: stageColors.dot }} />
          </span>
          <span className="text-[13px] capitalize" style={{ color: '#1B2840' }}>{task.stage}</span>
        </div>
      </td>
      {/* Licensor */}
      <td className="px-4 py-3">
        {licMeta ? (
          <div
            className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11.5px] font-bold text-white"
            style={{ background: licMeta.gradient }}
          >
            {licMeta.letter} {task.licensor}
          </div>
        ) : (
          <span className="text-[13px]" style={{ color: '#5A6883' }}>{task.licensor}</span>
        )}
      </td>
      {/* Due */}
      <td className="px-4 py-3">
        {task.due && (
          <span className="text-[13px]" style={{ color: task.dueOver ? '#D2502B' : '#5A6883' }}>{task.due}</span>
        )}
      </td>
      {/* Assignee */}
      <td className="px-4 py-3" />
    </tr>
  )
}
