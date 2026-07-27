import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  api: vi.fn(),
}))

vi.mock('@/lib/supabase', () => ({
  supabase: { schema: vi.fn() },
}))

vi.mock('@/lib/supabaseQuery', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/supabaseQuery')>()
  return { ...actual, api: mocks.api }
})

vi.mock('@/domain/products/enrich', () => ({
  enrichProductRowsWithBoardFields: (rows: unknown[]) => Promise.resolve(rows),
}))

import { fetchPipelineInitial, fetchPipelinePage, fetchPipelineProducts } from './api'

describe('pipeline API characterization', () => {
  beforeEach(() => {
    mocks.api.mockReset()
  })

  it('fetchPipelinePage sends mandatory department and optional filters before pagination', async () => {
    const rpc = vi.fn().mockResolvedValue({ data: [], error: null })
    mocks.api.mockReturnValue({ rpc })

    await fetchPipelineProducts({
      businessUnit: 'Licensed',
      search: 'batman',
      licensorIds: ['licensor-1'],
      listNames: ['Licensing Management'],
      limit: 50,
    })

    expect(rpc).toHaveBeenCalledWith('pm_pipeline_page', expect.objectContaining({
      p_business_unit: 'Licensed',
      p_search: 'batman',
      p_licensor_ids: ['licensor-1'],
      p_list_names: ['Licensing Management'],
      p_limit: 50,
      p_after_updated_at: undefined,
      p_after_id: undefined,
    }))
  })

  it('top-level open/custom eligibility matches legacy department aliases', async () => {
    const rows = [
      { id: 'pop', name: 'POP', metadata: { business_unit: 'POP', clickup_status_type: 'open' } },
      { id: 'spruce', name: 'Spruce', metadata: { business_unit: 'Spruce Line', clickup_status_type: 'custom' } },
      { id: 'closed', name: 'Closed', metadata: { business_unit: 'POP Creations', clickup_status_type: 'closed' } },
      { id: 'child', name: 'Child', clickup_parent_id: 'parent', metadata: { business_unit: 'POP', clickup_status_type: 'open' } },
    ]
    mocks.api.mockReturnValue({
      rpc: vi.fn().mockImplementation((_name: string, args: { p_business_unit: string }) => Promise.resolve({
        data: rows.filter((row) => {
          const unit = String(row.metadata.business_unit).toLowerCase()
          const allowed = args.p_business_unit === 'Licensed' ? ['pop', 'pop creations', 'licensed'] : ['spruce', 'spruce line', 'generic']
          return allowed.includes(unit) && ['open', 'custom'].includes(row.metadata.clickup_status_type) && !row.clickup_parent_id
        }),
        error: null,
      })),
    })

    const licensed = await fetchPipelineProducts({ businessUnit: 'Licensed' })
    const generic = await fetchPipelineProducts({ businessUnit: 'Generic' })

    expect(licensed.map((row) => row.id)).toEqual(['pop'])
    expect(generic.map((row) => row.id)).toEqual(['spruce'])
  })

  it('returns an opaque cursor and sends both keyset fields on the next page', async () => {
    const rpc = vi.fn()
      .mockResolvedValueOnce({ data: [{ id: '11111111-1111-1111-1111-111111111111', name: 'First', updated_at: '2026-07-27T01:00:00Z' }], error: null })
      .mockResolvedValueOnce({ data: [], error: null })
    mocks.api.mockReturnValue({ rpc })

    const first = await fetchPipelinePage({ businessUnit: 'Licensed', limit: 1 })
    expect(first.nextCursor).toEqual(expect.any(String))
    expect(first.nextCursor).not.toContain('2026-07-27')

    await fetchPipelinePage({ businessUnit: 'Licensed', limit: 1 }, first.nextCursor)
    expect(rpc).toHaveBeenLastCalledWith('pm_pipeline_page', expect.objectContaining({
      p_after_updated_at: '2026-07-27T01:00:00Z',
      p_after_id: '11111111-1111-1111-1111-111111111111',
    }))
  })

  it('preserves a successful list page when optional count and facets fail', async () => {
    const rpc = vi.fn().mockImplementation((name: string) => {
      if (name === 'pm_pipeline_page') {
        return Promise.resolve({
          data: [{ id: '11111111-1111-1111-1111-111111111111', name: 'Visible product', updated_at: '2026-07-27T01:00:00Z' }],
          error: null,
        })
      }
      return Promise.resolve({ data: null, error: { message: `${name} unavailable` } })
    })
    mocks.api.mockReturnValue({ rpc })

    const result = await fetchPipelineInitial({ businessUnit: 'Licensed', limit: 50 })

    expect(result.page.products.map((product) => product.id)).toEqual(['11111111-1111-1111-1111-111111111111'])
    expect(result.count).toBeNull()
    expect(result.facets).toBeNull()
  })
})
