import { useEffect, useMemo, useState } from 'react'
import type { Product, Stage } from '@/lib/types'
import { fetchProducts, fetchStages, stageId } from './api'
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

  useEffect(() => {
    Promise.all([fetchStages(), fetchProducts()])
      .then(([s, p]) => {
        setStages(s)
        setProducts(p)
      })
      .catch(() => setError('Could not load the board. Check your connection to the backend.'))
      .finally(() => setLoading(false))
  }, [])

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
        {columns.map((col) => (
          <div key={col.id} className="flex w-72 shrink-0 flex-col rounded-lg bg-muted/40">
            <div className="flex items-center justify-between px-3 py-2">
              <span className="truncate text-sm font-semibold">{col.name}</span>
              <span className="rounded bg-background px-1.5 text-xs text-muted-foreground">
                {col.items.length}
              </span>
            </div>
            <div className="flex flex-col gap-2 overflow-y-auto px-2 pb-2">
              {col.items.map((p) => (
                <TaskCard key={p.id} product={p} onOpen={setActive} />
              ))}
            </div>
          </div>
        ))}
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
