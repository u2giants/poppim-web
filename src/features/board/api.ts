import { pim, unwrap } from '@/lib/supabaseQuery'
import type { Product, Stage } from '@/lib/types'
import { enrichProductRowsWithBoardFields } from '@/domain/products/enrich'
import { supabaseProductToProduct } from '@/domain/products/supabaseAdapter'

export async function setProductStage(productId: string, stageId: string | null) {
  const current = await pim().from('product').select('stage').eq('id', productId).maybeSingle()
  const currentStageName = unwrap<{ stage: string | null } | null>({ data: current.data, error: current.error })?.stage ?? null
  const stage = stageId ? await stageName(stageId) : null
  const { data, error } = await pim()
    .from('product')
    .update({ stage })
    .eq('id', productId)
    .select('*')
    .single()
  const updated = unwrap<Record<string, unknown>>({ data, error })
  const fromStageId = currentStageName ? await stageIdByName(currentStageName) : null
  if (fromStageId !== stageId) {
    const history = await pim().from('stage_history').insert({ product_id: productId, from_stage_id: fromStageId, to_stage_id: stageId })
    if (history.error) throw new Error(history.error.message)
  }
  return updated
}

async function stageName(stageId: string): Promise<string | null> {
  const { data, error } = await pim().from('stage').select('name').eq('id', stageId).maybeSingle()
  const row = unwrap<{ name: string } | null>({ data, error })
  return row?.name ?? null
}

async function stageIdByName(name: string): Promise<string | null> {
  const { data, error } = await pim().from('stage').select('id').eq('name', name).limit(1).maybeSingle()
  const row = unwrap<{ id: string } | null>({ data, error })
  return row?.id ?? null
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
