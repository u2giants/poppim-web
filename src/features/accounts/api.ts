import { aggregate, readItems } from '@directus/sdk'
import { directus } from '@/lib/directus'
import type { Buyer, Retailer } from '@/lib/types'

export interface AccountCounts {
  projects: number
  orders: number
}

export interface AccountRow {
  retailer: Retailer
  buyers: Buyer[]
  counts: AccountCounts
}

function countValue(row: { count?: { id?: string; '*'?: string } } | undefined): number {
  return parseInt(row?.count?.id ?? row?.count?.['*'] ?? '0', 10)
}

function countMap<T extends Record<string, unknown>>(rows: T[], key: keyof T): Map<string, number> {
  const map = new Map<string, number>()
  for (const row of rows) {
    const id = typeof row[key] === 'string' ? row[key] : null
    if (!id) continue
    map.set(id, countValue(row as never))
  }
  return map
}

export async function fetchAccountRows(search?: string): Promise<AccountRow[]> {
  const q = search?.trim()
  const [retailers, buyers, projectRows, orderRows] = await Promise.all([
    directus.request(
      readItems('retailer', {
        fields: ['id', 'name', 'resale_restriction', 'notes'],
        filter: q ? { name: { _icontains: q } } as never : undefined,
        sort: ['name'],
        limit: -1,
      }),
    ) as Promise<Retailer[]>,
    directus.request(
      readItems('buyer', {
        fields: ['id', 'name', 'email', 'samples_required', { retailer: ['id', 'name'] }],
        sort: ['name'],
        limit: -1,
      }),
    ) as Promise<Buyer[]>,
    directus.request(
      aggregate('project', {
        aggregate: { count: 'id' },
        groupBy: ['retailer'] as never,
        filter: { retailer: { _nnull: true } } as never,
      }),
    ) as unknown as Promise<Array<{ retailer: string | null; count: { id: string } }>>,
    directus.request(
      aggregate('order', {
        aggregate: { count: 'id' },
        groupBy: ['retailer'] as never,
        filter: { retailer: { _nnull: true } } as never,
      }),
    ) as unknown as Promise<Array<{ retailer: string | null; count: { id: string } }>>,
  ])

  const buyersByRetailer = new Map<string, Buyer[]>()
  for (const buyer of buyers) {
    const retailerId = typeof buyer.retailer === 'string' ? buyer.retailer : buyer.retailer?.id
    if (!retailerId) continue
    if (q && !buyer.name?.toLowerCase().includes(q.toLowerCase()) && !buyer.email?.toLowerCase().includes(q.toLowerCase())) continue
    ;(buyersByRetailer.get(retailerId) ?? buyersByRetailer.set(retailerId, []).get(retailerId)!).push(buyer)
  }

  const projectCounts = countMap(projectRows, 'retailer')
  const orderCounts = countMap(orderRows, 'retailer')
  const rows = retailers
    .map((retailer) => ({
      retailer,
      buyers: buyersByRetailer.get(retailer.id) ?? [],
      counts: {
        projects: projectCounts.get(retailer.id) ?? 0,
        orders: orderCounts.get(retailer.id) ?? 0,
      },
    }))

  if (!q) return rows
  const needle = q.toLowerCase()
  return rows.filter((row) =>
    row.retailer.name.toLowerCase().includes(needle)
    || row.buyers.some((buyer) => buyer.name?.toLowerCase().includes(needle) || buyer.email?.toLowerCase().includes(needle)),
  )
}
