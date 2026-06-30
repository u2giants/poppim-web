import { useEffect, useMemo, useRef, useState } from 'react'
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
import { CATEGORY_COLORS, CATEGORY_ICONS, LICENSOR_META, STAGE_COLORS } from '@/domain/products/presentation'
import { PimTaskCard } from '@/components/PimTaskCard'
import { TaskDetailModal } from '@/components/TaskDetailModal'
import { updateProduct } from '@/features/board/collab'
import { fetchStages, fetchPipelineProducts, setProductStage, countPipelineProducts } from './api'
import { orderedStageNames, productToSummary } from '@/domain/products/adapters'
import { hydrateProductSummaryRollups } from '@/domain/products/rollups'
import { stageColor } from '@/domain/products/presentation'
import type { ProductSummary } from '@/domain/products/types'
import type { Stage } from '@/lib/types'
import type { FetchProductsOpts } from './api'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function resolveStageColor(name: string): { bg: string; dot: string } {
  return STAGE_COLORS[name] ?? stageColor(name)
}

// ClickUp manual order within a list. Items without an orderindex sort last.
function byOrderindex(a: ProductSummary, b: ProductSummary): number {
  const ai = a.clickupOrderindex, bi = b.clickupOrderindex
  if (ai == null && bi == null) return 0
  if (ai == null) return 1
  if (bi == null) return -1
  return ai - bi
}

function useDebounce<T>(value: T, ms: number): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), ms)
    return () => clearTimeout(t)
  }, [value, ms])
  return debounced
}

function setItemParam(id: string | null) {
  const url = new URL(window.location.href)
  if (id) url.searchParams.set('item', id)
  else url.searchParams.delete('item')
  history.replaceState(null, '', url)
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function PipelinePage() {
  const { pipelineView, searchQuery, filterLicensorIds, filterListNames, businessUnit } = useAppState()
  const [tasks, setTasks] = useState<ProductSummary[]>([])
  const [stages, setStages] = useState<Stage[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [fetching, setFetching] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [activeTask, setActiveTask] = useState<ProductSummary | null>(null)

  const fetchVersion = useRef(0)
  const isFirstProducts = useRef(true)

  const debouncedSearch = useDebounce(searchQuery, 300)
  const stageNames = useMemo(() => {
    const ordered = orderedStageNames(stages, businessUnit)
    const seen = new Set<string>()
    const taskStages = tasks
      .map((task) => task.stageName)
      .filter((name) => name && name !== 'Unknown')
      .filter((name) => (seen.has(name) ? false : (seen.add(name), true)))
    return [...taskStages, ...ordered.filter((name) => !seen.has(name))]
  }, [stages, businessUnit, tasks])
  const stageIdMap = useMemo(
    () => new Map(stages.filter((s) => stageNames.includes(s.name)).map((s) => [s.name, s.id])),
    [stages, stageNames],
  )

  // Stages load once.
  useEffect(() => {
    fetchStages()
      .then((stages) => {
        setStages(stages as Stage[])
      })
      .catch(console.error)
  }, [])

  // Products reload whenever debounced search or licensor filter changes.
  useEffect(() => {
    const pendingId = isFirstProducts.current
      ? new URLSearchParams(window.location.search).get('item')
      : null

    const opts: FetchProductsOpts = {
      search: debouncedSearch.trim() || undefined,
      licensorIds: filterLicensorIds.size > 0 ? [...filterLicensorIds] : undefined,
      listNames: filterListNames.size > 0 ? [...filterListNames] : undefined,
      businessUnit,
      limit: 5000,
    }

    const v = ++fetchVersion.current
    if (!isFirstProducts.current) setFetching(true)

    Promise.all([fetchPipelineProducts(opts), countPipelineProducts(opts)])
      .then(async ([products, total]) => {
        if (v !== fetchVersion.current) return
        const mapped = await hydrateProductSummaryRollups(products.map(productToSummary))
        if (v !== fetchVersion.current) return
        setLoadError(null)
        setTasks(mapped)
        setTotalCount(total)
        if (pendingId) {
          const match = mapped.find((t) => t.id === pendingId)
          if (match) setActiveTask(match)
        }
      })
      .catch((error) => {
        console.error(error)
        if (v !== fetchVersion.current) return
        setTasks([])
        setTotalCount(0)
        setLoadError(error instanceof Error ? error.message : 'Unable to load the product pipeline.')
      })
      .finally(() => {
        if (v !== fetchVersion.current) return
        setLoading(false)
        setFetching(false)
        isFirstProducts.current = false
      })
  }, [debouncedSearch, filterLicensorIds, filterListNames, businessUnit])

  function openTask(t: ProductSummary) {
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

  if (loadError) {
    return (
      <div className="flex h-full items-center justify-center px-6 text-center">
        <div>
          <div className="text-[14px] font-semibold" style={{ color: '#1B2840' }}>
            Product pipeline could not load.
          </div>
          <div className="mt-1 max-w-[560px] text-[12px]" style={{ color: '#5A6883' }}>
            {loadError}
          </div>
        </div>
      </div>
    )
  }

  if (tasks.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-sm" style={{ color: '#94A0B5' }}>
        No products match the current filters.
      </div>
    )
  }

  const shown = tasks.length
  const truncated = totalCount > shown

  return (
    <div className="relative h-full">
      {pipelineView === 'kanban' ? (
        <KanbanView
          tasks={tasks}
          stageNames={stageNames}
          shown={shown}
          total={totalCount}
          fetching={fetching}
          onOpen={openTask}
          onMove={(taskId, toStageName) => {
            const prevStage = tasks.find((t) => t.id === taskId)?.stageName ?? toStageName
            setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, stageName: toStageName } : t)))
            const toStageId = stageIdMap.get(toStageName)
            if (toStageId) {
              setProductStage(taskId, toStageId).catch(() => {
                setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, stageName: prevStage } : t)))
              })
            }
          }}
        />
      ) : (
        <TableView
          tasks={tasks}
          stageNames={stageNames}
          shown={shown}
          total={totalCount}
          fetching={fetching}
          onOpen={openTask}
          onBulkPatch={async (ids, patch) => {
            const before = tasks
            setTasks((prev) => prev.map((task) => (ids.includes(task.id) ? productToSummary({ ...task.raw, ...patch } as never) : task)))
            try {
              await Promise.all(ids.map((id) => updateProduct(id, patch)))
              const opts: FetchProductsOpts = {
                search: debouncedSearch.trim() || undefined,
                licensorIds: filterLicensorIds.size > 0 ? [...filterLicensorIds] : undefined,
                listNames: filterListNames.size > 0 ? [...filterListNames] : undefined,
                businessUnit,
                limit: 5000,
              }
              const products = await fetchPipelineProducts(opts)
              const mapped = await hydrateProductSummaryRollups(products.map(productToSummary))
              setTasks(mapped)
            } catch (error) {
              console.error(error)
              setTasks(before)
            }
          }}
        />
      )}
      {/* Truncation notice (kanban only — table has its own footer) */}
      {pipelineView === 'kanban' && truncated && !fetching && (
        <div
          className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full px-4 py-1.5 text-[12px] font-medium shadow-md"
          style={{ background: '#1B2840', color: '#fff', zIndex: 10 }}
        >
          Showing first {shown.toLocaleString()} of {totalCount.toLocaleString()} — search or filter to narrow
        </div>
      )}
      <TaskDetailModal task={activeTask} onClose={closeTask} />
    </div>
  )
}

// ─── Kanban ─────────────────────────────────────────────────────────────────

function KanbanView({
  tasks,
  stageNames,
  fetching,
  onOpen,
  onMove,
}: {
  tasks: ProductSummary[]
  stageNames: string[]
  shown: number
  total: number
  fetching: boolean
  onOpen: (t: ProductSummary) => void
  onMove: (taskId: string, toStage: string) => void
}) {
  const { colorBy } = useAppState()
  const [dragging, setDragging] = useState<ProductSummary | null>(null)

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }))

  const columns = useMemo(() =>
    stageNames.map((name) => ({
      name,
      items: tasks.filter((t) => t.stageName === name).sort(byOrderindex),
    })), [tasks, stageNames])

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
      <div
        className="flex h-full gap-[14px] overflow-x-auto px-6 py-5 transition-opacity"
        style={{ background: '#fff', opacity: fetching ? 0.55 : 1 }}
      >
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
  items: ProductSummary[]
  colorBy: ReturnType<typeof useAppState>['colorBy']
  onOpen: (t: ProductSummary) => void
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
      <div className="flex flex-col gap-[9px] overflow-y-auto overflow-x-hidden px-2 pb-3 min-h-2">
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
  task: ProductSummary
  colorBy: ReturnType<typeof useAppState>['colorBy']
  onOpen: (t: ProductSummary) => void
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: task.id, data: { task } })
  return (
    <div ref={setNodeRef} style={{ transform: CSS.Translate.toString(transform) }} {...listeners} {...attributes}>
      <PimTaskCard task={task} colorBy={colorBy} onOpen={onOpen} dragging={isDragging} />
    </div>
  )
}

// ─── Table ───────────────────────────────────────────────────────────────────

const TABLE_PAGE_SIZE = 100

function TableView({
  tasks,
  stageNames,
  shown,
  total,
  fetching,
  onOpen,
  onBulkPatch,
}: {
  tasks: ProductSummary[]
  stageNames: string[]
  shown: number
  total: number
  fetching: boolean
  onOpen: (t: ProductSummary) => void
  onBulkPatch: (ids: string[], patch: Record<string, unknown>) => Promise<void>
}) {
  const { groupBy } = useAppState()
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set())
  const [page, setPage] = useState(0)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [bulkBusy, setBulkBusy] = useState(false)

  const groups = useMemo(() => {
    const map = new Map<string, ProductSummary[]>()
    for (const t of tasks) {
      const key =
        groupBy === 'stage'    ? t.stageName :
        groupBy === 'licensor' ? t.licensorName ?? 'No licensor' :
        groupBy === 'priority' ? t.priority :
        groupBy === 'list'     ? t.clickupListName ?? 'No list' :
        groupBy === 'folder'   ? t.clickupFolderName ?? 'No folder' :
        t.assignees[0]?.name ?? 'Unassigned'
      ;(map.get(key) ?? map.set(key, []).get(key)!).push(t)
    }
    for (const items of map.values()) items.sort(byOrderindex)
    const order = groupBy === 'stage' ? stageNames : [...map.keys()].sort()
    return order.map((k) => ({ key: k, items: map.get(k) ?? [] })).filter((g) => g.items.length > 0)
  }, [tasks, groupBy, stageNames])

  // Flatten all rows for pagination
  const allRows = useMemo(() =>
    groups.flatMap((g) => g.items.map((t) => ({ ...t, _group: g.key }))),
    [groups])
  const totalPages = Math.ceil(allRows.length / TABLE_PAGE_SIZE)
  const safePage = Math.min(page, Math.max(totalPages - 1, 0))
  const pageRows = useMemo(
    () => allRows.slice(safePage * TABLE_PAGE_SIZE, (safePage + 1) * TABLE_PAGE_SIZE),
    [allRows, safePage])
  const pageIds = useMemo(() => pageRows.map((row) => row.id), [pageRows])
  const selectedIds = useMemo(() => [...selected].filter((id) => tasks.some((task) => task.id === id)), [selected, tasks])
  const allPageSelected = pageIds.length > 0 && pageIds.every((id) => selected.has(id))

  // Determine which groups appear on this page (to render headers)
  const visibleGroups = useMemo(() => {
    const seen = new Set<string>()
    const result: typeof groups = []
    for (const row of pageRows) {
      if (!seen.has(row._group)) {
        seen.add(row._group)
        result.push(groups.find((g) => g.key === row._group)!)
      }
    }
    return result
  }, [pageRows, groups])

  function toggleSelected(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function togglePage() {
    setSelected((prev) => {
      const next = new Set(prev)
      if (allPageSelected) pageIds.forEach((id) => next.delete(id))
      else pageIds.forEach((id) => next.add(id))
      return next
    })
  }

  async function applyBulk(patch: Record<string, unknown>) {
    if (selectedIds.length === 0) return
    setBulkBusy(true)
    try {
      await onBulkPatch(selectedIds, patch)
      setSelected(new Set())
    } finally {
      setBulkBusy(false)
    }
  }

  return (
    <div className="flex h-full flex-col" style={{ opacity: fetching ? 0.55 : 1 }}>
      {selectedIds.length > 0 && (
        <BulkActionBar
          count={selectedIds.length}
          busy={bulkBusy}
          onClearSelection={() => setSelected(new Set())}
          onApply={applyBulk}
        />
      )}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-left">
          <thead>
            <tr style={{ borderBottom: '1px solid #EAEEF5' }}>
              <th className="sticky top-0 bg-white px-5 py-3" style={{ zIndex: 1, width: 44 }}>
                <Checkbox checked={allPageSelected} onCheckedChange={togglePage} />
              </th>
              {(['Task', 'Stage', 'Licensor', 'Due', 'Owner / Waiting'] as const).map((h) => (
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
            {visibleGroups.map(({ key }) => {
              const groupItems = pageRows.filter((r) => r._group === key)
              return (
                <>
                  <tr
                    key={`h-${key}`}
                    className="cursor-pointer"
                    onClick={() => setCollapsed((p) => { const n = new Set(p); if (n.has(key)) n.delete(key); else n.add(key); return n })}
                    style={{ background: '#F6F8FC', borderBottom: '1px solid #EAEEF5' }}
                  >
                    <td colSpan={6} className="px-5 py-2.5">
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
                          {groups.find(g => g.key === key)?.items.length ?? 0}
                        </span>
                      </div>
                    </td>
                  </tr>
                  {!collapsed.has(key) && groupItems.map((task) => (
                    <TableTaskRow key={task.id} task={task} selected={selected.has(task.id)} onToggleSelected={toggleSelected} onOpen={onOpen} />
                  ))}
                </>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Footer: pagination + result count */}
      <div
        className="shrink-0 flex items-center justify-between px-5 py-2.5 text-[12px]"
        style={{ borderTop: '1px solid #EAEEF5', color: '#94A0B5' }}
      >
        <span>
          {shown < total
            ? `Showing first ${shown.toLocaleString()} of ${total.toLocaleString()} — search or filter to narrow`
            : `${total.toLocaleString()} product${total === 1 ? '' : 's'}`}
        </span>
        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <button
              disabled={safePage === 0}
              onClick={() => setPage((p) => p - 1)}
              className="rounded px-2.5 py-1 text-[12px] font-medium transition-colors disabled:opacity-30 hover:bg-[#F6F8FC]"
              style={{ color: '#5A6883' }}
            >
              ← Prev
            </button>
            <span style={{ color: '#1B2840' }}>
              {safePage + 1} / {totalPages}
            </span>
            <button
              disabled={safePage >= totalPages - 1}
              onClick={() => setPage((p) => p + 1)}
              className="rounded px-2.5 py-1 text-[12px] font-medium transition-colors disabled:opacity-30 hover:bg-[#F6F8FC]"
              style={{ color: '#5A6883' }}
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function BulkActionBar({
  count,
  busy,
  onClearSelection,
  onApply,
}: {
  count: number
  busy: boolean
  onClearSelection: () => void
  onApply: (patch: Record<string, unknown>) => void
}) {
  function promptValue(label: string) {
    const value = window.prompt(label)
    return value?.trim()
  }

  return (
    <div className="flex shrink-0 flex-wrap items-center gap-2 border-b px-5 py-2.5 text-[12px]" style={{ borderColor: '#EAEEF5', background: '#F6F8FC', color: '#5A6883' }}>
      <span className="font-semibold" style={{ color: '#1B2840' }}>{count} selected</span>
      <BulkButton disabled={busy} onClick={() => onApply({ lifecycle_state: 'waiting' })}>Mark waiting</BulkButton>
      <BulkButton disabled={busy} onClick={() => onApply({ risk_level: 'high' })}>Set high risk</BulkButton>
      <BulkButton disabled={busy} onClick={() => onApply({ blocker_reason: null, lifecycle_state: 'active' })}>Clear blocker</BulkButton>
      <BulkButton disabled={busy} onClick={() => { const value = promptValue('Next action'); if (value) onApply({ next_action: value }) }}>Set next action</BulkButton>
      <BulkButton disabled={busy} onClick={() => { const value = promptValue('Waiting on'); if (value) onApply({ waiting_on: value, lifecycle_state: 'waiting' }) }}>Set waiting on</BulkButton>
      <button disabled={busy} onClick={onClearSelection} className="ml-auto rounded px-2 py-1 font-semibold transition-colors hover:bg-white disabled:opacity-50" style={{ color: '#5A6883' }}>
        Clear selection
      </button>
    </div>
  )
}

function BulkButton({ disabled, onClick, children }: { disabled: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button disabled={disabled} onClick={onClick} className="rounded-md border bg-white px-2.5 py-1 font-semibold transition-colors hover:bg-[#EAEEF5] disabled:opacity-50" style={{ borderColor: '#EAEEF5', color: '#1B2840' }}>
      {children}
    </button>
  )
}

function TableTaskRow({
  task,
  selected,
  onToggleSelected,
  onOpen,
}: {
  task: ProductSummary
  selected: boolean
  onToggleSelected: (id: string) => void
  onOpen: (t: ProductSummary) => void
}) {
  const licMeta = task.licensorName ? LICENSOR_META[task.licensorName] : null
  const stageColors = resolveStageColor(task.stageName)
  const catColors = CATEGORY_COLORS[task.category]
  const assigneeLabel = task.assignees.map((a) => a.name).join(', ')
  const ownerLabel = (task.nextOwnerName ?? task.nextOwnerRoleName ?? assigneeLabel) || task.waitingOn || '—'

  return (
    <tr
      className="cursor-pointer transition-colors hover:bg-[#F6F8FC]"
      style={{ borderBottom: '1px solid #EAEEF5' }}
      onClick={() => onOpen(task)}
    >
      <td className="px-5 py-3">
        <Checkbox
          checked={selected}
          onClick={(e) => e.stopPropagation()}
          onCheckedChange={() => onToggleSelected(task.id)}
        />
      </td>
      {/* Task */}
      <td className="px-5 py-3">
        <div className="flex items-center gap-3">
          <div
            className="flex size-[26px] shrink-0 items-center justify-center rounded-lg text-sm"
            style={{ background: catColors?.bg ?? '#F6F8FC' }}
          >
            <span className="text-[8px] font-black" style={{ color: catColors?.accent ?? '#5A6883' }}>{CATEGORY_ICONS[task.category]}</span>
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
          <span className="text-[13px] capitalize" style={{ color: '#1B2840' }}>{task.stageName}</span>
        </div>
      </td>
      {/* Licensor */}
      <td className="px-4 py-3">
        {licMeta ? (
          <div
            className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11.5px] font-bold text-white"
            style={{ background: licMeta.gradient }}
          >
            {licMeta.letter} {task.licensorName}
          </div>
        ) : (
          <span className="text-[13px]" style={{ color: '#5A6883' }}>{task.licensorName ?? '—'}</span>
        )}
      </td>
      {/* Due */}
      <td className="px-4 py-3">
        {task.due && (
          <span className="text-[13px]" style={{ color: task.dueOver ? '#D2502B' : '#5A6883' }}>{task.due}</span>
        )}
      </td>
      {/* Owner / Waiting */}
      <td className="px-4 py-3 text-[13px]" style={{ color: '#5A6883' }}>
        {ownerLabel}
      </td>
    </tr>
  )
}
