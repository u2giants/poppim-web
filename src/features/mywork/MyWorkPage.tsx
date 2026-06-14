import { useEffect, useMemo, useState } from 'react'
import { ChevronRight, FilePenLine, Flag } from 'lucide-react'
import { useAuth } from '@/auth/auth'
import { TaskDetailModal } from '@/components/TaskDetailModal'
import { productToSummary } from '@/domain/products/adapters'
import { hydrateProductSummaryRollups } from '@/domain/products/rollups'
import type { ProductSummary } from '@/domain/products/types'
import type { RevisionRequest } from '@/lib/types'
import { CATEGORY_COLORS, CATEGORY_ICONS, LICENSOR_META, STAGE_COLORS, stageColor } from '@/domain/products/presentation'
import { fetchMyRevisionWork, fetchMyWorkProducts } from './api'

function resolveStageColor(name: string) {
  return STAGE_COLORS[name] ?? stageColor(name)
}

function userDisplayName(user: ReturnType<typeof useAuth>['user']) {
  if (!user) return 'You'
  return [user.first_name, user.last_name].filter(Boolean).join(' ') || user.email || 'You'
}

function titleCase(value: string | null | undefined) {
  return (value ?? 'unknown').replaceAll('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

function formatDate(iso: string | null | undefined) {
  if (!iso) return 'No date'
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function MyWorkPage() {
  const { user, loading: authLoading } = useAuth()
  const [activeProduct, setActiveProduct] = useState<ProductSummary | null>(null)
  const [products, setProducts] = useState<ProductSummary[]>([])
  const [revisions, setRevisions] = useState<RevisionRequest[]>([])
  const [loadedUserId, setLoadedUserId] = useState<string | null>(null)
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set())
  const userId = user?.id ?? null
  const roleId = user?.role?.id ?? null

  useEffect(() => {
    if (!userId) return
    let active = true
    Promise.all([fetchMyWorkProducts(userId, roleId), fetchMyRevisionWork(userId)])
      .then(async ([rows, revisionRows]) => {
        if (!active) return
        const hydrated = await hydrateProductSummaryRollups(rows.map(productToSummary))
        if (!active) return
        setProducts(hydrated)
        setRevisions(revisionRows)
        setLoadedUserId(userId)
      })
      .catch(() => {
        if (!active) return
        setProducts([])
        setRevisions([])
        setLoadedUserId(userId)
      })
    return () => { active = false }
  }, [roleId, userId])

  const visibleProducts = useMemo(() => (userId === loadedUserId ? products : []), [loadedUserId, products, userId])
  const loading = authLoading || (Boolean(userId) && userId !== loadedUserId)

  const groups = useMemo(() => {
    const map = new Map<string, ProductSummary[]>()
    for (const product of visibleProducts) {
      const key = product.stageName || 'No stage'
      ;(map.get(key) ?? map.set(key, []).get(key)!).push(product)
    }
    return [...map.entries()].map(([stage, items]) => ({ stage, items }))
  }, [visibleProducts])

  function toggleCollapse(key: string) {
    setCollapsed((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center text-sm" style={{ color: '#94A0B5' }}>
        Loading your work...
      </div>
    )
  }

  return (
    <>
      <div className="h-full overflow-y-auto px-8 py-7">
        <div className="mb-7">
          <h2 className="font-extrabold" style={{ fontSize: 21, color: '#1B2840', letterSpacing: '-0.02em' }}>
            My work
          </h2>
          <p className="mt-1 text-[13.5px]" style={{ color: '#5A6883' }}>
            Work owned by {userDisplayName(user)} · {visibleProducts.length} product{visibleProducts.length === 1 ? '' : 's'} · {revisions.length} revision{revisions.length === 1 ? '' : 's'}
          </p>
        </div>

        {visibleProducts.length === 0 && revisions.length === 0 ? (
          <div className="rounded-xl border px-5 py-8 text-[13.5px]" style={{ borderColor: '#EAEEF5', color: '#5A6883' }}>
            No direct assignments, lifecycle-owned products, or revision requests are assigned to you yet.
          </div>
        ) : (
          <div className="space-y-4">
            {groups.map(({ stage, items }) => {
              const stageStyle = resolveStageColor(stage)
              const isCollapsed = collapsed.has(stage)

              return (
                <div key={stage} className="overflow-hidden rounded-xl" style={{ border: '1px solid #EAEEF5' }}>
                  <div
                    className="flex cursor-pointer items-center gap-2.5 px-4 py-3 transition-colors hover:bg-[#F6F8FC]"
                    style={{ background: '#F6F8FC', borderBottom: isCollapsed ? 'none' : '1px solid #EAEEF5' }}
                    onClick={() => toggleCollapse(stage)}
                  >
                    <ChevronRight
                      className="size-4 transition-transform"
                      style={{ color: '#5A6883', transform: isCollapsed ? 'rotate(0deg)' : 'rotate(90deg)' }}
                    />
                    <span className="size-2 rounded-full" style={{ background: stageStyle.dot }} />
                    <span className="text-[13px] font-bold" style={{ color: '#1B2840' }}>{stage}</span>
                    <span className="rounded px-1.5 py-0.5 text-[11px] font-semibold" style={{ background: '#EAEEF5', color: '#5A6883' }}>
                      {items.length}
                    </span>
                  </div>

                  {!isCollapsed && items.map((product) => (
                    <MyWorkRow key={product.id} product={product} onOpen={setActiveProduct} />
                  ))}
                </div>
              )
            })}
            {revisions.length > 0 && (
              <div className="overflow-hidden rounded-xl" style={{ border: '1px solid #EAEEF5' }}>
                <div className="flex items-center gap-2.5 px-4 py-3" style={{ background: '#F6F8FC', borderBottom: '1px solid #EAEEF5' }}>
                  <FilePenLine className="size-4" style={{ color: '#5A6883' }} />
                  <span className="text-[13px] font-bold" style={{ color: '#1B2840' }}>Revision requests</span>
                  <span className="rounded px-1.5 py-0.5 text-[11px] font-semibold" style={{ background: '#EAEEF5', color: '#5A6883' }}>
                    {revisions.length}
                  </span>
                </div>
                {revisions.map((revision) => (
                  <RevisionWorkRow key={revision.id} revision={revision} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <TaskDetailModal task={activeProduct} onClose={() => setActiveProduct(null)} />
    </>
  )
}

function RevisionWorkRow({ revision }: { revision: RevisionRequest }) {
  const product = revision.product && typeof revision.product === 'object' ? productToSummary(revision.product) : null
  return (
    <div className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: '1px solid #EAEEF5' }}>
      <div className="flex size-[24px] shrink-0 items-center justify-center rounded-lg" style={{ background: '#ECE2F8' }}>
        <FilePenLine className="size-3.5" style={{ color: '#6B54C9' }} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="line-clamp-1 text-[13.5px] font-medium" style={{ color: '#1B2840' }}>
          {product ? [product.code, product.title].filter(Boolean).join(' · ') : 'Revision request'}
        </p>
        <p className="mt-0.5 line-clamp-1 text-[12px]" style={{ color: '#5A6883' }}>
          {[titleCase(revision.source), titleCase(revision.status), revision.body].filter(Boolean).join(' · ')}
        </p>
      </div>
      <span className="shrink-0 text-[12px]" style={{ color: '#94A0B5' }}>
        {formatDate(revision.due_at)}
      </span>
    </div>
  )
}

function MyWorkRow({ product, onOpen }: { product: ProductSummary; onOpen: (p: ProductSummary) => void }) {
  const catColors = CATEGORY_COLORS[product.category]
  const licMeta = product.licensorName ? LICENSOR_META[product.licensorName] : null

  return (
    <div
      className="flex cursor-pointer items-center gap-3 px-4 py-3 transition-colors hover:bg-[#F6F8FC]"
      style={{ borderBottom: '1px solid #EAEEF5' }}
      onClick={() => onOpen(product)}
    >
      <div
        className="flex size-[24px] shrink-0 items-center justify-center rounded-lg"
        style={{ background: catColors?.bg ?? '#F6F8FC' }}
      >
        <span className="text-[8px] font-black" style={{ color: catColors?.accent ?? '#5A6883' }}>
          {CATEGORY_ICONS[product.category] ?? 'PRD'}
        </span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="line-clamp-1 text-[13.5px] font-medium" style={{ color: '#1B2840' }}>
          {[product.code, product.title].filter(Boolean).join(' · ')}
        </p>
        <p className="mt-0.5 line-clamp-1 text-[12px]" style={{ color: '#5A6883' }}>
          {[product.businessUnit, product.retailerName, product.buyerName, product.nextAction].filter(Boolean).join(' · ')}
        </p>
      </div>
      {licMeta && (
        <span className="shrink-0 rounded-full px-2 py-0.5 text-[10.5px] font-bold text-white" style={{ background: licMeta.gradient }}>
          {licMeta.letter} {product.licensorName}
        </span>
      )}
      {product.priority !== 'normal' && (
        <Flag className="size-3.5 shrink-0" style={{ color: product.priority === 'urgent' ? '#E0483A' : '#F2A23C' }} />
      )}
      {product.due && (
        <span className="shrink-0 text-[12px]" style={{ color: product.dueOver ? '#D2502B' : '#94A0B5' }}>
          {product.due}
        </span>
      )}
    </div>
  )
}
