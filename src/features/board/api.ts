import { api, pim, unwrap } from '@/lib/supabaseQuery'
import type { Product, Stage } from '@/lib/types'
import { enrichProductRowsWithBoardFields } from '@/domain/products/enrich'
import { supabaseProductToProduct } from '@/domain/products/supabaseAdapter'

export async function setProductStage(productId: string, stageId: string | null) {
  if (!stageId) throw new Error('A target stage is required.')
  const { data, error } = await api().rpc('pm_set_product_stage', {
    p_product_id: productId,
    p_target_stage_id: stageId,
  })
  return unwrap<Array<Record<string, unknown>>>({ data, error })[0]
}

export async function fetchStages(): Promise<Stage[]> {
  const { fetchStages } = await import('@/domain/reference/api')
  return fetchStages()
}

export async function fetchProducts(limit = 500): Promise<Product[]> {
  const { data, error } = await pim()
    .from('product')
    .select('*')
    .order('updated_at', { ascending: false })
    .limit(limit)
  const rows = await enrichProductRowsWithBoardFields(unwrap<Array<Record<string, unknown>>>({ data, error }))
  return rows.map((row) => supabaseProductToProduct(row as never))
}

export async function fetchAssigneeMap() {
  const rows = unwrap<Array<{ product_id: string; profile_id: string }>>(await pim()
    .from('product_assignee')
    .select('product_id,profile_id'))
  const map = new Map<string, Set<string>>()
  for (const row of rows) {
    if (!row.product_id || !row.profile_id) continue
    if (!map.has(row.product_id)) map.set(row.product_id, new Set())
    map.get(row.product_id)!.add(row.profile_id)
  }
  return map
}

export function stageId(p: Product): string | null {
  if (!p.stage) return null
  return typeof p.stage === 'string' ? p.stage : p.stage.id
}
