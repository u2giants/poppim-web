import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import type { Product, Stage } from '@/lib/types'
import { fetchProducts, fetchStages, setProductStage, stageId } from './api'
import { stageAccentBg } from './stageColor'
import { TaskCard } from './TaskCard'
import { TaskDetailSheet } from './TaskDetailSheet'
import { Skeleton } from '@/components/ui/skeleton'

const UNGROUPED = '__none__'

export function BoardPage() {
  const [stages, setStages] = useState<Stage[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [active, setActive] = useState<Product | null>(null)
  const [dragOver, setDragOver] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([fetchStages(), fetchProducts()])
      .then(([s, p]) => {
        setStages(s)
        setProducts(p)
      })
      .catch(() => setError('Could not load the board. Check your connection to the backend.'))
      .finally(() => setLoading(false))
  }, [])

  // Optimistically move a card to a new stage column, then persist (revert on failure).
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

  const byStage = useMemo(() => {
    const map = new Map<string, Product[]>()
    for (const p of products) {
      const key = stageId(p) ?? UNGROUPED
      const list = map.get(key) ?? []
      list.push(p)
      map.set(key, list)
    }
    return map
  }, [products])

  const columns = useMemo(() => {
    const cols = stages.map((s) => ({ id: s.id, name: s.name, items: byStage.get(s.id) ?? [] }))
    const ungrouped = byStage.get(UNGROUPED) ?? []
    if (ungrouped.length) cols.unshift({ id: UNGROUPED, name: 'No stage', items: ungrouped })
    return cols
  }, [stages, byStage])

  if (loading) return <BoardSkeleton />
  if (error) return <div className="p-6 text-sm text-destructive">{error}</div>

  return (
    <>
      <div className="flex h-full gap-3 overflow-x-auto p-4">
        {columns.map((col) => {
          const target = col.id === UNGROUPED ? null : col.id
          return (
            <div
              key={col.id}
              onDragOver={(e) => {
                e.preventDefault()
                e.dataTransfer.dropEffect = 'move'
                if (dragOver !== col.id) setDragOver(col.id)
              }}
              onDragLeave={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragOver((d) => (d === col.id ? null : d))
              }}
              onDrop={(e) => {
                e.preventDefault()
                setDragOver(null)
                const id = e.dataTransfer.getData('text/product')
                if (id) move(id, target)
              }}
              className={`flex w-72 shrink-0 flex-col rounded-lg bg-muted/40 ring-2 transition-colors ${
                dragOver === col.id ? 'ring-primary/60' : 'ring-transparent'
              }`}
            >
              <div className="flex items-center gap-2 px-3 py-2">
                <span className={`size-2 shrink-0 rounded-full ${stageAccentBg(col.id === UNGROUPED ? null : col.name)}`} />
                <span className="truncate text-sm font-semibold">{col.name}</span>
                <span className="ml-auto rounded bg-background px-1.5 text-xs text-muted-foreground">{col.items.length}</span>
              </div>
              <div className="flex min-h-2 flex-col gap-2 overflow-y-auto px-2 pb-2">
                {col.items.map((p) => (
                  <TaskCard key={p.id} product={p} onOpen={setActive} />
                ))}
              </div>
            </div>
          )
        })}
      </div>
      <TaskDetailSheet product={active} stages={stages} onClose={() => setActive(null)} />
    </>
  )
}

function BoardSkeleton() {
  return (
    <div className="flex gap-3 p-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="w-72 shrink-0 space-y-2">
          <Skeleton className="h-7 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      ))}
    </div>
  )
}
