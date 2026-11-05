import { beforeEach, describe, expect, it, vi } from 'vitest'
import { schemaDouble, type QueryCall } from '@/test/supabaseDouble'
const mocks = vi.hoisted(() => ({ api: vi.fn(), pim: vi.fn(), update: vi.fn() }))
vi.mock('@/lib/supabase', () => ({ supabase: { schema: vi.fn() } }))
vi.mock('@/lib/supabaseQuery', async (original) => ({
  ...await original<typeof import('@/lib/supabaseQuery')>(), dynamicApi: mocks.api, pim: mocks.pim,
}))
vi.mock('@/features/board/collab', () => ({ updateProduct: mocks.update }))
import { fetchLinkQueue, itemNumberFromName, suggestItemsForName, itemLabel, readProductItemLink, saveProductItemLink, searchCanonicalItems } from './itemLink'
const item = { item_id: 'canonical-uuid', item_number: 'SAME', description: null, company_code: 'C1', division_code: 'D1', source_system: 'coldlion', source_id: 'C1/D1/SAME' }

beforeEach(() => vi.resetAllMocks())
describe('item link suggestions', () => {
  it('reads an item number only from a code-like first word', () => {
    expect(itemNumberFromName('VSE62DCJG01 DC Comics canvas')).toBe('VSE62DCJG01')
    expect(itemNumberFromName('Concept approved 3.30.2023')).toBeNull()
    expect(itemNumberFromName('2023 catalog')).toBe('2023')
    expect(itemNumberFromName(null)).toBeNull()
  })
  it('does not query when the name holds no item number', async () => {
    expect(await suggestItemsForName('Solar Systems')).toEqual([])
    expect(mocks.api).not.toHaveBeenCalled()
  })
  it('queues only products with a real item and offers every item sharing that number', async () => {
    const other = { ...item, item_id: 'other-uuid' }
    mocks.pim.mockReturnValue(schemaDouble({ product: { data: [{ id: 'a', name: 'SAME1 x' }, { id: 'b', name: 'NOPE1 y' }], error: null } }))
    mocks.api.mockReturnValue(schemaDouble({ pim_item_picker: { data: [{ ...item, item_number: 'SAME1' }, { ...other, item_number: 'SAME1' }], error: null } }))
    const queue = await fetchLinkQueue()
    expect(queue.rows.map((row) => [row.id, row.suggestions.length])).toEqual([['a', 2]])
    expect(mocks.update).not.toHaveBeenCalled()
  })
})

describe('canonical item link', () => {
  it('loads the real FK and resolves it by canonical UUID rather than item number', async () => {
    const calls: QueryCall[] = []
    mocks.pim.mockReturnValue(schemaDouble({ product: { data: { plm_item_id: item.item_id }, error: null } }))
    mocks.api.mockReturnValue(schemaDouble({ pim_item_picker: { data: item, error: null } }, { pim_item_picker: calls }))
    expect(await readProductItemLink('product')).toEqual({ itemId: item.item_id, item })
    expect(calls).toContainEqual({ method: 'eq', args: ['item_id', item.item_id] })
  })
  it('saves only the explicit FK and confirms it through a fresh read', async () => {
    mocks.pim.mockReturnValue(schemaDouble({ product: { data: { plm_item_id: item.item_id }, error: null } }))
    mocks.api.mockReturnValue(schemaDouble({ pim_item_picker: { data: item, error: null } }))
    expect(await saveProductItemLink('product', item.item_id)).toEqual({ itemId: item.item_id, item })
    expect(mocks.update).toHaveBeenCalledWith('product', { plm_item_id: item.item_id })
  })
  it('clears to NULL without source-ID mutation or a guessed replacement', async () => {
    mocks.pim.mockReturnValue(schemaDouble({ product: { data: { plm_item_id: null }, error: null } }))
    expect(await saveProductItemLink('product', null)).toEqual({ itemId: null, item: null })
    expect(mocks.update).toHaveBeenCalledWith('product', { plm_item_id: null })
    expect(mocks.api).not.toHaveBeenCalled()
  })
  it('does not claim a permission-denied save succeeded', async () => {
    mocks.update.mockRejectedValue(new Error('permission denied'))
    await expect(saveProductItemLink('product', item.item_id)).rejects.toThrow('permission denied')
    expect(mocks.pim).not.toHaveBeenCalled()
  })
  it('keeps an unresolved saved link visible as linked, not unmatched, and lets it be cleared', async () => {
    mocks.pim.mockReturnValue(schemaDouble({ product: { data: { plm_item_id: item.item_id }, error: null } }))
    mocks.api.mockReturnValue(schemaDouble({ pim_item_picker: { data: null, error: null } }))
    expect(await readProductItemLink('product')).toEqual({ itemId: item.item_id, item: null })
    expect(mocks.update).not.toHaveBeenCalled()
    mocks.pim.mockReturnValue(schemaDouble({ product: { data: { plm_item_id: null }, error: null } }))
    expect(await saveProductItemLink('product', null)).toEqual({ itemId: null, item: null })
    expect(mocks.update).toHaveBeenCalledWith('product', { plm_item_id: null })
  })
  it('uses bounded UUID continuation and literal wildcard search', async () => {
    const calls: QueryCall[] = []
    mocks.api.mockReturnValue(schemaDouble({ pim_item_picker: { data: [], error: null } }, { pim_item_picker: calls }))
    await searchCanonicalItems('100%_*', 'cursor-uuid')
    expect(calls).toContainEqual({ method: 'or', args: ['item_number.ilike."%100\\\\%\\\\__%",description.ilike."%100\\\\%\\\\__%"'] })
    expect(calls).toContainEqual({ method: 'gt', args: ['item_id', 'cursor-uuid'] })
    expect(calls).toContainEqual({ method: 'limit', args: [21] })
    expect(itemLabel(item)).not.toEqual(itemLabel({ ...item, company_code: 'C2', division_code: 'D2' }))
  })
})
