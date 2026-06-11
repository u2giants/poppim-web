import { useEffect, useMemo, useState } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { toast } from 'sonner'
import type { Product, Stage, DirectusUser } from '@/lib/types'
import { fetchProducts, fetchStages, fetchAssigneeMap, setProductStage, stageId } from './api'
import { listUsers } from './collab'
import { stageAccentBg } from './stageColor'
import { applyFilters, sortItems, distinctLicensors, emptyFilters, type Filters } from './filters'
import { TaskCard } from './TaskCard'
import { TaskDetailSheet } from './TaskDetailSheet'
import { BoardToolbar } from './BoardToolbar'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Plus } from 'lucide-react'

const UNGROUPED = '__none__'

type Column = { id: string; name: string; items: Product[] }

function ColumnView({ col, onOpen }: { col: Column; onOpen: (p: Product) => void }) {
  const { setNodeRef, isOver } = useDroppable({ id: col.id })
  return (
    <div
      ref={setNodeRef}
      className={`flex w-[272px] shrink-0 flex-col rounded-lg bg-muted/40 ring-2 transition-colors ${
        isOver ? 'ring-primary/60' : 'ring-transparent'
      }`}
    >
      <div className="sticky top-0 z-10 flex h-11 items-center gap-2 rounded-t-lg bg-muted/40 px-3 backdrop-blur">
        <span className={`size-2 shrink-0 rounded-full ${stageAccentBg(col.id === UNGROUPED ? null : col.name)}`} />
        <span className="truncate text-sm font-semibold">{col.name}</span>
        <span className="ml-auto rounded bg-background px-1.5 text-xs text-muted-foreground">{col.items.length}</span>
      </div>
      <div className="flex min-h-2 flex-col gap-1.5 overflow-y-auto px-2 pb-2">
        {col.items.map((p) => (
          <TaskCard key={p.id} product={p} onOpen={onOpen} />
        ))}
      </div>
    </div>
  )
}

export function BoardPage() {
  const [stages, setStages] = useState<Stage[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [assigneeMap, setAssigneeMap] = useState<Map<string, Set<string>>>(new Map())
  const [users, setUsers] = useState<DirectusUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [active, setActive] = useState<Product | null>(null)
  const [dragging, setDragging] = useState<Product | null>(null)
  const [filters, setFilters] = useState<Filters>(emptyFilters())

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }))

  useEffect(() => {
    Promise.all([fetchStages(), fetchProducts(), fetchAssigneeMap()])
      .then(([s, p, a]) => { setStages(s); setProducts(p); setAssigneeMap(a) })
      .catch(() => setError('Could not load the board. Check your connection to the backend.'))
      .finally(() => setLoading(false))
    listUsers().then(setUsers).catch(() => setUsers([]))
  }, [])

  async function move(productId: string, toStageId: string | null) {
    const product = products.find((p) => p.id === productId)
    if (!product || stageId(product) === toStageId) return
    const snapshot = products
    setProducts((ps) => ps.map((p) => (p.id === productId ? { ...p, stage: toStageId } : p)))
    try {
      await setProductStage(productId, toStageId)
    } catch {
      setProducts(snapshot)
      toast.error('Could not move that card.')
    }
  }

  const visible = useMemo(() => applyFilters(products, filters, assigneeMap), [products, filters, assigneeMap])
  const licensors = useMemo(() => distinctLicensors(products), [products])

  const columns = useMemo<Column[]>(() => {
    const byStage = new Map<string, Product[]>()
    for (const p of visible) {
      const key = stageId(p) ?? UNGROUPED
      ;(byStage.get(key) ?? byStage.set(key, []).get(key)!).push(p)
    }
    const cols = stages.map((s) => ({ id: s.id, name: s.name, items: sortItems(byStage.get(s.id) ?? [], filters.sort) }))
    const ungrouped = byStage.get(UNGROUPED) ?? []
    if (ungrouped.length) cols.unshift({ id: UNGROUPED, name: 'No stage', items: sortItems(ungrouped, filters.sort) })
    return cols
  }, [stages, visible, filters.sort])

  function onDragStart(e: DragStartEvent) {
    setDragging((e.active.data.current?.product as Product) ?? null)
  }
  function onDragEnd(e: DragEndEvent) {
    setDragging(null)
    const overId = e.over?.id
    if (overId == null) return
    move(String(e.active.id), overId === UNGROUPED ? null : String(overId))
  }

  if (loading) return <BoardSkeleton />
  if (error) return <div className="p-6 text-sm text-destructive">{error}</div>

  return (
    <div className="flex h-full flex-col">
      {/* Page header */}
      <div className="flex h-[60px] shrink-0 items-center gap-4 border-b px-5">
        <h1 className="text-base font-semibold">Task Board</h1>
        <div className="flex items-center gap-1 text-sm">
          <span className="rounded-md bg-secondary px-2.5 py-1 font-medium">Board</span>
          <span className="px-2.5 py-1 text-muted-foreground/60">List</span>
          <span className="px-2.5 py-1 text-muted-foreground/60">Timeline</span>
        </div>
        <Button size="sm" className="ml-auto gap-1.5">
          <Plus className="size-4" /> New Item
        </Button>
      </div>

      <BoardToolbar
        filters={filters}
        setFilters={setFilters}
        licensors={licensors}
        users={users}
        shown={visible.length}
        total={products.length}
      />

      {/* Board area */}
      <DndContext sensors={sensors} onDragStart={onDragStart} onDragEnd={onDragEnd} onDragCancel={() => setDragging(null)}>
        <div className="flex flex-1 gap-2.5 overflow-x-auto px-5 py-4">
          {columns.map((col) => (
            <ColumnView key={col.id} col={col} onOpen={setActive} />
          ))}
        </div>
        <DragOverlay>{dragging ? <div className="w-[252px] opacity-90"><TaskCard product={dragging} onOpen={() => {}} /></div> : null}</DragOverlay>
      </DndContext>
      <TaskDetailSheet product={active} stages={stages} onClose={() => setActive(null)} />
    </div>
  )
}

function BoardSkeleton() {
  return (
    <div className="flex gap-2.5 p-5">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="w-[272px] shrink-0 space-y-2">
          <Skeleton className="h-7 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ))}
    </div>
  )
}
