import { beforeEach, describe, expect, it, vi } from 'vitest'
import { schemaDouble, type QueryCall } from '@/test/supabaseDouble'

const mocks = vi.hoisted(() => ({ api: vi.fn(), pim: vi.fn() }))

vi.mock('@/lib/supabase', () => ({ supabase: { schema: vi.fn() } }))
vi.mock('@/lib/supabaseQuery', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/supabaseQuery')>()
  return { ...actual, api: mocks.api, pim: mocks.pim }
})

import { fetchAccountPage, fetchAccountRows } from './accounts/api'
import { fetchNotes } from './notes/api'
import { fetchPeopleWorkload } from './people/api'
import { fetchProjects } from './projects/api'
import { fetchScheduleItems } from './schedule/api'
import { fetchRevisions } from './workflow/api'
import { fetchMyWorkPage } from './mywork/api'
import { fetchDesignPage } from './designs/api'
import { fetchOrderPage } from './orders/api'
import { fetchRevisionsPage } from './workflow/api'

describe('secondary screen accuracy contracts', () => {
  beforeEach(() => {
    mocks.api.mockReset()
    mocks.pim.mockReset()
  })

  it('passes department search and explicit window before the schedule limit', async () => {
    const rpc = vi.fn().mockResolvedValue({ data: [], error: null })
    mocks.api.mockReturnValue({ rpc })
    await fetchScheduleItems({ businessUnit: 'Generic', search: 'launch', start: '2026-01-01', end: '2026-07-01' })
    expect(rpc).toHaveBeenCalledWith('pm_schedule_page', expect.objectContaining({
      p_business_unit: 'Generic', p_search: 'launch', p_start: '2026-01-01', p_end: '2026-07-01', p_limit: 100,
    }))
  })

  it.each([
    ['notes', () => fetchNotes('needle', 'Software'), 'pm_notes_page'],
    ['people', () => fetchPeopleWorkload('needle', 'Software'), 'pm_people_workload_page'],
    ['accounts', () => fetchAccountRows('needle', 'Software'), 'pm_account_page'],
    ['projects', () => fetchProjects('Software', 'needle'), 'pm_project_page'],
  ])('%s sends search and mandatory department to its bounded RPC', async (_name, invoke, functionName) => {
    const rpc = vi.fn().mockResolvedValue({ data: [], error: null })
    mocks.api.mockReturnValue({ rpc })
    await invoke()
    expect(rpc).toHaveBeenCalledWith(functionName, expect.objectContaining({
      p_business_unit: 'Software', p_search: 'needle',
    }))
  })

  it('applies workflow search and department before the deterministic limit', async () => {
    const calls: Record<string, QueryCall[]> = {}
    mocks.pim.mockReturnValue(schemaDouble({ revision_request: { data: [], error: null } }, calls))
    await fetchRevisions({ businessUnit: 'Licensed', search: 'late', limit: 25 })
    const methods = calls.revision_request.map((call) => call.method)
    expect(methods.indexOf('or')).toBeLessThan(methods.indexOf('limit'))
    expect(calls.revision_request.filter((call) => call.method === 'or')).toHaveLength(2)
    expect(calls.revision_request.some((call) => call.method === 'or' && (call.args[1] as { referencedTable?: string })?.referencedTable === 'product')).toBe(true)
    expect(calls.revision_request.filter((call) => call.method === 'order')).toHaveLength(2)
  })

  it('account continuation makes a former-cap row discoverable with a stable name/id cursor', async () => {
    const first = Array.from({ length: 51 }, (_, index) => ({
      id: `00000000-0000-0000-0000-${String(index).padStart(12, '0')}`,
      name: `Account ${String(index).padStart(2, '0')}`,
      core_status: 'active', project_count: 0, order_count: 0, buyers: [],
    }))
    const rpc = vi.fn()
      .mockResolvedValueOnce({ data: first, error: null })
      .mockResolvedValueOnce({ data: [{ ...first[50], name: 'Beyond former cap' }], error: null })
    mocks.api.mockReturnValue({ rpc })

    const page1 = await fetchAccountPage(undefined, 'Licensed')
    const page2 = await fetchAccountPage(undefined, 'Licensed', page1.nextCursor)

    expect(page1.rows).toHaveLength(50)
    expect(page2.rows[0].retailer.name).toBe('Beyond former cap')
    expect(rpc).toHaveBeenLastCalledWith('pm_account_page', expect.objectContaining({
      p_after_name: 'Account 49',
      p_after_id: first[49].id,
    }))
  })

  it('My Work sends department but never a caller-selected profile id', async () => {
    const rpc=vi.fn().mockResolvedValue({data:[],error:null})
    mocks.api.mockReturnValue({rpc})
    await fetchMyWorkPage('profile-that-must-not-be-sent','role-1','Generic')
    expect(rpc).toHaveBeenCalledWith('pm_my_work_page',{
      p_business_unit:'Generic',p_role_id:'role-1',p_after_updated_at:null,p_after_id:null,p_limit:101,
    })
  })

  it('design and order pages use limit+1 and preserve the updated_at/id tie cursor', async () => {
    const rows=Array.from({length:101},(_,index)=>({
      id:`00000000-0000-0000-0000-${String(index).padStart(12,'0')}`,
      title:`Design ${index}`,status:'active',nas_path:null,thumbnail_url:null,metadata:{},updated_at:'2026-07-27T12:00:00Z',product_count:0,
    }))
    const rpc=vi.fn().mockResolvedValueOnce({data:rows,error:null}).mockResolvedValueOnce({data:[],error:null})
    mocks.api.mockReturnValue({rpc})
    const first=await fetchDesignPage({businessUnit:'Licensed'})
    await fetchDesignPage({businessUnit:'Licensed',cursor:first.nextCursor})
    expect(first.designs).toHaveLength(100)
    expect(rpc).toHaveBeenLastCalledWith('pm_design_page',expect.objectContaining({
      p_after_updated_at:'2026-07-27T12:00:00Z',p_after_id:rows[99].id,p_limit:101,
    }))

    rpc.mockResolvedValueOnce({data:[],error:null})
    await fetchOrderPage({businessUnit:'Licensed'})
    expect(rpc).toHaveBeenLastCalledWith('pm_order_page',expect.objectContaining({p_business_unit:'Licensed',p_limit:101}))
  })

  it('workflow page continuation applies a stable updated_at/id keyset after search', async () => {
    const calls:Record<string,QueryCall[]>={}
    const rows=Array.from({length:3},(_,index)=>({id:`id-${index}`,product_id:'p',status:'open',body:'needle',requested_at:'2026-07-27',updated_at:'2026-07-27T12:00:00Z',metadata:{}}))
    mocks.pim.mockReturnValue(schemaDouble({revision_request:[{data:rows,error:null},{data:[],error:null}]},calls))
    const first=await fetchRevisionsPage({businessUnit:'Licensed',search:'needle',limit:2})
    await fetchRevisionsPage({businessUnit:'Licensed',search:'needle',limit:2,cursor:first.nextCursor})
    expect(first.rows).toHaveLength(2)
    expect(first.nextCursor).not.toBeNull()
    expect(calls.revision_request.some((call)=>call.method==='or'&&String(call.args[0]).includes(`id.lt.${rows[1].id}`))).toBe(true)
  })
})
