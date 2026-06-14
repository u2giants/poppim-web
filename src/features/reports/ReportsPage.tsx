import { useEffect, useMemo, useState } from 'react'
import { BarChart3, Boxes, Briefcase, Images, ReceiptText, Shuffle } from 'lucide-react'
import { productToSummary } from '@/domain/products/adapters'
import { STAGE_COLORS, stageColor } from '@/domain/products/presentation'
import { useAppState, type BusinessUnitFilter } from '@/lib/appState'
import type { Product, StageHistory } from '@/lib/types'
import { fetchReportsData, type CountBucket, type ReportsData } from './api'

function formatDate(iso: string | null): string {
  if (!iso) return 'No date'
  return new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
}

function stageName(value: StageHistory['from_stage']): string {
  if (!value) return 'No stage'
  return typeof value === 'string' ? value : value.name
}

function productObject(value: StageHistory['product']): Product | null {
  return value && typeof value === 'object' ? value : null
}

function stageColors(name: string) {
  return STAGE_COLORS[name] ?? stageColor(name)
}

export function ReportsPage() {
  const { businessUnit, setBusinessUnit } = useAppState()
  const [state, setState] = useState<{ unit: BusinessUnitFilter; data: ReportsData | null } | null>(null)

  useEffect(() => {
    let active = true
    fetchReportsData(businessUnit)
      .then((next) => { if (active) setState({ unit: businessUnit, data: next }) })
      .catch((error) => {
        console.error(error)
        if (active) setState({ unit: businessUnit, data: null })
      })
    return () => { active = false }
  }, [businessUnit])

  const data = state?.unit === businessUnit ? state.data : null
  const loading = !state || state.unit !== businessUnit
  const maxStage = useMemo(() => data?.stageBuckets[0]?.count ?? 1, [data])
  const maxClosure = useMemo(() => data?.closureBuckets[0]?.count ?? 1, [data])

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center text-sm" style={{ color: '#94A0B5' }}>
        Loading reports...
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex h-full items-center justify-center text-sm" style={{ color: '#94A0B5' }}>
        Reports are unavailable.
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto bg-white">
      <div className="mx-auto flex max-w-[1480px] flex-col gap-5 px-7 py-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-[22px] font-extrabold leading-tight" style={{ color: '#1B2840' }}>
              Reports
            </h1>
            <p className="mt-1 text-[13.5px]" style={{ color: '#5A6883' }}>
              Stage mix, closure reasons, and recent Directus stage handoffs
            </p>
          </div>
          <div className="flex items-center rounded-[10px] p-1" style={{ background: '#F6F8FC' }}>
            {(['Licensed', 'Generic', 'Software'] as const).map((unit) => (
              <button
                key={unit}
                onClick={() => setBusinessUnit(unit)}
                className="rounded-lg px-3.5 py-1.5 text-[13px] font-medium transition-all"
                style={
                  businessUnit === unit
                    ? { background: '#fff', color: '#1B2840', boxShadow: '0 1px 4px rgba(20,40,80,0.10)' }
                    : { color: '#5A6883' }
                }
              >
                {unit}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <Metric label="Products" value={data.totals.products} icon={Boxes} color="#0094FF" />
          <Metric label="Projects" value={data.totals.projects} icon={Briefcase} color="#10B981" />
          <Metric label="Designs" value={data.totals.designs} icon={Images} color="#8B5CF6" />
          <Metric label="Orders" value={data.totals.orders} icon={ReceiptText} color="#F2A23C" />
        </div>

        <div className="grid gap-5 xl:grid-cols-[1fr_1fr]">
          <Panel title="Stage Distribution" icon={BarChart3}>
            <div className="space-y-3">
              {data.stageBuckets.slice(0, 12).map((bucket) => (
                <StageBucketRow key={bucket.key} bucket={bucket} max={maxStage} />
              ))}
            </div>
          </Panel>

          <Panel title="Closure Reasons" icon={BarChart3}>
            {data.closureBuckets.length === 0 ? (
              <EmptyState label="No closure reasons recorded in this filter." />
            ) : (
              <div className="space-y-3">
                {data.closureBuckets.map((bucket) => (
                  <GenericBucketRow key={bucket.key} bucket={bucket} max={maxClosure} />
                ))}
              </div>
            )}
          </Panel>
        </div>

        <Panel title="Recent Stage Handoffs" icon={Shuffle}>
          {data.recentHandoffs.length === 0 ? (
            <EmptyState label="No Directus stage handoffs have been recorded yet for this filter." />
          ) : (
            <div className="divide-y" style={{ borderColor: '#EAEEF5' }}>
              {data.recentHandoffs.map((handoff) => <HandoffRow key={handoff.id} handoff={handoff} />)}
            </div>
          )}
        </Panel>
      </div>
    </div>
  )
}

function Metric({ label, value, icon: Icon, color }: { label: string; value: number; icon: typeof Boxes; color: string }) {
  return (
    <div className="rounded-lg border px-4 py-3" style={{ borderColor: '#EAEEF5' }}>
      <div className="flex items-center justify-between gap-3">
        <span className="text-[12px] font-semibold uppercase tracking-[0.04em]" style={{ color: '#94A0B5' }}>{label}</span>
        <span className="flex size-8 items-center justify-center rounded-lg" style={{ background: `${color}18` }}>
          <Icon className="size-4" style={{ color }} />
        </span>
      </div>
      <div className="mt-2 text-[25px] font-extrabold leading-none" style={{ color: '#1B2840' }}>
        {value.toLocaleString()}
      </div>
    </div>
  )
}

function Panel({ title, icon: Icon, children }: { title: string; icon: typeof BarChart3; children: React.ReactNode }) {
  return (
    <section className="overflow-hidden rounded-lg border" style={{ borderColor: '#EAEEF5' }}>
      <div className="flex items-center gap-2 px-4 py-3" style={{ borderBottom: '1px solid #EAEEF5' }}>
        <Icon className="size-4" style={{ color: '#0094FF' }} />
        <h2 className="text-[14px] font-bold" style={{ color: '#1B2840' }}>{title}</h2>
      </div>
      <div className="p-4">{children}</div>
    </section>
  )
}

function StageBucketRow({ bucket, max }: { bucket: CountBucket; max: number }) {
  const colors = stageColors(bucket.label)
  const width = `${Math.max(4, Math.round((bucket.count / Math.max(max, 1)) * 100))}%`
  return (
    <div>
      <div className="mb-1 flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <span className="size-2 rounded-full" style={{ background: colors.dot }} />
          <span className="truncate text-[13px] font-semibold" style={{ color: '#1B2840' }}>{bucket.label}</span>
        </div>
        <span className="text-[12px] font-semibold" style={{ color: '#5A6883' }}>{bucket.count.toLocaleString()}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full" style={{ background: '#EAEEF5' }}>
        <div className="h-full rounded-full" style={{ width, background: colors.dot }} />
      </div>
    </div>
  )
}

function GenericBucketRow({ bucket, max }: { bucket: CountBucket; max: number }) {
  const width = `${Math.max(4, Math.round((bucket.count / Math.max(max, 1)) * 100))}%`
  return (
    <div>
      <div className="mb-1 flex items-center justify-between gap-3">
        <span className="truncate text-[13px] font-semibold capitalize" style={{ color: '#1B2840' }}>{bucket.label}</span>
        <span className="text-[12px] font-semibold" style={{ color: '#5A6883' }}>{bucket.count.toLocaleString()}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full" style={{ background: '#EAEEF5' }}>
        <div className="h-full rounded-full" style={{ width, background: '#5A6883' }} />
      </div>
    </div>
  )
}

function HandoffRow({ handoff }: { handoff: StageHistory }) {
  const product = productObject(handoff.product)
  const summary = product ? productToSummary(product) : null
  const from = stageName(handoff.from_stage)
  const to = stageName(handoff.to_stage)
  const toColors = stageColors(to)

  return (
    <div className="flex items-center gap-3 px-1 py-3">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg" style={{ background: toColors.bg }}>
        <span className="size-2 rounded-full" style={{ background: toColors.dot }} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13.5px] font-semibold" style={{ color: '#1B2840' }}>
          {summary ? [summary.code, summary.title].filter(Boolean).join(' · ') : 'Unknown product'}
        </p>
        <p className="mt-0.5 truncate text-[12px]" style={{ color: '#5A6883' }}>
          {[summary?.businessUnit, summary?.retailerName, summary?.buyerName, summary?.licensorName].filter(Boolean).join(' · ') || 'No product context'}
        </p>
      </div>
      <div className="hidden min-w-[220px] shrink-0 text-right md:block">
        <p className="text-[12.5px] font-semibold" style={{ color: '#1B2840' }}>
          {from} {'->'} {to}
        </p>
        <p className="mt-0.5 text-[12px]" style={{ color: '#94A0B5' }}>
          {formatDate(handoff.changed_at)}
        </p>
      </div>
    </div>
  )
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="px-4 py-8 text-center text-[13px]" style={{ color: '#94A0B5' }}>
      {label}
    </div>
  )
}
