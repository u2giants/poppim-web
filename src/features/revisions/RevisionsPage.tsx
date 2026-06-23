import { useEffect, useMemo, useState } from 'react'
import { CheckCircle2, FilePenLine, Paperclip, UserRoundCheck } from 'lucide-react'
import { productToSummary } from '@/domain/products/adapters'
import { useAppState } from '@/lib/appState'
import type { AppUser, Product, RevisionRequest } from '@/lib/types'
import { fetchRevisions, updateRevisionStatus } from '@/features/workflow/api'

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

function productObject(row: RevisionRequest): Product | null {
  return row.product && typeof row.product === 'object' ? row.product : null
}

const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  open: { bg: '#FBEBD3', color: '#9A6400' },
  in_progress: { bg: '#DEEBFB', color: '#2563A8' },
  resolved: { bg: '#D8EFE7', color: '#14745D' },
  accepted: { bg: '#D8EFE7', color: '#14745D' },
  rejected: { bg: '#FBE2D8', color: '#9E3B1C' },
  canceled: { bg: '#EEF1F6', color: '#5A6883' },
}

function statusStyle(status: string | null | undefined) {
  return STATUS_STYLE[status ?? ''] ?? { bg: '#EEF1F6', color: '#5A6883' }
}

export function RevisionsPage() {
  const { businessUnit, searchQuery } = useAppState()
  const [rows, setRows] = useState<RevisionRequest[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    fetchRevisions({ businessUnit, search: searchQuery })
      .then((next) => { if (active) setRows(next) })
      .catch((error) => {
        console.error(error)
        if (active) setRows([])
      })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [businessUnit, searchQuery])

  const groups = useMemo(() => {
    const map = new Map<string, RevisionRequest[]>()
    for (const row of rows) {
      const key = titleCase(row.status)
      ;(map.get(key) ?? map.set(key, []).get(key)!).push(row)
    }
    return [...map.entries()]
  }, [rows])

  if (loading) return <div className="flex h-full items-center justify-center text-sm" style={{ color: '#94A0B5' }}>Loading revisions...</div>

  return (
    <div className="h-full overflow-y-auto bg-white">
      <div className="mx-auto flex max-w-[1480px] flex-col gap-5 px-7 py-6">
        <div>
          <h1 className="text-[22px] font-extrabold leading-tight" style={{ color: '#1B2840' }}>Reviews / Revisions</h1>
          <p className="mt-1 text-[13.5px]" style={{ color: '#5A6883' }}>
            Change requests from creative directors, licensors, buyers, factories, and internal review
          </p>
        </div>

        {rows.length === 0 ? (
          <EmptyState label="No revision requests match this filter yet." />
        ) : (
          <div className="space-y-6">
            {groups.map(([status, items]) => (
              <section key={status}>
                <GroupHeader label={status} count={items.length} />
                <div className="grid gap-3 xl:grid-cols-2">
                  {items.map((row) => (
                    <RevisionCard
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

function canResolve(status: string | null | undefined) {
  return !['resolved', 'accepted', 'rejected', 'canceled'].includes(status ?? '')
}

function RevisionCard({ row, onUpdated }: { row: RevisionRequest; onUpdated: (row: RevisionRequest) => void }) {
  const product = productObject(row)
  const summary = product ? productToSummary(product) : null
  const status = statusStyle(row.status)
  const [busy, setBusy] = useState(false)

  async function resolve() {
    if (!canResolve(row.status) || busy) return
    setBusy(true)
    try {
      const updated = await updateRevisionStatus(row.id, 'resolved')
      onUpdated({ ...row, ...updated, status: 'resolved', resolved_at: updated.resolved_at ?? new Date().toISOString() })
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
            {summary ? summary.title : relationName(row.design) ?? 'Revision request'}
          </h2>
          <p className="mt-1 line-clamp-1 text-[12.5px]" style={{ color: '#5A6883' }}>
            {[summary?.businessUnit, summary?.retailerName, summary?.buyerName, summary?.licensorName].filter(Boolean).join(' · ') || relationName(row.project)}
          </p>
        </div>
        <span className="shrink-0 rounded-md px-2 py-0.5 text-[11px] font-bold" style={{ background: status.bg, color: status.color }}>
          {titleCase(row.status)}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-4 gap-2 text-[12px]">
        <Fact label="Source" value={titleCase(row.source)} />
        <Fact label="Requested" value={formatDate(row.requested_at)} />
        <Fact label="Due" value={formatDate(row.due_at)} />
        <Fact label="Resolved" value={formatDate(row.resolved_at)} />
      </div>

      {row.body && (
        <p className="mt-3 line-clamp-3 text-[13px] leading-relaxed" style={{ color: '#1B2840' }}>
          {row.body}
        </p>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-2 text-[12px]" style={{ color: '#5A6883' }}>
        <span className="inline-flex items-center gap-1">
          <UserRoundCheck className="size-3.5" />
          {userName(row.assigned_to) ? `Assigned to ${userName(row.assigned_to)}` : 'Unassigned'}
        </span>
        <span>{userName(row.requested_by_user) || row.requested_by_external || 'No requester'}</span>
        {row.markup_file && (
          <span className="inline-flex items-center gap-1">
            <Paperclip className="size-3.5" />
            Markup
          </span>
        )}
      </div>

      <div className="mt-4 flex justify-end">
        {canResolve(row.status) ? (
          <button
            type="button"
            onClick={resolve}
            disabled={busy}
            className="inline-flex h-8 items-center gap-1 rounded-lg border px-2.5 text-[12px] font-bold transition-colors hover:bg-[#F6F8FC] disabled:opacity-50"
            style={{ borderColor: '#EAEEF5', color: '#1B2840' }}
          >
            <CheckCircle2 className="size-3.5" />
            {busy ? 'Saving...' : 'Resolve'}
          </button>
        ) : (
          <span className="text-[12px]" style={{ color: '#94A0B5' }}>Closed</span>
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
      <FilePenLine className="size-4" style={{ color: '#0094FF' }} />
      <h2 className="text-[14px] font-bold" style={{ color: '#1B2840' }}>{label}</h2>
      <span className="rounded px-1.5 py-0.5 text-[11px] font-semibold" style={{ background: '#EAEEF5', color: '#5A6883' }}>{count}</span>
    </div>
  )
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="rounded-lg border px-5 py-10 text-center text-[13.5px]" style={{ borderColor: '#EAEEF5', color: '#94A0B5' }}>
      <FilePenLine className="mx-auto mb-2 size-6" />
      {label}
    </div>
  )
}
