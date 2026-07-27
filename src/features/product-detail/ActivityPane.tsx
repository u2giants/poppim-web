import { useEffect, useState } from 'react'
import { reportOptionalDataError } from '@/lib/uiError'
import type { ProductActivity, ProductLink, ProductTimeEntry } from '@/lib/types'
import { listProductActivity, listProductLinks, listProductTimeEntries } from '@/features/board/collab'
import { PaneHeading } from './ProductDetailPrimitives'
import { formatDate, productLabel } from './formatters'

export function ActivityPane({ productId }: { productId: string }) {
  const [items, setItems] = useState<ProductActivity[]>([])
  const [links, setLinks] = useState<ProductLink[]>([])
  const [timeEntries, setTimeEntries] = useState<ProductTimeEntry[]>([])

  useEffect(() => {
    Promise.all([listProductActivity(productId), listProductLinks(productId), listProductTimeEntries(productId)])
      .then(([freshItems, freshLinks, freshTimeEntries]) => {
        setItems(freshItems)
        setLinks(freshLinks)
        setTimeEntries(freshTimeEntries)
      })
      .catch((error) => reportOptionalDataError('productDetail.loadActivity', 'Activity, links, and time entries', error))
  }, [productId])

  return (
    <div className="flex-1 overflow-y-auto px-6 py-4">
      {items.length === 0 && links.length === 0 && timeEntries.length === 0 && (
        <p className="text-[13px]" style={{ color: '#94A0B5' }}>No imported activity yet.</p>
      )}
      {links.length > 0 && (
        <div className="mb-5">
          <PaneHeading>Links</PaneHeading>
          <div className="space-y-2">
            {links.map((link) => (
              <div key={link.id} className="rounded-lg border p-3" style={{ borderColor: '#EAEEF5' }}>
                <div className="text-[12px] font-semibold uppercase" style={{ color: '#0094FF' }}>
                  {[link.relation_type, link.direction].filter(Boolean).join(' · ') || 'Linked task'}
                </div>
                <div className="mt-1 text-[13px] font-semibold" style={{ color: '#1B2840' }}>
                  {productLabel(link.linked_product) || link.linked_title || link.linked_external_id || 'Linked item'}
                </div>
                <div className="mt-1 text-[12px]" style={{ color: '#94A0B5' }}>
                  {[link.created_by, formatDate(link.created_at)].filter(Boolean).join(' · ')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {timeEntries.length > 0 && (
        <div className="mb-5">
          <PaneHeading>Time</PaneHeading>
          <div className="space-y-2">
            {timeEntries.map((entry) => (
              <div key={entry.id} className="rounded-lg border p-3" style={{ borderColor: '#EAEEF5' }}>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[13px] font-semibold" style={{ color: '#1B2840' }}>
                    {entry.user_name || entry.user_email || 'Unknown'}
                  </span>
                  <span className="text-[12px] font-bold" style={{ color: '#0094FF' }}>
                    {entry.duration_hours ? `${entry.duration_hours}h` : '—'}
                  </span>
                </div>
                {entry.description && <p className="mt-1 text-[13px]" style={{ color: '#5A6883' }}>{entry.description}</p>}
                <div className="mt-1 text-[12px]" style={{ color: '#94A0B5' }}>
                  {[formatDate(entry.started_at), entry.billable ? 'Billable' : null, entry.tags].filter(Boolean).join(' · ')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className="flex gap-2.5">
            <div className="mt-1 size-2 shrink-0 rounded-full" style={{ background: '#0094FF' }} />
            <div className="min-w-0 flex-1">
              <div className="text-[13px] font-semibold" style={{ color: '#1B2840' }}>{item.action || 'Activity'}</div>
              {item.detail && <p className="mt-0.5 text-[13px] leading-relaxed" style={{ color: '#5A6883' }}>{item.detail}</p>}
              <div className="mt-1 text-[12px]" style={{ color: '#94A0B5' }}>
                {[item.actor_name, formatDate(item.happened_at)].filter(Boolean).join(' · ')}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
