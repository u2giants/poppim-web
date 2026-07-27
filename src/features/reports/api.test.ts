import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({ api: vi.fn() }))

vi.mock('@/lib/supabase', () => ({ supabase: { schema: vi.fn() } }))
vi.mock('@/lib/supabaseQuery', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/supabaseQuery')>()
  return { ...actual, api: mocks.api }
})

import { fetchReportsData } from './api'

const report = {
  as_of: '2026-07-27T00:00:00Z',
  totals: { products: 3, projects: 2, designs: 1, orders: 4 },
  operational: {
    blocked: 1, ownership_gaps: 2, evidence_gaps: 0, overdue_dates: 1,
    open_revisions: 2, waiting_submissions: 3, active_samples: 4,
    open_dependencies: 5, open_reminders: 6, recorded_decisions: 7, active_templates: 8,
  },
  stage_buckets: [], closure_buckets: [], risk_buckets: [], waiting_buckets: [],
}

describe('reports API', () => {
  beforeEach(() => mocks.api.mockReset())

  it('requests exact metrics for the selected department', async () => {
    const rpc = vi.fn()
      .mockResolvedValueOnce({ data: report, error: null })
      .mockResolvedValueOnce({ data: [], error: null })
    mocks.api.mockReturnValue({ rpc })

    const result = await fetchReportsData('Licensed')

    expect(rpc).toHaveBeenNthCalledWith(1, 'pm_department_report', { p_business_unit: 'Licensed' })
    expect(result.totals.products).toBe(3)
    expect(result.operational.openReminders).toBe(6)
  })

  it('keeps exact metrics when the optional recent-handoff query fails', async () => {
    const rpc = vi.fn()
      .mockResolvedValueOnce({ data: report, error: null })
      .mockResolvedValueOnce({ data: null, error: { message: 'timeout' } })
    mocks.api.mockReturnValue({ rpc })

    const result = await fetchReportsData('Generic')

    expect(result.totals.products).toBe(3)
    expect(result.handoffsAvailable).toBe(false)
    expect(result.recentHandoffs).toEqual([])
  })

  it('does not render false empty metrics when the required exact aggregate fails', async () => {
    const rpc = vi.fn().mockResolvedValue({ data: null, error: { message: 'required aggregate failed' } })
    mocks.api.mockReturnValue({ rpc })
    await expect(fetchReportsData('Software')).rejects.toThrow('required aggregate failed')
    expect(rpc).toHaveBeenCalledTimes(1)
  })
})
