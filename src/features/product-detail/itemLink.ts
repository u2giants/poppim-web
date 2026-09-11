import { dynamicApi, pim, unwrap } from '@/lib/supabaseQuery'
import { updateProduct } from '@/features/board/collab'

/** Canonical UUIDs only. api.plm_item_list.id is a legacy compatibility ID. */
export interface CanonicalItem {
  item_id: string
  item_number: string | null
  description: string | null
  company_code: string | null
  division_code: string | null
  source_system: string
  source_id: string
}

const FIELDS = 'item_id,item_number,description,company_code,division_code,source_system,source_id'
const PAGE_SIZE = 20

export async function searchCanonicalItems(search: string, after?: string) {
  let query = dynamicApi().from('pim_item_picker').select(FIELDS)
    .order('item_id', { ascending: true }).limit(PAGE_SIZE + 1)
  const term = search.trim()
  if (term) query = query.ilike('item_number', `%${term.replace(/[\\%_]/g, '\\$&')}%`)
  if (after) query = query.gt('item_id', after)
  const rows = unwrap<CanonicalItem[]>(await query)
  const items = rows.slice(0, PAGE_SIZE)
  return { items, next: rows.length > PAGE_SIZE ? items.at(-1)!.item_id : null }
}

export async function readProductItemLink(productId: string) {
  const product = unwrap<{ plm_item_id: string | null }>(await pim().from('product')
    .select('plm_item_id').eq('id', productId).single())
  if (!product.plm_item_id) return null
  const item = unwrap<CanonicalItem | null>(await dynamicApi().from('pim_item_picker')
    .select(FIELDS).eq('item_id', product.plm_item_id).maybeSingle())
  if (!item) throw new Error('The linked item is unavailable. The saved link has not been changed.')
  return item
}

export async function saveProductItemLink(productId: string, itemId: string | null) {
  await updateProduct(productId, { plm_item_id: itemId })
  const saved = await readProductItemLink(productId)
  if ((saved?.item_id ?? null) !== itemId) throw new Error('The item link changed. Reload before trying again.')
  return saved
}

export function itemLabel(item: CanonicalItem) {
  return `${item.item_number ?? 'No item number'} · ${item.company_code ?? 'Unknown company'} / ${item.division_code ?? 'Unknown division'}`
}
