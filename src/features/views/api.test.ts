import { describe, expect, it, vi } from 'vitest'
import { schemaDouble } from '@/test/supabaseDouble'

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

import { fetchViewPrefs, upsertViewPref } from './api'

describe('saved-view API characterization', () => {
  it('fetchViewPrefs normalizes view scope to bare UUID', async () => {
    mocks.pim.mockReturnValue(schemaDouble({
      view_pref: {
        data: [{
          id: 'pref-1',
          profile_id: 'profile-1',
          scope: 'view:11111111-1111-1111-1111-111111111111',
          config: { sort_order: 2, color: '#123456', hidden: true },
        }],
        error: null,
      },
    }))

    const [preference] = await fetchViewPrefs('profile-1')

    expect(preference.view).toBe('11111111-1111-1111-1111-111111111111')
    expect(preference).toMatchObject({ sort_order: 2, color: '#123456', hidden: true })
  })

  it('upserts a preference atomically for the current profile', async () => {
    const rpc = vi.fn().mockResolvedValue({
      data: [{
        id: 'pref-1',
        profile_id: 'profile-1',
        scope: 'view:11111111-1111-1111-1111-111111111111',
        config: { hidden: true, color: '#123456', sort_order: 7 },
        updated_at: '2026-07-27T00:00:00Z',
      }],
      error: null,
    })
    mocks.api.mockReturnValue({ rpc })

    const merged = await upsertViewPref('ignored-profile-id', '11111111-1111-1111-1111-111111111111', { hidden: true })

    expect(rpc).toHaveBeenCalledWith('pm_upsert_view_pref', {
      p_scope: 'view:11111111-1111-1111-1111-111111111111',
      p_patch: { hidden: true },
    })
    expect(merged).toMatchObject({
      id: 'pref-1',
      user: 'profile-1',
      view: '11111111-1111-1111-1111-111111111111',
      hidden: true,
      color: '#123456',
      sort_order: 7,
    })
  })

  it('propagates atomic preference failures for UI rollback and toast handling', async () => {
    mocks.api.mockReturnValue({
      rpc: vi.fn().mockResolvedValue({ data: null, error: { message: 'preference denied' } }),
    })

    await expect(upsertViewPref(
      'profile-1',
      '11111111-1111-1111-1111-111111111111',
      { color: '#abcdef' },
    )).rejects.toThrow('preference denied')
  })
})
