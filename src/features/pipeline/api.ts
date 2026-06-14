import { readItems, aggregate } from '@directus/sdk'
import { directus } from '@/lib/directus'
import type { Product, Stage } from '@/lib/types'
import type { BusinessUnit } from '@/domain/products/types'
export { fetchStages } from '@/domain/reference/api'
export { setProductStage, stageId } from '../board/api'

export const PRODUCT_SUMMARY_FIELDS = [
  'id',
  'code',
  'name',
  'description',
  'priority',
  'business_unit',
  'lifecycle_state',
  'next_action',
  'waiting_on',
  'blocker_reason',
  'risk_level',
  'blocked_since',
  'last_meaningful_update_at',
  'on_shelf_date',
  'pps_requested_date',
  'pi_status',
  'brand_assurance_number',
  'closure_reason',
  'cover_url',
  'clickup_url',
  'clickup_list_name',
  'clickup_parent_id',
  'clickup_top_level_parent_id',
  'clickup_status',
  'clickup_status_type',
  'clickup_status_color',
  'clickup_status_order',
  'clickup_created_at',
  'clickup_updated_at',
  'clickup_closed_at',
  'clickup_start_at',
  'clickup_due_at',
  { stage: ['id', 'name'] },
  { licensor: ['id', 'name'] },
  { property: ['id', 'name'] },
  { product_type: ['id', 'name'] },
  { project: ['id', 'title', 'status', 'business_unit', 'on_shelf_date', { retailer: ['id', 'name'] }, { buyer: ['id', 'name', 'samples_required'] }] },
  { design: ['id', 'name', 'status', 'theme', 'thumbnail_url'] },
  { factory: ['id', 'name'] },
] as const

function buildFilter(opts: Omit<FetchProductsOpts, 'limit'> = {}): Record<string, unknown> {
  const { search, licensorIds, businessUnit, lifecycleStates } = opts
  const and: unknown[] = [{ stage: { _nnull: true } }]
  if (search?.trim()) {
    and.push({ _or: [{ name: { _icontains: search.trim() } }, { code: { _icontains: search.trim() } }] })
  }
  if (licensorIds?.length) and.push({ licensor: { id: { _in: licensorIds } } })
  if (businessUnit === 'Licensed') {
    and.push({ business_unit: { _in: ['POP', 'POP Creations'] } })
    and.push({ clickup_status_type: { _in: ['open', 'custom'] } })
    and.push({ clickup_parent_id: { _null: true } })
  }
  if (businessUnit === 'Generic') {
    and.push({ business_unit: { _in: ['Spruce', 'Spruce Line'] } })
    and.push({ clickup_status_type: { _in: ['open', 'custom'] } })
    and.push({ clickup_parent_id: { _null: true } })
  }
  if (businessUnit === 'Software') {
    and.push({ business_unit: { _eq: 'Software' } })
    and.push({ clickup_status_type: { _in: ['open', 'custom'] } })
    and.push({ clickup_parent_id: { _null: true } })
  }
  void lifecycleStates
  return { _and: and }
}

export interface FetchProductsOpts {
  search?: string
  licensorIds?: string[]
  businessUnit?: BusinessUnit
  lifecycleStates?: string[]
  limit?: number
}

export async function fetchPipelineProducts(opts: FetchProductsOpts = {}): Promise<Product[]> {
  const { limit = 300 } = opts
  return directus.request(
    readItems('product', {
      fields: PRODUCT_SUMMARY_FIELDS,
      filter: buildFilter(opts) as never,
      sort: ['-clickup_updated_at', 'name'],
      limit,
    }),
  ) as Promise<Product[]>
}

export async function countPipelineProducts(opts: Omit<FetchProductsOpts, 'limit'> = {}): Promise<number> {
  const result = await directus.request(
    aggregate('product', {
      aggregate: { count: '*' },
      filter: buildFilter(opts) as never,
    }),
  ) as Array<{ count: { '*': string } }>
  return parseInt(result[0]?.count?.['*'] ?? '0', 10)
}

export function stageById(stages: Stage[]): Map<string, Stage> {
  return new Map(stages.map((s) => [s.id, s]))
}
