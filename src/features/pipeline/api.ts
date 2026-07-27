import type { Product, Stage } from '@/lib/types'
import type { BusinessUnit } from '@/domain/products/types'
import { supabaseProductToProduct } from '@/domain/products/supabaseAdapter'
import { api, pim, unwrap } from '@/lib/supabaseQuery'

export { fetchStages } from '@/domain/reference/api'
export { setProductStage, stageId } from '../board/api'

const PAGE_SIZE = 100

export interface FetchProductsOpts {
  search?: string
  licensorIds?: string[]
  listNames?: string[]
  businessUnit?: BusinessUnit
  lifecycleStates?: string[]
  limit?: number
}

export interface ListFacet {
  folderName: string | null
  listName: string
  count: number
}

interface CursorPayload {
  v: 1
  updatedAt: string
  id: string
}

export interface PipelinePage {
  products: Product[]
  nextCursor: string | null
}

export interface PipelineInitialData {
  page: PipelinePage
  count: number | null
  facets: ListFacet[] | null
}

function requiredBusinessUnit(unit?: BusinessUnit): Exclude<BusinessUnit, 'Unknown'> {
  if (!unit || unit === 'Unknown') throw new Error('Choose a department before loading the pipeline.')
  return unit
}

function encodeCursor(payload: CursorPayload): string {
  return btoa(JSON.stringify(payload))
}

function decodeCursor(cursor?: string | null): CursorPayload | null {
  if (!cursor) return null
  try {
    const value = JSON.parse(atob(cursor)) as Partial<CursorPayload>
    if (value.v !== 1 || !value.updatedAt || !value.id) throw new Error()
    return value as CursorPayload
  } catch {
    throw new Error('The pipeline cursor is invalid. Reload the list and try again.')
  }
}

function rpcArgs(opts: Omit<FetchProductsOpts, 'limit'>) {
  return {
    p_business_unit: requiredBusinessUnit(opts.businessUnit),
    p_search: opts.search?.trim() || undefined,
    p_licensor_ids: opts.licensorIds?.length ? opts.licensorIds : undefined,
    p_list_names: opts.listNames?.length ? opts.listNames : undefined,
    p_lifecycle_states: opts.lifecycleStates?.length ? opts.lifecycleStates : undefined,
  }
}

function normalizeRpcRow(row: Record<string, unknown>): Record<string, unknown> {
  return {
    ...row,
    metadata: {
      business_unit: row.business_unit,
      description: row.description,
      clickup_parent_id: row.clickup_parent_id,
      clickup_status_type: row.clickup_status_type,
      clickup_status_color: row.clickup_status_color,
      clickup_status_order: row.clickup_status_order,
      clickup_folder_name: row.clickup_folder_name,
      clickup_list_name: row.clickup_list_name,
      clickup_time_estimate_ms: row.clickup_time_estimate_ms,
      clickup_orderindex: row.clickup_orderindex,
      next_action: row.next_action,
      next_owner_name: row.next_owner_name,
      next_owner_role_name: row.next_owner_role_name,
      waiting_on: row.waiting_on,
      blocker_reason: row.blocker_reason,
      risk_level: row.risk_level,
      pps_requested_date: row.pps_requested_date,
      on_shelf_date: row.on_shelf_date,
      pi_status: row.pi_status,
      brand_assurance_number: row.brand_assurance_number,
      closure_reason: row.closure_reason,
    },
  }
}

export async function fetchPipelinePage(
  opts: FetchProductsOpts,
  cursor?: string | null,
): Promise<PipelinePage> {
  const decoded = decodeCursor(cursor)
  const limit = Math.min(Math.max(opts.limit ?? PAGE_SIZE, 1), 200)
  const { data, error } = await api().rpc('pm_pipeline_page', {
    ...rpcArgs(opts),
    p_limit: limit,
    p_after_updated_at: decoded?.updatedAt,
    p_after_id: decoded?.id,
  })
  const rows = unwrap<Array<Record<string, unknown>>>({ data, error })
  const products = rows.map((row) => supabaseProductToProduct(normalizeRpcRow(row) as never))
  const last = rows.at(-1)
  const nextCursor = rows.length === limit && last?.updated_at && last?.id
    ? encodeCursor({ v: 1, updatedAt: String(last.updated_at), id: String(last.id) })
    : null
  return { products, nextCursor }
}

export async function fetchPipelineProducts(opts: FetchProductsOpts = {}): Promise<Product[]> {
  return (await fetchPipelinePage(opts)).products
}

export async function countPipelineProducts(opts: Omit<FetchProductsOpts, 'limit'> = {}): Promise<number> {
  const { data, error } = await api().rpc('pm_pipeline_count', rpcArgs(opts))
  return Number(unwrap<number>({ data, error }) ?? 0)
}

export async function fetchListFacets(businessUnit?: BusinessUnit): Promise<ListFacet[]> {
  const { data, error } = await api().rpc('pm_pipeline_list_facets', {
    p_business_unit: requiredBusinessUnit(businessUnit),
  })
  return unwrap<Array<{ folder_name: string | null; list_name: string; product_count: number | string }>>({ data, error })
    .map((row) => ({ folderName: row.folder_name, listName: row.list_name, count: Number(row.product_count) }))
}

export async function fetchPipelineInitial(opts: FetchProductsOpts): Promise<PipelineInitialData> {
  const page = await fetchPipelinePage(opts)
  const [countResult, facetResult] = await Promise.allSettled([
    countPipelineProducts(opts),
    fetchListFacets(opts.businessUnit),
  ])
  return {
    page,
    count: countResult.status === 'fulfilled' ? countResult.value : null,
    facets: facetResult.status === 'fulfilled' ? facetResult.value : null,
  }
}

export async function fetchPipelineProductById(id: string): Promise<Product | null> {
  const { data, error } = await pim()
    .from('product')
    .select('id,code,name,status,stage,lifecycle_status,cover_url,project_id,company_id,buyer_contact_id,factory_id,licensor_id,property_id,product_type_id,clickup_task_id,clickup_parent_id,clickup_status,updated_at,metadata')
    .eq('id', id)
    .maybeSingle()
  const row = unwrap<Record<string, unknown> | null>({ data, error })
  return row ? supabaseProductToProduct(row as never) : null
}

export function stageById(stages: Stage[]): Map<string, Stage> {
  return new Map(stages.map((s) => [s.id, s]))
}
