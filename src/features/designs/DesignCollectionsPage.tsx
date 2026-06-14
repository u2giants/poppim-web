import { useEffect, useMemo, useState } from 'react'
import { Layers3, Search } from 'lucide-react'
import { useAppState } from '@/lib/appState'
import type { DesignCollection } from '@/lib/types'
import { fetchDesignCollections, fetchProjectCountsByDesignCollection } from './api'

function relationName(value: DesignCollection['account_specific_for']): string {
  if (!value) return 'Account-agnostic'
  return typeof value === 'string' ? value : value.name ?? 'Account-agnostic'
}

function formatDate(iso: string | null): string {
  if (!iso) return 'No version date'
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function businessUnitLabel(raw: string | null) {
  if (!raw) return 'Unknown'
  if (raw === 'Spruce Line') return 'Spruce'
  return raw
}

export function DesignCollectionsPage() {
  const { businessUnit, searchQuery } = useAppState()
  const [collections, setCollections] = useState<DesignCollection[]>([])
  const [counts, setCounts] = useState<Map<string, number>>(new Map())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    Promise.all([
      fetchDesignCollections({ businessUnit, search: searchQuery }),
      fetchProjectCountsByDesignCollection(),
    ])
      .then(([nextCollections, nextCounts]) => {
        if (!active) return
        setCollections(nextCollections)
        setCounts(nextCounts)
      })
      .catch((error) => {
        console.error(error)
        if (!active) return
        setCollections([])
        setCounts(new Map())
      })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [businessUnit, searchQuery])

  const grouped = useMemo(() => {
    const map = new Map<string, DesignCollection[]>()
    for (const collection of collections) {
      const key = collection.format || 'No format'
      ;(map.get(key) ?? map.set(key, []).get(key)!).push(collection)
    }
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b))
  }, [collections])

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center text-sm" style={{ color: '#94A0B5' }}>
        Loading design collections...
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto bg-white">
      <div className="mx-auto flex max-w-[1480px] flex-col gap-5 px-7 py-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-[22px] font-extrabold leading-tight" style={{ color: '#1B2840' }}>
              Design collections
            </h1>
            <p className="mt-1 text-[13.5px]" style={{ color: '#5A6883' }}>
              {collections.length.toLocaleString()} Spruce trend/art collection{collections.length === 1 ? '' : 's'} in this view
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-lg border px-3 py-2 text-[12.5px]" style={{ borderColor: '#EAEEF5', color: '#5A6883' }}>
            <Search className="size-4" />
            <span>{searchQuery.trim() ? `Searching "${searchQuery.trim()}"` : 'Use sidebar search'}</span>
          </div>
        </div>

        {collections.length === 0 ? (
          <div className="rounded-lg border px-5 py-10 text-center text-[13.5px]" style={{ borderColor: '#EAEEF5', color: '#94A0B5' }}>
            No design collections match this filter.
          </div>
        ) : (
          <div className="space-y-6">
            {grouped.map(([format, rows]) => (
              <section key={format}>
                <div className="mb-3 flex items-center gap-2">
                  <h2 className="text-[14px] font-bold" style={{ color: '#1B2840' }}>{format}</h2>
                  <span className="rounded px-1.5 py-0.5 text-[11px] font-semibold" style={{ background: '#EAEEF5', color: '#5A6883' }}>
                    {rows.length}
                  </span>
                </div>
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {rows.map((collection) => (
                    <CollectionCard
                      key={collection.id}
                      collection={collection}
                      projectCount={counts.get(collection.id) ?? 0}
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

function CollectionCard({
  collection,
  projectCount,
}: {
  collection: DesignCollection
  projectCount: number
}) {
  return (
    <article className="rounded-lg border p-4" style={{ borderColor: '#EAEEF5', background: '#fff' }}>
      <div className="flex items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg" style={{ background: '#D8EFF5' }}>
          <Layers3 className="size-5" style={{ color: '#0891B2' }} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <h3 className="line-clamp-2 text-[14px] font-bold leading-snug" style={{ color: '#1B2840' }}>
              {collection.name ?? '(unnamed collection)'}
            </h3>
            <span className="shrink-0 rounded-md px-2 py-0.5 text-[11px] font-bold" style={{ background: '#DEEBFB', color: '#2563A8' }}>
              {businessUnitLabel(collection.business_unit)}
            </span>
          </div>
          <p className="mt-1 line-clamp-1 text-[12.5px]" style={{ color: '#5A6883' }}>
            {[collection.theme, collection.format].filter(Boolean).join(' · ') || 'No theme'}
          </p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 text-[12px]">
        <CollectionFact label="Account" value={relationName(collection.account_specific_for)} />
        <CollectionFact label="Version" value={formatDate(collection.version_date)} />
        <CollectionFact label="Projects" value={`${projectCount}`} />
      </div>
    </article>
  )
}

function CollectionFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-md px-2 py-1.5" style={{ background: '#F6F8FC' }}>
      <div className="text-[10.5px] font-bold uppercase tracking-[0.04em]" style={{ color: '#94A0B5' }}>
        {label}
      </div>
      <div className="mt-0.5 truncate font-semibold" style={{ color: '#1B2840' }} title={value}>
        {value}
      </div>
    </div>
  )
}
