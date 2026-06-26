import { pim, unwrap } from '@/lib/supabaseQuery'
import type { Order } from '@/lib/types'
import type { BusinessUnit } from '@/domain/products/types'

export interface FetchOrdersOpts {
  search?: string
  businessUnit?: BusinessUnit
  limit?: number
}

export async function fetchOrders(opts: FetchOrdersOpts = {}): Promise<Order[]> {
  const { data, error } = await pim().from('customer_order').select('*').order('order_date', { ascending: false }).limit(opts.limit ?? 300)
  const q = opts.search?.trim().toLowerCase()
  return unwrap<any[]>({ data, error })
    .filter((row) => !q || [row.order_number, row.status, row.notes].filter(Boolean).join(' ').toLowerCase().includes(q))
    .map((row) => ({
      id: row.id,
      order_number: row.order_number,
      order_date: row.order_date,
      quantity: row.metadata?.quantity ?? null,
      retailer: row.company_id,
      buyer: null,
      product: row.product_id,
    })) as Order[]
}
