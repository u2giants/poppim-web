import { useEffect, useMemo, useState } from 'react'
import { ExternalLink, FileText, Image, Search } from 'lucide-react'
import { useAppState } from '@/lib/appState'
import type { Design } from '@/lib/types'
import { fetchDesigns, fetchProductCountsByDesign } from './api'

const STATUS_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  unpicked: { bg: '#FBEBD3', color: '#9A5A00', label: 'Unpicked' },
  picked: { bg: '#D8EFE7', color: '#14745D', label: 'Picked' },
  offered_to_multiple: { bg: '#DEEBFB', color: '#2563A8', label: 'Multi-offer' },
}

function relationName(value: unknown): string | null {
  if (!value || typeof value === 'string') return null
  if (typeof value === 'object' && 'name' in value && typeof value.name === 'string') return value.name
  return null
}

function businessUnitLabel(raw: string | null) {
  if (!raw) return 'Unknown'
  if (raw === 'POP Creations') return 'POP'
  if (raw === 'Spruce Line') return 'Spruce'
  return raw
}

function statusStyle(status: string | null | undefined) {
  return STATUS_STYLE[status ?? ''] ?? { bg: '#EEF1F6', color: '#5A6883', label: status ?? 'No status' }
}

export function DesignLibraryPage() {
  const { businessUnit, searchQuery } = useAppState()
  const [designs, setDesigns] = useState<Design[]>([])
  const [counts, setCounts] = useState<Map<string, number>>(new Map())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    Promise.all([
      fetchDesigns({ businessUnit, search: searchQuery }),
      fetchProductCountsByDesign(),
    ])
      .then(([nextDesigns, nextCounts]) => {
        if (!active) return
        setDesigns(nextDesigns)
        setCounts(nextCounts)
      })
      .catch((error) => {
        console.error(error)
        if (!active) return
        setDesigns([])
        setCounts(new Map())
      })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [businessUnit, searchQuery])

  const grouped = useMemo(() => {
    const map = new Map<string, Design[]>()
    for (const design of designs) {
      const key = statusStyle(design.status).label
      ;(map.get(key) ?? map.set(key, []).get(key)!).push(design)
    }
    return [...map.entries()]
  }, [designs])

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center text-sm" style={{ color: '#94A0B5' }}>
        Loading design library...
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto bg-white">
      <div className="mx-auto flex max-w-[1480px] flex-col gap-5 px-7 py-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-[22px] font-extrabold leading-tight" style={{ color: '#1B2840' }}>
              Design library
            </h1>
            <p className="mt-1 text-[13.5px]" style={{ color: '#5A6883' }}>
              {designs.length.toLocaleString()} reusable design record{designs.length === 1 ? '' : 's'} in this view
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-lg border px-3 py-2 text-[12.5px]" style={{ borderColor: '#EAEEF5', color: '#5A6883' }}>
            <Search className="size-4" />
            <span>{searchQuery.trim() ? `Searching "${searchQuery.trim()}"` : 'Use sidebar search'}</span>
          </div>
        </div>

        {designs.length === 0 ? (
          <div className="rounded-lg border px-5 py-10 text-center text-[13.5px]" style={{ borderColor: '#EAEEF5', color: '#94A0B5' }}>
            No designs match this filter.
          </div>
        ) : (
          <div className="space-y-6">
            {grouped.map(([group, rows]) => (
              <section key={group}>
                <div className="mb-3 flex items-center gap-2">
                  <h2 className="text-[14px] font-bold" style={{ color: '#1B2840' }}>{group}</h2>
                  <span className="rounded px-1.5 py-0.5 text-[11px] font-semibold" style={{ background: '#EAEEF5', color: '#5A6883' }}>
                    {rows.length}
                  </span>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                  {rows.map((design) => (
                    <DesignCard key={design.id} design={design} productCount={counts.get(design.id) ?? 0} />
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

function DesignCard({ design, productCount }: { design: Design; productCount: number }) {
  const status = statusStyle(design.status)
  const licensor = relationName(design.licensor)
  const property = relationName(design.property)
  const type = relationName(design.product_type)
  const season = relationName(design.season)
  const firstOfferedTo = relationName(design.first_offered_to)

  return (
    <article className="overflow-hidden rounded-lg border" style={{ borderColor: '#EAEEF5', background: '#fff' }}>
      <div className="aspect-[4/3] bg-[#F6F8FC]">
        {design.thumbnail_url ? (
          <img src={design.thumbnail_url} alt="" className="h-full w-full object-cover" loading="lazy" />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Image className="size-10" style={{ color: '#C0C8D8' }} />
          </div>
        )}
      </div>
      <div className="space-y-3 p-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="line-clamp-2 text-[13.5px] font-bold leading-snug" style={{ color: '#1B2840' }}>
              {design.name ?? '(unnamed design)'}
            </h3>
            <p className="mt-1 text-[12px]" style={{ color: '#5A6883' }}>
              {[businessUnitLabel(design.business_unit), type, season].filter(Boolean).join(' · ')}
            </p>
          </div>
          <span className="shrink-0 rounded-md px-2 py-0.5 text-[11px] font-bold" style={{ background: status.bg, color: status.color }}>
            {status.label}
          </span>
        </div>

        <div className="space-y-1 text-[12px]" style={{ color: '#5A6883' }}>
          <p className="truncate">{[licensor, property, design.theme].filter(Boolean).join(' · ') || 'No licensor/property theme'}</p>
          <p className="truncate">{firstOfferedTo ? `First offered to ${firstOfferedTo}` : 'No first-offer account'}</p>
        </div>

        <div className="flex items-center justify-between gap-3 pt-1">
          <span className="rounded px-1.5 py-0.5 text-[11px] font-semibold" style={{ background: '#EAEEF5', color: '#5A6883' }}>
            {productCount} product{productCount === 1 ? '' : 's'}
          </span>
          {design.nas_path && (
            <span className="flex min-w-0 items-center gap-1 text-[11.5px]" style={{ color: '#5A6883' }} title={design.nas_path}>
              <FileText className="size-3.5 shrink-0" />
              <span className="truncate">NAS path</span>
              <ExternalLink className="size-3 shrink-0" />
            </span>
          )}
        </div>
      </div>
    </article>
  )
}
