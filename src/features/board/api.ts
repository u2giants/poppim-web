import { pim, unwrap } from '@/lib/supabaseQuery'
import type { Product, Stage } from '@/lib/types'
import { supabaseProductToProduct } from '@/domain/products/supabaseAdapter'

export async function setProductStage(productId: string, stageId: string | null) {
  const stage = stageId ? await stageName(stageId) : null
  const { data, error } = await (pim() as any)
    .from('product')
    .update({ stage })
    .eq('id', productId)
    .select('*')
    .single()
  return unwrap<Record<string, unknown>>({ data, error })
}

async function stageName(stageId: string): Promise<string | null> {
  const { data, error } = await (pim() as any).from('stage').select('name').eq('id', stageId).maybeSingle()
  const row = unwrap<{ name: string } | null>({ data, error })
  return row?.name ?? null
}

export async function fetchStages(): Promise<Stage[]> {
  const { fetchStages } = await import('@/domain/reference/api')
  return fetchStages()
}

export async function fetchProducts(limit = 500): Promise<Product[]> {
  const { data, error } = await (pim() as any)
    .from('product')
    .select('*')
    .order('updated_at', { ascending: false })
    .limit(limit)
  return unwrap<Array<Record<string, unknown>>>({ data, error }).map((row) => supabaseProductToProduct(row as never))
}

export async function fetchAssigneeMap() {
  const rows = unwrap<Array<{ product_id: string; profile_id: string }>>(await (pim() as any)
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
