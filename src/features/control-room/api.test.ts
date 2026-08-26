import {describe,expect,it,vi} from 'vitest'

const mocks=vi.hoisted(()=>({report:vi.fn(),pipeline:vi.fn(),projects:vi.fn()}))
vi.mock('@/features/reports/api',()=>({fetchReportsData:mocks.report}))
vi.mock('@/features/pipeline/api',()=>({fetchPipelinePage:mocks.pipeline}))
vi.mock('@/features/projects/api',()=>({fetchProjects:mocks.projects}))
import {fetchControlRoomData} from './api'

describe('Control Room accuracy',()=>{
  it('uses one department for exact totals and bounded list sources',async()=>{
    mocks.report.mockResolvedValue({asOf:'2026-07-27T12:00:00Z',totals:{products:900},operational:{activeProjects:12,urgent:30,blocked:20},stageBuckets:[]})
    mocks.pipeline.mockResolvedValue({products:[],nextCursor:'more'})
    mocks.projects.mockResolvedValue({projects:[],counts:new Map(),nextCursor:null})
    const data=await fetchControlRoomData('Software')
    expect(mocks.report).toHaveBeenCalledWith('Software')
    expect(mocks.pipeline).toHaveBeenCalledWith({businessUnit:'Software',limit:200})
    expect(mocks.projects).toHaveBeenCalledWith('Software')
    expect(data).toMatchObject({totalProducts:900,activeProjects:12,urgentCount:30,blockedCount:20,listsAreSampled:true,asOf:'2026-07-27T12:00:00Z'})
  })

  it('selects upcoming products from real dates, not the humanised due label',async()=>{
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-07-27T12:00:00Z'))
    try {
      mocks.report.mockResolvedValue({asOf:'2026-07-27T12:00:00Z',totals:{products:2},operational:{activeProjects:0,urgent:0,blocked:0},stageBuckets:[]})
      mocks.projects.mockResolvedValue({projects:[],counts:new Map(),nextCursor:null})
      mocks.pipeline.mockResolvedValue({products:[
        {id:'soon',name:'Due in a week',business_unit:'Software',pps_requested_date:'2026-08-03T00:00:00Z'},
        {id:'later',name:'Due in a year',business_unit:'Software',pps_requested_date:'2027-08-03T00:00:00Z'},
      ],nextCursor:null})
      const data=await fetchControlRoomData('Software')
      expect(data.upcomingProducts.map((product)=>product.id)).toEqual(['soon'])
    } finally {
      vi.useRealTimers()
    }
  })
})
