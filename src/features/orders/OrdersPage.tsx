import { useEffect, useMemo, useState } from 'react'
import { ReceiptText, Search } from 'lucide-react'
import { productToSummary } from '@/domain/products/adapters'
import type { Order, Product } from '@/lib/types'
import { useAppState } from '@/lib/appState'
import { fetchOrders } from './api'

function relationName(value: unknown): string | null {
  if (!value || typeof value === 'string') return null
  if (typeof value === 'object' && 'name' in value && typeof value.name === 'string') return value.name
  if (typeof value === 'object' && 'title' in value && typeof value.title === 'string') return value.title
  return null
}

function formatDate(iso: string | null): string {
  if (!iso) return 'No order date'
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function productObject(order: Order): Product | null {
  return order.product && typeof order.product === 'object' ? order.product : null
}

export function OrdersPage() {
  const { businessUnit, searchQuery } = useAppState()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    fetchOrders({ businessUnit, search: searchQuery })
      .then((next) => { if (active) setOrders(next) })
      .catch((error) => {
        console.error(error)
        if (active) setOrders([])
      })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [businessUnit, searchQuery])

  const grouped = useMemo(() => {
    const map = new Map<string, Order[]>()
    for (const order of orders) {
      const product = productObject(order)
      const retailer = relationName(order.retailer) ?? relationName(product?.project && typeof product.project === 'object' ? product.project.retailer : null) ?? 'No retailer'
      ;(map.get(retailer) ?? map.set(retailer, []).get(retailer)!).push(order)
    }
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b))
  }, [orders])

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center text-sm" style={{ color: '#94A0B5' }}>
        Loading orders...
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto bg-white">
      <div className="mx-auto flex max-w-[1480px] flex-col gap-5 px-7 py-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-[22px] font-extrabold leading-tight" style={{ color: '#1B2840' }}>
              Orders
            </h1>
            <p className="mt-1 text-[13.5px]" style={{ color: '#5A6883' }}>
              {orders.length.toLocaleString()} purchase-order record{orders.length === 1 ? '' : 's'} in this view
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-lg border px-3 py-2 text-[12.5px]" style={{ borderColor: '#EAEEF5', color: '#5A6883' }}>
            <Search className="size-4" />
            <span>{searchQuery.trim() ? `Searching "${searchQuery.trim()}"` : 'Use sidebar search'}</span>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="rounded-lg border px-5 py-10 text-center text-[13.5px]" style={{ borderColor: '#EAEEF5', color: '#94A0B5' }}>
            No orders match this filter.
          </div>
        ) : (
          <div className="space-y-6">
            {grouped.map(([retailer, rows]) => (
              <section key={retailer}>
                <div className="mb-3 flex items-center gap-2">
                  <h2 className="text-[14px] font-bold" style={{ color: '#1B2840' }}>{retailer}</h2>
                  <span className="rounded px-1.5 py-0.5 text-[11px] font-semibold" style={{ background: '#EAEEF5', color: '#5A6883' }}>
                    {rows.length}
                  </span>
                </div>
                <div className="overflow-hidden rounded-lg border" style={{ borderColor: '#EAEEF5' }}>
                  <table className="w-full text-left">
                    <thead>
                      <tr style={{ borderBottom: '1px solid #EAEEF5' }}>
                        {(['Order', 'Product', 'Project', 'Buyer', 'Date', 'Qty'] as const).map((header) => (
                          <th
                            key={header}
                            className="bg-white px-4 py-3 text-[11px] font-bold uppercase tracking-[0.04em]"
                            style={{ color: '#94A0B5', width: header === 'Product' ? '28%' : undefined }}
                          >
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((order) => <OrderRow key={order.id} order={order} />)}
                    </tbody>
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

function OrderRow({ order }: { order: Order }) {
  const product = productObject(order)
  const summary = product ? productToSummary(product) : null
  const project = product?.project && typeof product.project === 'object' ? product.project : null
  const buyer = relationName(order.buyer) ?? relationName(project?.buyer) ?? 'No buyer'

  return (
    <tr className="transition-colors hover:bg-[#F6F8FC]" style={{ borderBottom: '1px solid #EAEEF5' }}>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="flex size-7 shrink-0 items-center justify-center rounded-lg" style={{ background: '#FBEBD3' }}>
            <ReceiptText className="size-3.5" style={{ color: '#C8942A' }} />
          </span>
          <span className="text-[13px] font-semibold" style={{ color: '#1B2840' }}>
            {order.order_number ?? '(no order number)'}
          </span>
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="min-w-0">
          <p className="line-clamp-1 text-[13px] font-semibold" style={{ color: '#1B2840' }}>
            {summary ? summary.title : 'No product linked'}
          </p>
          <p className="mt-0.5 line-clamp-1 text-[12px]" style={{ color: '#5A6883' }}>
            {[summary?.businessUnit, summary?.productTypeName, summary?.stageName].filter(Boolean).join(' · ') || 'No product context'}
          </p>
        </div>
      </td>
      <td className="px-4 py-3 text-[13px]" style={{ color: '#5A6883' }}>
        {summary?.projectTitle ?? 'No project'}
      </td>
      <td className="px-4 py-3 text-[13px]" style={{ color: '#5A6883' }}>
        {buyer}
      </td>
      <td className="px-4 py-3 text-[13px]" style={{ color: '#5A6883' }}>
        {formatDate(order.order_date)}
      </td>
      <td className="px-4 py-3 text-[13px] font-semibold" style={{ color: '#1B2840' }}>
        {order.quantity?.toLocaleString() ?? '—'}
      </td>
    </tr>
  )
}
