import { readItems, updateItem } from '@directus/sdk'
import { directus } from '@/lib/directus'
import type { Product, Stage } from '@/lib/types'

export async function setProductStage(productId: string, stageId: string | null) {
  return directus.request(updateItem('product', productId, { stage: stageId }))
}

export async function fetchStages(): Promise<Stage[]> {
  return directus.request(
    readItems('stage', { sort: ['stage_order'], limit: -1 }),
  ) as Promise<Stage[]>
}

// First slice loads a capped page of products; filtering/pagination comes next.
export async function fetchProducts(limit = 500): Promise<Product[]> {
  return directus.request(
    readItems('product', {
      fields: [
        'id',
        'code',
        'name',
        'business_unit',
        'on_shelf_date',
        'pi_status',
        'cover_url',
        { stage: ['id', 'name'] },
        { retailer: ['id', 'name'] },
        { licensor: ['id', 'name'] },
      ],
      limit,
    }),
  ) as Promise<Product[]>
}

// Assignee membership for the loaded products (sparse), for the Assignee filter.
export async function fetchAssigneeMap() {
  const rows = (await directus.request(
    readItems('product_assignee', {
      fields: ['product', { directus_user: ['id'] }] as never,
      limit: -1,
    }),
  )) as unknown as Array<{ product: string; directus_user: { id: string } | string }>
  const map = new Map<string, Set<string>>()
  for (const r of rows) {
    const uid = typeof r.directus_user === 'string' ? r.directus_user : r.directus_user?.id
    if (!r.product || !uid) continue
    if (!map.has(r.product)) map.set(r.product, new Set())
    map.get(r.product)!.add(uid)
  }
  return map
}

export function stageId(p: Product): string | null {
  if (!p.stage) return null
  return typeof p.stage === 'string' ? p.stage : p.stage.id
}
