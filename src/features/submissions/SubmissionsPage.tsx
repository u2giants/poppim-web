import { useEffect, useMemo, useState } from 'react'
import { ArrowRight, ExternalLink, FileCheck2, Send, UserRound } from 'lucide-react'
import { productToSummary } from '@/domain/products/adapters'
import { useAppState } from '@/lib/appState'
import type { DirectusUser, Product, ProductSubmission } from '@/lib/types'
import { fetchSubmissions, updateSubmissionStatus } from '@/features/workflow/api'

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

function userName(value: string | DirectusUser | null | undefined) {
  if (!value || typeof value === 'string') return null
  return [value.first_name, value.last_name].filter(Boolean).join(' ') || value.email
}

function productObject(row: ProductSubmission): Product | null {
  return row.product && typeof row.product === 'object' ? row.product : null
}

const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  ready: { bg: '#DEEBFB', color: '#2563A8' },
  submitted: { bg: '#FBEBD3', color: '#9A6400' },
  waiting: { bg: '#FBEBD3', color: '#9A6400' },
  changes_requested: { bg: '#FBE2D8', color: '#9E3B1C' },
  approved: { bg: '#D8EFE7', color: '#14745D' },
  rejected: { bg: '#F6CDBC', color: '#9E3B1C' },
}

function statusStyle(status: string | null | undefined) {
  return STATUS_STYLE[status ?? ''] ?? { bg: '#EEF1F6', color: '#5A6883' }
}

export function SubmissionsPage() {
  const { businessUnit, searchQuery } = useAppState()
  const [rows, setRows] = useState<ProductSubmission[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    fetchSubmissions({ businessUnit, search: searchQuery })
      .then((next) => { if (active) setRows(next) })
      .catch((error) => {
        console.error(error)
        if (active) setRows([])
      })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [businessUnit, searchQuery])

  const groups = useMemo(() => {
    const map = new Map<string, ProductSubmission[]>()
    for (const row of rows) {
      const key = titleCase(row.status)
      ;(map.get(key) ?? map.set(key, []).get(key)!).push(row)
    }
    return [...map.entries()]
  }, [rows])

  if (loading) {
    return <div className="flex h-full items-center justify-center text-sm" style={{ color: '#94A0B5' }}>Loading submissions...</div>
  }

  return (
    <div className="h-full overflow-y-auto bg-white">
      <div className="mx-auto flex max-w-[1480px] flex-col gap-5 px-7 py-6">
        <div>
          <h1 className="text-[22px] font-extrabold leading-tight" style={{ color: '#1B2840' }}>Submissions</h1>
          <p className="mt-1 text-[13.5px]" style={{ color: '#5A6883' }}>
            Internal reviews, licensor submissions, buyer submissions, PPS, packaging, and production approvals
          </p>
        </div>

        {rows.length === 0 ? (
          <EmptyState label="No submissions match this filter yet." />
        ) : (
          <div className="space-y-6">
            {groups.map(([status, items]) => (
              <section key={status}>
                <GroupHeader label={status} count={items.length} />
                <div className="overflow-hidden rounded-lg border" style={{ borderColor: '#EAEEF5' }}>
                  <table className="w-full text-left">
                    <thead>
                      <tr style={{ borderBottom: '1px solid #EAEEF5' }}>
                        {(['Product', 'Type', 'Recipient', 'Submitted', 'Expected', 'Proof', 'Revision', 'Action'] as const).map((h) => (
                          <th key={h} className="bg-white px-4 py-3 text-[11px] font-bold uppercase tracking-[0.04em]" style={{ color: '#94A0B5', width: h === 'Product' ? '30%' : undefined }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>{items.map((row) => (
                      <SubmissionRow
                        key={row.id}
                        row={row}
                        onUpdated={(next) => setRows((prev) => prev.map((item) => item.id === next.id ? { ...item, ...next } : item))}
                      />
                    ))}</tbody>
                  </table>
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function nextSubmissionStep(status: string | null | undefined): { status: string; label: string } | null {
  if (!status || status === 'ready') return { status: 'submitted', label: 'Submit' }
  if (status === 'submitted') return { status: 'waiting', label: 'Wait' }
  if (status === 'waiting' || status === 'changes_requested') return { status: 'approved', label: 'Approve' }
  return null
}

function SubmissionRow({ row, onUpdated }: { row: ProductSubmission; onUpdated: (row: ProductSubmission) => void }) {
  const product = productObject(row)
  const summary = product ? productToSummary(product) : null
  const status = statusStyle(row.status)
  const [busy, setBusy] = useState(false)
  const next = nextSubmissionStep(row.status)

  async function advance() {
    if (!next || busy) return
    setBusy(true)
    try {
      const updated = await updateSubmissionStatus(row.id, next.status)
      onUpdated({ ...row, ...updated, status: next.status })
    } catch (error) {
      console.error(error)
    } finally {
      setBusy(false)
    }
  }

  return (
    <tr className="transition-colors hover:bg-[#F6F8FC]" style={{ borderBottom: '1px solid #EAEEF5' }}>
      <td className="px-4 py-3">
        <p className="line-clamp-1 text-[13px] font-semibold" style={{ color: '#1B2840' }}>
          {summary ? summary.title : 'No product linked'}
        </p>
        <p className="mt-0.5 line-clamp-1 text-[12px]" style={{ color: '#5A6883' }}>
          {[summary?.businessUnit, summary?.retailerName, summary?.buyerName, summary?.licensorName].filter(Boolean).join(' · ') || relationName(row.project)}
        </p>
      </td>
      <td className="px-4 py-3">
        <span className="rounded-md px-2 py-0.5 text-[11px] font-bold" style={{ background: status.bg, color: status.color }}>
          {titleCase(row.submission_type)}
        </span>
      </td>
      <td className="px-4 py-3 text-[13px]" style={{ color: '#5A6883' }}>
        {[titleCase(row.recipient_type), relationName(row.licensor)].filter(Boolean).join(' · ')}
      </td>
      <td className="px-4 py-3 text-[13px]" style={{ color: '#5A6883' }}>
        <div>{formatDate(row.submitted_at)}</div>
        <div className="mt-0.5 text-[12px]" style={{ color: '#94A0B5' }}>{userName(row.submitted_by)}</div>
      </td>
      <td className="px-4 py-3 text-[13px]" style={{ color: '#5A6883' }}>{formatDate(row.expected_response_at)}</td>
      <td className="px-4 py-3 text-[13px]" style={{ color: '#5A6883' }}>
        {row.portal_url ? (
          <a href={row.portal_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-semibold" style={{ color: '#0094FF' }}>
            <ExternalLink className="size-3.5" />
            {row.portal_reference || row.brand_assurance_number || 'Portal'}
          </a>
        ) : row.brand_assurance_number ? (
          <span className="inline-flex items-center gap-1"><FileCheck2 className="size-3.5" />{row.brand_assurance_number}</span>
        ) : '—'}
      </td>
      <td className="px-4 py-3 text-[13px]" style={{ color: row.revision_required ? '#D2502B' : '#5A6883' }}>
        {row.revision_required ? 'Required' : '—'}
      </td>
      <td className="px-4 py-3">
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
          <span className="text-[12px]" style={{ color: '#94A0B5' }}>—</span>
        )}
      </td>
    </tr>
  )
}

function GroupHeader({ label, count }: { label: string; count: number }) {
  return (
    <div className="mb-3 flex items-center gap-2">
      <Send className="size-4" style={{ color: '#0094FF' }} />
      <h2 className="text-[14px] font-bold" style={{ color: '#1B2840' }}>{label}</h2>
      <span className="rounded px-1.5 py-0.5 text-[11px] font-semibold" style={{ background: '#EAEEF5', color: '#5A6883' }}>{count}</span>
    </div>
  )
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="rounded-lg border px-5 py-10 text-center text-[13.5px]" style={{ borderColor: '#EAEEF5', color: '#94A0B5' }}>
      <UserRound className="mx-auto mb-2 size-6" />
      {label}
    </div>
  )
}
