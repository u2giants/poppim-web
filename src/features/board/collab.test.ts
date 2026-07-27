import { describe, expect, it, vi } from 'vitest'
import { schemaDouble, type QueryCall } from '@/test/supabaseDouble'

const mocks = vi.hoisted(() => ({
  pim: vi.fn(),
  api: vi.fn(),
}))

vi.mock('@/lib/supabase', () => ({
  supabase: { schema: vi.fn() },
}))

vi.mock('@/lib/supabaseQuery', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/supabaseQuery')>()
  return { ...actual, pim: mocks.pim, api: mocks.api }
})

import { updateProduct } from './collab'

describe('product mutation characterization', () => {
  it('product-field aliases map to direct typed columns', async () => {
    const calls: QueryCall[] = []
    mocks.pim.mockReturnValue(schemaDouble({
      product: { data: { id: 'product-1' }, error: null },
    }, { product: calls }))

    await updateProduct('product-1', {
      licensor: 'licensor-1',
      product_type: 'type-1',
      retailer: 'company-1',
      buyer: 'buyer-1',
      lifecycle_state: 'active',
    })

    expect(calls.find((call) => call.method === 'update')?.args[0]).toEqual({
      licensor_id: 'licensor-1',
      product_type_id: 'type-1',
      company_id: 'company-1',
      buyer_contact_id: 'buyer-1',
      lifecycle_status: 'active',
    })
    expect(calls.some((call) => call.method === 'select' && call.args[0] === 'metadata')).toBe(false)
  })

  it('metadata updates use an atomic patch contract rather than read-merge-write', async () => {
    const calls: QueryCall[] = []
    mocks.pim.mockReturnValue(schemaDouble({
      product: [
        { data: { metadata: { unrelated: 'preserve' } }, error: null },
        { data: { id: 'product-1', metadata: { unrelated: 'preserve', risk_level: 'high' } }, error: null },
      ],
    }, { product: calls }))
    const rpc = vi.fn().mockResolvedValue({
      data: [{ id: 'product-1', metadata: { unrelated: 'preserve', risk_level: 'high' }, updated_at: '2026-07-27T00:00:00Z' }],
      error: null,
    })
    mocks.api.mockReturnValue({ rpc })

    await updateProduct('product-1', { risk_level: 'high' })

    expect(calls.some((call) => call.method === 'select' && call.args[0] === 'metadata')).toBe(false)
    expect(rpc).toHaveBeenCalledWith('pm_patch_product_metadata', expect.objectContaining({
      p_product_id: 'product-1',
      p_patch: { risk_level: 'high' },
    }))
  })
})
