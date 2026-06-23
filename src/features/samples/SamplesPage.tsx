import { useEffect, useMemo, useState } from 'react'
import { ArrowRight, Camera, Factory, FlaskConical, TriangleAlert } from 'lucide-react'
import { productToSummary } from '@/domain/products/adapters'
import { useAppState } from '@/lib/appState'
import type { AppUser, Product, ProductSample } from '@/lib/types'
import { fetchSamples, updateSampleStatus } from '@/features/workflow/api'

function titleCase(value: string | null | undefined) {
  return (value ?? 'unknown').replaceAll('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

function formatDate(iso: string | null | undefined) {
  if (!iso) return 'No date'
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function relationName(value: unknown): string | null {
  if (!value || typeof value === 'string') return null
  if (typeof value === 'object' && 'name' in value && typeof value.name === 'string') return value.name
  if (typeof value === 'object' && 'title' in value && typeof value.title === 'string') return value.title
  return null
}

function userName(value: string | AppUser | null | undefined) {
  if (!value || typeof value === 'string') return null
  return [value.first_name, value.last_name].filter(Boolean).join(' ') || value.email
}

function productObject(row: ProductSample): Product | null {
  return row.product && typeof row.product === 'object' ? row.product : null
}

const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  needed: { bg: '#FBEBD3', color: '#9A6400' },
  requested: { bg: '#DEEBFB', color: '#2563A8' },
  in_factory: { bg: '#DEEBFB', color: '#2563A8' },
  received: { bg: '#D8EFF5', color: '#0E7490' },
  under_internal_review: { bg: '#ECE2F8', color: '#6B54C9' },
  sent_to_buyer: { bg: '#D8EFE7', color: '#14745D' },
  sent_to_licensor: { bg: '#D8EFE7', color: '#14745D' },
  approved: { bg: '#D8EFE7', color: '#14745D' },
  revision_needed: { bg: '#FBE2D8', color: '#9E3B1C' },
}

function statusStyle(status: string | null | undefined) {
  return STATUS_STYLE[status ?? ''] ?? { bg: '#EEF1F6', color: '#5A6883' }
}

export function SamplesPage() {
  const { businessUnit, searchQuery } = useAppState()
  const [rows, setRows] = useState<ProductSample[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    fetchSamples({ businessUnit, search: searchQuery })
      .then((next) => { if (active) setRows(next) })
      .catch((error) => {
        console.error(error)
        if (active) setRows([])
      })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [businessUnit, searchQuery])

  const groups = useMemo(() => {
    const map = new Map<string, ProductSample[]>()
    for (const row of rows) {
      const key = titleCase(row.status)
      ;(map.get(key) ?? map.set(key, []).get(key)!).push(row)
    }
    return [...map.entries()]
  }, [rows])

  if (loading) return <div className="flex h-full items-center justify-center text-sm" style={{ color: '#94A0B5' }}>Loading samples...</div>

  return (
    <div className="h-full overflow-y-auto bg-white">
      <div className="mx-auto flex max-w-[1480px] flex-col gap-5 px-7 py-6">
        <div>
          <h1 className="text-[22px] font-extrabold leading-tight" style={{ color: '#1B2840' }}>Samples / Factory</h1>
          <p className="mt-1 text-[13.5px]" style={{ color: '#5A6883' }}>
            Factory, buyer, licensor, PPS, production, and resample tracking
          </p>
        </div>

        {rows.length === 0 ? (
          <EmptyState label="No sample records match this filter yet." />
        ) : (
          <div className="space-y-6">
            {groups.map(([status, items]) => (
              <section key={status}>
                <GroupHeader label={status} count={items.length} />
                <div className="grid gap-3 xl:grid-cols-2">
                  {items.map((row) => (
                    <SampleCard
                      key={row.id}
                      row={row}
                      onUpdated={(next) => setRows((prev) => prev.map((item) => item.id === next.id ? { ...item, ...next } : item))}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function nextSampleStep(status: string | null | undefined): { status: string; label: string } | null {
  if (!status || status === 'needed') return { status: 'requested', label: 'Request' }
  if (status === 'requested') return { status: 'in_factory', label: 'In factory' }
  if (status === 'in_factory') return { status: 'received', label: 'Received' }
  if (status === 'received' || status === 'under_internal_review') return { status: 'approved', label: 'Approve' }
  return null
}

function SampleCard({ row, onUpdated }: { row: ProductSample; onUpdated: (row: ProductSample) => void }) {
  const product = productObject(row)
  const summary = product ? productToSummary(product) : null
  const status = statusStyle(row.status)
  const [busy, setBusy] = useState(false)
  const next = nextSampleStep(row.status)

  async function advance() {
    if (!next || busy) return
    setBusy(true)
    try {
      const updated = await updateSampleStatus(row.id, next.status)
      onUpdated({ ...row, ...updated, status: next.status })
    } catch (error) {
      console.error(error)
    } finally {
      setBusy(false)
    }
  }

  return (
    <article className="rounded-lg border p-4" style={{ borderColor: '#EAEEF5' }}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="line-clamp-1 text-[14px] font-bold" style={{ color: '#1B2840' }}>
            {summary ? summary.title : 'No product linked'}
          </h2>
          <p className="mt-1 line-clamp-1 text-[12.5px]" style={{ color: '#5A6883' }}>
            {[summary?.businessUnit, summary?.retailerName, summary?.buyerName, relationName(row.factory)].filter(Boolean).join(' · ') || relationName(row.project)}
          </p>
        </div>
        <span className="shrink-0 rounded-md px-2 py-0.5 text-[11px] font-bold" style={{ background: status.bg, color: status.color }}>
          {titleCase(row.status)}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-4 gap-2 text-[12px]">
        <Fact label="Type" value={titleCase(row.sample_type)} />
        <Fact label="Requested" value={formatDate(row.requested_at)} />
        <Fact label="Expected" value={formatDate(row.expected_at)} />
        <Fact label="Received" value={formatDate(row.received_at)} />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 text-[12px]">
        <Fact label="Buyer sent" value={formatDate(row.sent_to_buyer_at)} />
        <Fact label="Licensor sent" value={formatDate(row.sent_to_licensor_at)} />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-[12px]" style={{ color: '#5A6883' }}>
        <span className="inline-flex items-center gap-1">
          <Factory className="size-3.5" />
          {relationName(row.factory) ?? 'No factory'}
        </span>
        <span>{userName(row.requested_by) ? `Requested by ${userName(row.requested_by)}` : 'No requester'}</span>
        {(row.primary_photo || row.photo_urls) && (
          <span className="inline-flex items-center gap-1">
            <Camera className="size-3.5" />
            Photo proof
          </span>
        )}
      </div>

      {row.revision_required && (
        <div className="mt-3 rounded-md px-3 py-2 text-[12.5px]" style={{ background: '#FBE2D8', color: '#9E3B1C' }}>
          <span className="inline-flex items-center gap-1 font-bold"><TriangleAlert className="size-3.5" /> Revision required</span>
          {row.revision_reason && <p className="mt-1">{row.revision_reason}</p>}
        </div>
      )}

      <div className="mt-4 flex justify-end">
        {next ? (
          <button
            type="button"
            onClick={advance}
            disabled={busy}
            className="inline-flex h-8 items-center gap-1 rounded-lg border px-2.5 text-[12px] font-bold transition-colors hover:bg-[#F6F8FC] disabled:opacity-50"
            style={{ borderColor: '#EAEEF5', color: '#1B2840' }}
          >
            <ArrowRight className="size-3.5" />
            {busy ? 'Saving...' : next.label}
          </button>
        ) : (
          <span className="text-[12px]" style={{ color: '#94A0B5' }}>No next step</span>
        )}
      </div>
    </article>
  )
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-md px-2 py-1.5" style={{ background: '#F6F8FC' }}>
      <div className="text-[10.5px] font-bold uppercase tracking-[0.04em]" style={{ color: '#94A0B5' }}>{label}</div>
      <div className="mt-0.5 truncate font-semibold" style={{ color: '#1B2840' }} title={value}>{value}</div>
    </div>
  )
}

function GroupHeader({ label, count }: { label: string; count: number }) {
  return (
    <div className="mb-3 flex items-center gap-2">
      <FlaskConical className="size-4" style={{ color: '#0094FF' }} />
      <h2 className="text-[14px] font-bold" style={{ color: '#1B2840' }}>{label}</h2>
      <span className="rounded px-1.5 py-0.5 text-[11px] font-semibold" style={{ background: '#EAEEF5', color: '#5A6883' }}>{count}</span>
    </div>
  )
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="rounded-lg border px-5 py-10 text-center text-[13.5px]" style={{ borderColor: '#EAEEF5', color: '#94A0B5' }}>
      <FlaskConical className="mx-auto mb-2 size-6" />
      {label}
    </div>
  )
}
