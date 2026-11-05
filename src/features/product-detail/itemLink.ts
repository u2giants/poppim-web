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
  // PostgREST rewrites '*' to '%' before SQL sees it, so '\*' would mean a literal '%'.
  // A '*' in the term becomes the single-character wildcard '_', which still finds 'A*B'.
  if (term) {
    const pattern = `%${term.replace(/[\\%_]/g, '\\$&').replace(/\*/g, '_')}%`
    // Quoted so commas and brackets in a typed description cannot break the OR filter.
    const quoted = `"${pattern.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`
    query = query.or(`item_number.ilike.${quoted},description.ilike.${quoted}`)
  }
  if (after) query = query.gt('item_id', after)
  const rows = unwrap<CanonicalItem[]>(await query)
  const items = rows.slice(0, PAGE_SIZE)
  return { items, next: rows.length > PAGE_SIZE ? items.at(-1)!.item_id : null }
}

/** The saved FK and, when the picker view still returns it, the resolved item. */
export interface ItemLink {
  itemId: string | null
  item: CanonicalItem | null
}

export async function readProductItemLink(productId: string): Promise<ItemLink> {
  const product = unwrap<{ plm_item_id: string | null }>(await pim().from('product')
    .select('plm_item_id').eq('id', productId).single())
  if (!product.plm_item_id) return { itemId: null, item: null }
  const item = unwrap<CanonicalItem | null>(await dynamicApi().from('pim_item_picker')
    .select(FIELDS).eq('item_id', product.plm_item_id).maybeSingle())
  return { itemId: product.plm_item_id, item }
}

export async function saveProductItemLink(productId: string, itemId: string | null): Promise<ItemLink> {
  await updateProduct(productId, { plm_item_id: itemId })
  const saved = await readProductItemLink(productId)
  if (saved.itemId !== itemId) throw new Error('The item link changed. Reload before trying again.')
  return saved
}

export function itemLabel(item: CanonicalItem) {
  return `${item.item_number ?? 'No item number'} · ${item.company_code ?? 'Unknown company'} / ${item.division_code ?? 'Unknown division'}`
}

/** Many product names start with their item number, e.g. "VSE62DCJG01 DC Comics canvas". */
export function itemNumberFromName(name: string | null | undefined) {
  const first = name?.trim().split(/\s+/)[0] ?? ''
  return /^[A-Za-z0-9-]{4,}$/.test(first) && /\d/.test(first) ? first : null
}

/** Suggestions only: a person must confirm one. An item number can belong to several items. */
export async function suggestItemsForName(name: string | null | undefined): Promise<CanonicalItem[]> {
  const itemNumber = itemNumberFromName(name)
  if (!itemNumber) return []
  return unwrap<CanonicalItem[]>(await dynamicApi().from('pim_item_picker').select(FIELDS)
    .eq('item_number', itemNumber).order('item_id', { ascending: true }).limit(PAGE_SIZE))
}

export interface LinkQueueRow {
  id: string
  name: string
  suggestions: CanonicalItem[]
}

const QUEUE_PAGE_SIZE = 50

/** Unlinked products whose name starts with an existing item number. */
export async function fetchLinkQueue(after?: string) {
  let query = pim().from('product').select('id,name')
    .is('plm_item_id', null)
    .filter('name', 'match', '^[A-Za-z0-9-]*[0-9][A-Za-z0-9-]*[[:space:]]')
    .order('id', { ascending: true }).limit(QUEUE_PAGE_SIZE + 1)
  if (after) query = query.gt('id', after)
  const rows = unwrap<{ id: string; name: string }[]>(await query)
  const page = rows.slice(0, QUEUE_PAGE_SIZE)
  const numbers = [...new Set(page.map((row) => itemNumberFromName(row.name)).filter((n): n is string => !!n))]
  const items = numbers.length ? unwrap<CanonicalItem[]>(await dynamicApi().from('pim_item_picker')
    .select(FIELDS).in('item_number', numbers)) : []
  return {
    rows: page.map((row) => ({ ...row, suggestions: items.filter((item) => item.item_number === itemNumberFromName(row.name)) }))
      .filter((row) => row.suggestions.length > 0),
    next: rows.length > QUEUE_PAGE_SIZE ? page.at(-1)!.id : null,
  }
}
