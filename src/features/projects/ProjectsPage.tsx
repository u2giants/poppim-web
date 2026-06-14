import { useEffect, useMemo, useRef, useState } from 'react'
import { Briefcase, X, ChevronRight } from 'lucide-react'
import type { Project, Product } from '@/lib/types'
import { fetchProjects, fetchProjectProductCounts, fetchProjectProducts } from './api'
import { productToSummary } from '@/domain/products/adapters'
import { CATEGORY_COLORS, CATEGORY_ICONS, LICENSOR_META, STAGE_COLORS, stageColor } from '@/domain/products/presentation'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function resolveStageColor(name: string) { return STAGE_COLORS[name] ?? stageColor(name) }

function retailerName(r: Project['retailer']): string {
  if (!r) return '—'
  return typeof r === 'object' ? r.name : r
}

function buyerName(b: Project['buyer']): string {
  if (!b) return '—'
  return typeof b === 'object' ? b.name ?? '—' : b
}

function designCollectionName(c: Project['design_collection']): string {
  if (!c) return '—'
  return typeof c === 'object' ? [c.name, c.theme].filter(Boolean).join(' · ') || '—' : c
}

function formatDate(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const STATUS_STYLE: Record<string, { bg: string; dot: string; label: string }> = {
  active: { bg: '#DEEBFB', dot: '#3B82F6', label: 'Active' },
  won:    { bg: '#D8EFE7', dot: '#10B981', label: 'Won' },
}

function useDebounce<T>(value: T, ms: number): T {
  const [d, setD] = useState(value)
  useEffect(() => { const t = setTimeout(() => setD(value), ms); return () => clearTimeout(t) }, [value, ms])
  return d
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [counts, setCounts] = useState<Map<string, number>>(new Map())
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'won'>('all')
  const [selected, setSelected] = useState<Project | null>(null)

  const debouncedSearch = useDebounce(search, 200)

  useEffect(() => {
    Promise.all([fetchProjects(), fetchProjectProductCounts()])
      .then(([ps, c]) => { setProjects(ps); setCounts(c) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const visible = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase()
    return projects.filter((p) => {
      if (statusFilter !== 'all' && p.status !== statusFilter) return false
      if (q && ![
        p.title,
        retailerName(p.retailer),
        buyerName(p.buyer),
        designCollectionName(p.design_collection),
      ].some((value) => value?.toLowerCase().includes(q))) return false
      return true
    })
  }, [projects, debouncedSearch, statusFilter])

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center text-sm" style={{ color: '#94A0B5' }}>
        Loading projects…
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      {/* Toolbar */}
      <div
        className="flex shrink-0 items-center gap-3 px-6 py-3"
        style={{ borderBottom: '1px solid #EAEEF5' }}
      >
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search projects…"
          className="rounded-lg border px-3 py-1.5 text-[13px] outline-none transition-colors"
          style={{ borderColor: '#EAEEF5', color: '#1B2840', width: 240 }}
          onFocus={(e) => { (e.currentTarget as HTMLElement).style.borderColor = '#0094FF' }}
          onBlur={(e) => { (e.currentTarget as HTMLElement).style.borderColor = '#EAEEF5' }}
        />

        {/* Status filter tabs */}
        <div className="flex items-center rounded-[10px] p-1" style={{ background: '#F6F8FC' }}>
          {(['all', 'active', 'won'] as const).map((v) => (
            <button
              key={v}
              onClick={() => setStatusFilter(v)}
              className="rounded-lg px-3 py-1 text-[12.5px] font-medium capitalize transition-all"
              style={
                statusFilter === v
                  ? { background: '#fff', color: '#1B2840', boxShadow: '0 1px 4px rgba(20,40,80,0.10)' }
                  : { color: '#5A6883' }
              }
            >
              {v === 'all' ? `All (${projects.length})` : `${v.charAt(0).toUpperCase() + v.slice(1)} (${projects.filter(p => p.status === v).length})`}
            </button>
          ))}
        </div>

        <div className="flex-1" />
        <span className="text-[12px]" style={{ color: '#94A0B5' }}>{visible.length} project{visible.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-left">
          <thead>
            <tr style={{ borderBottom: '1px solid #EAEEF5' }}>
              {(['Project', 'Status', 'Business Unit', 'Retailer', 'Buyer', 'PPS', 'Shelf Date', 'SKUs'] as const).map((h) => (
                <th
                  key={h}
                  className="sticky top-0 bg-white px-5 py-3 text-[11px] font-bold uppercase tracking-[0.04em]"
                  style={{ color: '#94A0B5', zIndex: 1, width: h === 'Project' ? '32%' : undefined }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.map((project) => {
              const st = STATUS_STYLE[project.status ?? ''] ?? STATUS_STYLE.active
              const count = counts.get(project.id) ?? 0
              return (
                <tr
                  key={project.id}
                  className="cursor-pointer transition-colors hover:bg-[#F6F8FC]"
                  style={{ borderBottom: '1px solid #EAEEF5' }}
                  onClick={() => setSelected(project)}
                >
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <ChevronRight className="size-3.5 shrink-0" style={{ color: '#C0C8D8' }} />
                      <span className="text-[13.5px] font-semibold line-clamp-1" style={{ color: '#1B2840' }}>
                        {project.title ?? '(untitled)'}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="inline-flex items-center gap-1.5 rounded-lg px-2 py-0.5 text-[12px] font-semibold"
                      style={{ background: st.bg, color: '#1B2840' }}
                    >
                      <span className="size-1.5 rounded-full shrink-0" style={{ background: st.dot }} />
                      {st.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[13px]" style={{ color: '#5A6883' }}>
                    {project.business_unit ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-[13px]" style={{ color: '#5A6883' }}>
                    {retailerName(project.retailer)}
                  </td>
                  <td className="px-4 py-3 text-[13px]" style={{ color: '#5A6883' }}>
                    {buyerName(project.buyer)}
                  </td>
                  <td className="px-4 py-3 text-[13px]" style={{ color: '#5A6883' }}>
                    {formatDate(project.pps_requested_date ?? null)}
                  </td>
                  <td className="px-4 py-3 text-[13px]" style={{ color: '#5A6883' }}>
                    {formatDate(project.on_shelf_date)}
                  </td>
                  <td className="px-4 py-3">
                    {count > 0 ? (
                      <span
                        className="rounded px-2 py-0.5 text-[11.5px] font-semibold"
                        style={{ background: '#EAEEF5', color: '#5A6883' }}
                      >
                        {count}
                      </span>
                    ) : (
                      <span className="text-[13px]" style={{ color: '#C0C8D8' }}>—</span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {visible.length === 0 && (
          <div className="flex h-32 items-center justify-center text-[13px]" style={{ color: '#94A0B5' }}>
            No projects match your search.
          </div>
        )}
      </div>

      {selected && (
        <ProjectDetailModal project={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  )
}

// ─── Detail modal ─────────────────────────────────────────────────────────────

function ProjectDetailModal({ project, onClose }: { project: Project; onClose: () => void }) {
  const [products, setProducts] = useState<Product[]>([])
  const [loadingProducts, setLoadingProducts] = useState(true)
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  useEffect(() => {
    fetchProjectProducts(project.id)
      .then(setProducts)
      .catch(() => setProducts([]))
      .finally(() => setLoadingProducts(false))
  }, [project.id])

  const st = STATUS_STYLE[project.status ?? ''] ?? STATUS_STYLE.active

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(20,40,80,0.45)' }}
      onClick={(e) => { if (e.target === overlayRef.current) onClose() }}
    >
      <div
        className="flex overflow-hidden"
        style={{
          width: 'min(1080px, 95vw)',
          height: 'min(750px, 92vh)',
          borderRadius: 16,
          background: '#fff',
          boxShadow: '0 24px 64px -16px rgba(20,40,80,0.40)',
        }}
      >
        {/* Left: project details */}
        <div className="flex min-w-0 flex-1 flex-col overflow-y-auto">
          {/* Top bar */}
          <div className="flex shrink-0 items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid #EAEEF5' }}>
            <span className="text-[13px]" style={{ color: '#5A6883' }}>
              {project.business_unit} / Project
            </span>
            <button
              onClick={onClose}
              className="flex items-center justify-center rounded-lg p-1.5 transition-colors hover:bg-[#F6F8FC]"
            >
              <X className="size-5" style={{ color: '#5A6883' }} />
            </button>
          </div>

          {/* Type chip */}
          <div className="px-6 pt-5">
            <span
              className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[12px] font-semibold"
              style={{ background: '#F6F8FC', color: '#5A6883' }}
            >
              <Briefcase className="size-3.5" />
              Project
            </span>
          </div>

          {/* Title */}
          <h2 className="px-6 pt-3 font-extrabold leading-tight" style={{ fontSize: 22, color: '#1B2840', letterSpacing: '-0.02em' }}>
            {project.title ?? '(untitled)'}
          </h2>

          {/* Fields */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-4 px-6 pt-5">
            <ModalField label="Status">
              <span
                className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[12.5px] font-semibold"
                style={{ background: st.bg, color: '#1B2840' }}
              >
                <span className="size-2 rounded-full shrink-0" style={{ background: st.dot }} />
                {st.label}
              </span>
            </ModalField>

            <ModalField label="Retailer">
              <span className="text-[13.5px] font-semibold" style={{ color: '#1B2840' }}>
                {retailerName(project.retailer)}
              </span>
            </ModalField>

            <ModalField label="Buyer">
              <span className="text-[13.5px] font-semibold" style={{ color: '#1B2840' }}>
                {buyerName(project.buyer)}
              </span>
            </ModalField>

            <ModalField label="On Shelf">
              <span className="text-[13.5px] font-semibold" style={{ color: '#1B2840' }}>
                {formatDate(project.on_shelf_date)}
              </span>
            </ModalField>

            <ModalField label="PPS Requested">
              <span className="text-[13.5px] font-semibold" style={{ color: '#1B2840' }}>
                {formatDate(project.pps_requested_date ?? null)}
              </span>
            </ModalField>

            <ModalField label="Business Unit">
              <span className="text-[13.5px] font-semibold" style={{ color: '#1B2840' }}>
                {project.business_unit ?? '—'}
              </span>
            </ModalField>

            <ModalField label="Design Collection">
              <span className="text-[13.5px] font-semibold" style={{ color: '#1B2840' }}>
                {designCollectionName(project.design_collection)}
              </span>
            </ModalField>
          </div>

          {/* Brief */}
          {project.brief && (
            <div className="px-6 pt-5">
              <ModalField label="Brief">
                <p className="mt-1 text-[13px] leading-relaxed whitespace-pre-wrap" style={{ color: '#5A6883' }}>
                  {project.brief}
                </p>
              </ModalField>
            </div>
          )}

          {/* Restrictions */}
          {project.restrictions && (
            <div className="px-6 pt-4">
              <ModalField label="Restrictions">
                <p className="mt-1 text-[13px] leading-relaxed whitespace-pre-wrap" style={{ color: '#D2502B' }}>
                  {project.restrictions}
                </p>
              </ModalField>
            </div>
          )}

          <div className="flex-1 px-6 pb-6" />
        </div>

        {/* Right: SKUs */}
        <div className="flex w-[400px] shrink-0 flex-col" style={{ borderLeft: '1px solid #EAEEF5' }}>
          <div className="shrink-0 px-6 py-4" style={{ borderBottom: '1px solid #EAEEF5' }}>
            <h3 className="text-[15px] font-bold" style={{ color: '#1B2840' }}>
              SKUs
              {!loadingProducts && (
                <span className="ml-2 rounded px-1.5 py-0.5 text-[11px] font-semibold" style={{ background: '#EAEEF5', color: '#5A6883' }}>
                  {products.length}
                </span>
              )}
            </h3>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-1">
            {loadingProducts && (
              <p className="text-[13px]" style={{ color: '#94A0B5' }}>Loading SKUs…</p>
            )}
            {!loadingProducts && products.length === 0 && (
              <p className="text-[13px]" style={{ color: '#94A0B5' }}>No SKUs linked to this project.</p>
            )}
            {products.map((p) => {
              const task = productToSummary(p)
              const catColors = CATEGORY_COLORS[task.category]
              const stageColors = resolveStageColor(task.stageName)
              const licMeta = task.licensorName ? LICENSOR_META[task.licensorName] : null
              return (
                <div
                  key={p.id}
                  className="flex items-start gap-2.5 rounded-xl px-3 py-2.5 transition-colors hover:bg-[#F6F8FC]"
                >
                  <div
                    className="flex size-[26px] shrink-0 items-center justify-center rounded-lg text-sm mt-0.5"
                    style={{ background: catColors?.bg ?? '#F6F8FC' }}
                  >
                    <span className="text-[8px] font-black" style={{ color: catColors?.accent ?? '#5A6883' }}>
                      {CATEGORY_ICONS[task.category] ?? 'PRD'}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-1 text-[12.5px] font-semibold" style={{ color: '#1B2840' }}>
                      {[task.code, task.title].filter(Boolean).join(' · ')}
                    </p>
                    <div className="mt-0.5 flex items-center gap-2">
                      <span
                        className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px]"
                        style={{ background: stageColors.bg, color: '#5A6883' }}
                      >
                        <span className="size-1.5 rounded-full shrink-0" style={{ background: stageColors.dot }} />
                        {task.stageName}
                      </span>
                      {licMeta && (
                        <span
                          className="rounded-full px-1.5 py-0.5 text-[10px] font-bold text-white"
                          style={{ background: licMeta.gradient }}
                        >
                          {task.licensorName}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

function ModalField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-1 text-[12px] font-medium" style={{ color: '#0094FF' }}>{label}</div>
      <div>{children}</div>
    </div>
  )
}
