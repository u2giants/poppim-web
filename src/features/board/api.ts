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
        { stage: ['id', 'name'] },
        { retailer: ['id', 'name'] },
      ],
      limit,
    }),
  ) as Promise<Product[]>
}

export function stageId(p: Product): string | null {
  if (!p.stage) return null
  return typeof p.stage === 'string' ? p.stage : p.stage.id
}
