import { useEffect, useMemo, useState } from 'react'
import { Activity, AlertTriangle, ArrowRight, Briefcase, Clock3, Layers3, PackageCheck } from 'lucide-react'
import { useAppState, type BusinessUnitFilter } from '@/lib/appState'
import { CATEGORY_COLORS, CATEGORY_ICONS, PRIORITY_COLORS, STAGE_COLORS, stageColor } from '@/domain/products/presentation'
import type { ProductSummary } from '@/domain/products/types'
import type { Project } from '@/lib/types'
import { fetchControlRoomData, type ControlRoomData, type StageCount } from './api'

function formatNumber(n: number) {
  return n.toLocaleString()
}

function formatDate(iso: string | null | undefined): string {
  if (!iso) return 'No date'
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function relationName(value: Project['retailer'] | Project['buyer'] | Project['design_collection']): string {
  if (!value) return 'Unassigned'
  if (typeof value === 'string') return value
  return value.name ?? 'Unassigned'
}

function stageColors(stageName: string) {
  return STAGE_COLORS[stageName] ?? stageColor(stageName)
}

export function ControlRoomPage() {
  const { businessUnit, setBusinessUnit, setScreen } = useAppState()
  const [state, setState] = useState<{ unit: BusinessUnitFilter; data: ControlRoomData | null } | null>(null)

  useEffect(() => {
    let active = true
    fetchControlRoomData(businessUnit)
      .then((next) => { if (active) setState({ unit: businessUnit, data: next }) })
      .catch((error) => {
        console.error(error)
        if (active) setState({ unit: businessUnit, data: null })
      })
    return () => { active = false }
  }, [businessUnit])

  const data = state?.unit === businessUnit ? state.data : null
  const loading = !state || state.unit !== businessUnit
  const topStages = useMemo(() => data?.stageCounts.slice(0, 7) ?? [], [data])
  const visibleUrgent = data?.urgentProducts.slice(0, 8) ?? []
  const visibleUpcoming = data?.upcomingProducts.slice(0, 8) ?? []

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center text-sm" style={{ color: '#94A0B5' }}>
        Loading control room...
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex h-full items-center justify-center text-sm" style={{ color: '#94A0B5' }}>
        Control room data is unavailable.
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto bg-white">
      <div className="mx-auto flex max-w-[1480px] flex-col gap-5 px-7 py-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-[22px] font-extrabold leading-tight" style={{ color: '#1B2840' }}>
              Control room
            </h1>
            <p className="mt-1 text-[13.5px]" style={{ color: '#5A6883' }}>
              {businessUnit === 'All' ? 'All product work' : `${businessUnit} product work`} across projects, products, deadlines, and stage load
            </p>
          </div>
          <div className="flex items-center rounded-[10px] p-1" style={{ background: '#F6F8FC' }}>
            {(['All', 'POP', 'Spruce'] as const).map((unit) => (
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
          <Metric label="Open products" value={formatNumber(data.totalProducts)} icon={PackageCheck} color="#0094FF" />
          <Metric label="Active projects" value={formatNumber(data.activeProjects)} icon={Briefcase} color="#10B981" />
          <Metric label="Urgent / high" value={formatNumber(data.urgentProducts.length)} icon={AlertTriangle} color="#E0483A" />
          <Metric label="Next 21 days" value={formatNumber(data.upcomingProducts.length)} icon={Clock3} color="#F2A23C" />
        </div>

        <div className="grid min-h-0 gap-5 xl:grid-cols-[1.1fr_0.9fr]">
          <Section
            title="Immediate attention"
            icon={AlertTriangle}
            action="Open pipeline"
            onAction={() => setScreen('pipeline')}
          >
            {visibleUrgent.length > 0 ? (
              <div className="divide-y" style={{ borderColor: '#EAEEF5' }}>
                {visibleUrgent.map((product) => <ProductRow key={product.id} product={product} mode="priority" />)}
              </div>
            ) : (
              <EmptyState label="No urgent or high-priority products in this filter." />
            )}
          </Section>

          <Section title="Stage load" icon={Layers3}>
            <div className="space-y-3">
              {topStages.map((stage) => (
                <StageLoadRow key={stage.id} stage={stage} max={topStages[0]?.count ?? 1} />
              ))}
            </div>
          </Section>
        </div>

        <div className="grid gap-5 xl:grid-cols-[1fr_1fr]">
          <Section title="Upcoming PPS / shelf timing" icon={Clock3}>
            {visibleUpcoming.length > 0 ? (
              <div className="divide-y" style={{ borderColor: '#EAEEF5' }}>
                {visibleUpcoming.map((product) => <ProductRow key={product.id} product={product} mode="deadline" />)}
              </div>
            ) : (
              <EmptyState label="No PPS or shelf dates land in the next 21 days." />
            )}
          </Section>

          <Section
            title="Active projects"
            icon={Briefcase}
            action="Open projects"
            onAction={() => setScreen('projects')}
          >
            {data.activeProjectRows.length > 0 ? (
              <div className="divide-y" style={{ borderColor: '#EAEEF5' }}>
                {data.activeProjectRows.slice(0, 8).map((project) => <ProjectRow key={project.id} project={project} />)}
              </div>
            ) : (
              <EmptyState label="No active projects in this filter." />
            )}
          </Section>
        </div>
      </div>
    </div>
  )
}

function Metric({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string
  value: string
  icon: typeof Activity
  color: string
}) {
  return (
    <div className="rounded-lg border px-4 py-3" style={{ borderColor: '#EAEEF5', background: '#fff' }}>
      <div className="flex items-center justify-between gap-3">
        <span className="text-[12px] font-semibold uppercase tracking-[0.04em]" style={{ color: '#94A0B5' }}>
          {label}
        </span>
        <span className="flex size-8 items-center justify-center rounded-lg" style={{ background: `${color}18` }}>
          <Icon className="size-4" style={{ color }} />
        </span>
      </div>
      <div className="mt-2 text-[25px] font-extrabold leading-none" style={{ color: '#1B2840' }}>
        {value}
      </div>
    </div>
  )
}

function Section({
  title,
  icon: Icon,
  action,
  onAction,
  children,
}: {
  title: string
  icon: typeof Activity
  action?: string
  onAction?: () => void
  children: React.ReactNode
}) {
  return (
    <section className="overflow-hidden rounded-lg border" style={{ borderColor: '#EAEEF5', background: '#fff' }}>
      <div className="flex items-center justify-between gap-3 px-4 py-3" style={{ borderBottom: '1px solid #EAEEF5' }}>
        <div className="flex min-w-0 items-center gap-2">
          <Icon className="size-4 shrink-0" style={{ color: '#0094FF' }} />
          <h2 className="truncate text-[14px] font-bold" style={{ color: '#1B2840' }}>
            {title}
          </h2>
        </div>
        {action && onAction && (
          <button
            onClick={onAction}
            className="flex shrink-0 items-center gap-1.5 rounded-md px-2 py-1 text-[12px] font-semibold transition-colors hover:bg-[#F6F8FC]"
            style={{ color: '#5A6883' }}
          >
            {action}
            <ArrowRight className="size-3.5" />
          </button>
        )}
      </div>
      <div>{children}</div>
    </section>
  )
}

function ProductRow({ product, mode }: { product: ProductSummary; mode: 'priority' | 'deadline' }) {
  const category = CATEGORY_COLORS[product.category] ?? CATEGORY_COLORS.unknown
  const priorityColor = PRIORITY_COLORS[product.priority] ?? PRIORITY_COLORS.normal
  const meta = mode === 'deadline'
    ? [product.ppsRequestedDate ? `PPS ${formatDate(product.ppsRequestedDate)}` : null, product.onShelfDate ? `Shelf ${formatDate(product.onShelfDate)}` : null]
    : [product.priority !== 'normal' ? product.priority : null, product.waitingOn, product.nextAction]

  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <div
        className="flex size-8 shrink-0 items-center justify-center rounded-lg"
        style={{ background: category.bg }}
      >
        <span className="text-[9px] font-black" style={{ color: category.accent }}>
          {CATEGORY_ICONS[product.category] ?? 'PRD'}
        </span>
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-center gap-2">
          <p className="truncate text-[13.5px] font-semibold" style={{ color: '#1B2840' }}>
            {[product.code, product.title].filter(Boolean).join(' · ')}
          </p>
          {mode === 'priority' && product.priority !== 'normal' && (
            <span className="size-2 shrink-0 rounded-full" style={{ background: priorityColor }} />
          )}
        </div>
        <p className="mt-0.5 truncate text-[12px]" style={{ color: '#5A6883' }}>
          {[product.businessUnit, product.retailerName, product.buyerName, product.stageName].filter(Boolean).join(' · ')}
        </p>
      </div>
      <div className="hidden max-w-[240px] shrink-0 text-right text-[12px] md:block" style={{ color: '#5A6883' }}>
        {meta.filter(Boolean).join(' · ') || product.licensorName || product.productTypeName || 'Open'}
      </div>
    </div>
  )
}

function StageLoadRow({ stage, max }: { stage: StageCount; max: number }) {
  const colors = stageColors(stage.name)
  const width = `${Math.max(5, Math.round((stage.count / Math.max(max, 1)) * 100))}%`

  return (
    <div className="px-4">
      <div className="mb-1 flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <span className="size-2 rounded-full" style={{ background: colors.dot }} />
          <span className="truncate text-[13px] font-semibold" style={{ color: '#1B2840' }}>
            {stage.name}
          </span>
        </div>
        <span className="text-[12px] font-semibold" style={{ color: '#5A6883' }}>
          {formatNumber(stage.count)}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full" style={{ background: '#EAEEF5' }}>
        <div className="h-full rounded-full" style={{ width, background: colors.dot }} />
      </div>
    </div>
  )
}

function ProjectRow({ project }: { project: Project }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg" style={{ background: '#DEEBFB' }}>
        <Briefcase className="size-4" style={{ color: '#2D7BD0' }} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13.5px] font-semibold" style={{ color: '#1B2840' }}>
          {project.title ?? '(untitled project)'}
        </p>
        <p className="mt-0.5 truncate text-[12px]" style={{ color: '#5A6883' }}>
          {[project.business_unit, relationName(project.retailer), relationName(project.buyer)].filter(Boolean).join(' · ')}
        </p>
      </div>
      <div className="hidden shrink-0 text-right text-[12px] md:block" style={{ color: '#5A6883' }}>
        {[project.pps_requested_date ? `PPS ${formatDate(project.pps_requested_date)}` : null, project.on_shelf_date ? `Shelf ${formatDate(project.on_shelf_date)}` : null].filter(Boolean).join(' · ') || relationName(project.design_collection)}
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
