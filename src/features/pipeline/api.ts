import type { Product, Stage } from '@/lib/types'
import type { BusinessUnit } from '@/domain/products/types'
import { supabaseProductToProduct } from '@/domain/products/supabaseAdapter'
import { api, metadata, unwrap } from '@/lib/supabaseQuery'

export { fetchStages } from '@/domain/reference/api'
export { setProductStage, stageId } from '../board/api'

export const PRODUCT_SUMMARY_FIELDS = ['*'] as const

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

function businessUnitMatches(row: Record<string, unknown>, unit?: BusinessUnit): boolean {
  if (!unit || unit === 'Unknown') return true
  const meta = metadata(row)
  const value = String(meta.business_unit ?? meta.department ?? '').toLowerCase()
  if (unit === 'Licensed') return ['licensed', 'pop', 'pop creations'].includes(value)
  if (unit === 'Generic') return ['generic', 'spruce', 'spruce line'].includes(value)
  return value === 'software'
}

function rowMatches(row: Record<string, unknown>, opts: Omit<FetchProductsOpts, 'limit'>): boolean {
  const meta = metadata(row)
  const q = opts.search?.trim().toLowerCase()
  if (q) {
    const haystack = [row.name, row.code, row.project_title, row.company_name, row.licensor_name, meta.clickup_list_name]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
    if (!haystack.includes(q)) return false
  }
  if (opts.licensorIds?.length && !opts.licensorIds.includes(String(row.licensor_id ?? ''))) return false
  if (opts.listNames?.length && !opts.listNames.includes(String(meta.clickup_list_name ?? ''))) return false
  if (!businessUnitMatches(row, opts.businessUnit)) return false
  const statusType = String(meta.clickup_status_type ?? '').toLowerCase()
  if (statusType && !['open', 'custom'].includes(statusType)) return false
  if (meta.clickup_parent_id) return false
  return true
}

async function fetchBoardRows(opts: FetchProductsOpts = {}) {
  const { data, error } = await (api() as any)
    .from('pm_product_board')
    .select('*')
    .order('updated_at', { ascending: false })
    .limit(opts.limit ?? 5000)
  const rows = unwrap<Array<Record<string, unknown>>>({ data, error })
  return rows.filter((row) => rowMatches(row, opts))
}

export async function fetchListFacets(businessUnit?: BusinessUnit): Promise<ListFacet[]> {
  const rows = await fetchBoardRows({ businessUnit, limit: 10000 })
  const counts = new Map<string, ListFacet>()
  for (const row of rows) {
    const meta = metadata(row)
    const listName = typeof meta.clickup_list_name === 'string' ? meta.clickup_list_name : null
    if (!listName) continue
    const folderName = typeof meta.clickup_folder_name === 'string' ? meta.clickup_folder_name : null
    const existing = counts.get(listName) ?? { folderName, listName, count: 0 }
    existing.count += 1
    counts.set(listName, existing)
  }
  return [...counts.values()].sort((a, b) => b.count - a.count)
}

export async function fetchPipelineProducts(opts: FetchProductsOpts = {}): Promise<Product[]> {
  const rows = await fetchBoardRows(opts)
  return rows.map((row) => supabaseProductToProduct(row as never))
}

export async function countPipelineProducts(opts: Omit<FetchProductsOpts, 'limit'> = {}): Promise<number> {
  const rows = await fetchBoardRows({ ...opts, limit: 10000 })
  return rows.length
}

export function stageById(stages: Stage[]): Map<string, Stage> {
  return new Map(stages.map((s) => [s.id, s]))
}
