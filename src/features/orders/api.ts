import { readItems } from '@directus/sdk'
import { directus } from '@/lib/directus'
import type { Order } from '@/lib/types'
import type { BusinessUnit } from '@/domain/products/types'

export interface FetchOrdersOpts {
  search?: string
  businessUnit?: BusinessUnit | 'All'
  limit?: number
}

function businessUnitClause(businessUnit: BusinessUnit | 'All' | undefined): unknown[] {
  if (!businessUnit || businessUnit === 'All' || businessUnit === 'Unknown') return []
  if (businessUnit === 'POP') return [{ product: { business_unit: { _in: ['POP', 'POP Creations'] } } }]
  return [{ product: { business_unit: { _in: ['Spruce', 'Spruce Line'] } } }]
}

function searchClause(search: string | undefined): unknown[] {
  const q = search?.trim()
  if (!q) return []
  return [{
    _or: [
      { order_number: { _icontains: q } },
      { product: { code: { _icontains: q } } },
      { product: { name: { _icontains: q } } },
    ],
  }]
}

export async function fetchOrders(opts: FetchOrdersOpts = {}): Promise<Order[]> {
  const { limit = 300 } = opts
  return directus.request(
    readItems('order', {
      fields: [
        'id',
        'order_number',
        'order_date',
        'quantity',
        { retailer: ['id', 'name'] },
        { buyer: ['id', 'name'] },
        {
          product: [
            'id',
            'code',
            'name',
            'business_unit',
            { stage: ['id', 'name'] },
            { project: ['id', 'title', { retailer: ['id', 'name'] }, { buyer: ['id', 'name'] }] },
            { design: ['id', 'name', 'status', 'theme'] },
            { licensor: ['id', 'name'] },
            { property: ['id', 'name'] },
            { product_type: ['id', 'name'] },
          ],
        },
      ],
      filter: { _and: [...businessUnitClause(opts.businessUnit), ...searchClause(opts.search)] } as never,
      sort: ['-order_date', 'order_number'],
      limit,
    }),
  ) as Promise<Order[]>
}
