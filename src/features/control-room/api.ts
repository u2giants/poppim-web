import { productToSummary } from '@/domain/products/adapters'
import type { BusinessUnit, ProductSummary } from '@/domain/products/types'
import type { Project } from '@/lib/types'
import { fetchPipelinePage } from '@/features/pipeline/api'
import { fetchProjects } from '@/features/projects/api'
import { fetchReportsData } from '@/features/reports/api'

export interface StageCount { id: string; name: string; count: number }
export interface UnitCount { unit: string; count: number }
export interface ControlRoomData {
  totalProducts: number
  activeProjects: number
  urgentCount: number
  blockedCount: number
  businessUnits: UnitCount[]
  stageCounts: StageCount[]
  urgentProducts: ProductSummary[]
  upcomingProducts: ProductSummary[]
  blockedProducts: ProductSummary[]
  ownershipGapProducts: ProductSummary[]
  evidenceGapProducts: ProductSummary[]
  activeProjectRows: Project[]
  listsAreSampled: boolean
  asOf: string
}

export async function fetchControlRoomData(businessUnit: BusinessUnit): Promise<ControlRoomData> {
  const [report, pipeline, projectPage] = await Promise.all([
    fetchReportsData(businessUnit),
    fetchPipelinePage({ businessUnit, limit: 200 }),
    fetchProjects(businessUnit),
  ])
  const summaries = pipeline.products.map(productToSummary)
  const today = Date.now()
  const in21Days = today + 21 * 86_400_000
  return {
    totalProducts: report.totals.products,
    activeProjects: report.operational.activeProjects,
    urgentCount: report.operational.urgent,
    blockedCount: report.operational.blocked,
    businessUnits: [{ unit: businessUnit, count: report.totals.products }],
    stageCounts: report.stageBuckets.map((bucket) => ({ id: bucket.key, name: bucket.label, count: bucket.count })),
    urgentProducts: summaries.filter((p) => p.priority === 'urgent' || p.priority === 'high').slice(0, 80),
    upcomingProducts: summaries.filter((p) => {
      const date = p.due ? new Date(p.due).getTime() : Number.NaN
      return Number.isFinite(date) && date >= today && date <= in21Days
    }).slice(0, 80),
    blockedProducts: summaries.filter((p) => p.blockerReason || p.waitingOn || p.lifecycleState === 'blocked' || p.lifecycleState === 'waiting').slice(0, 80),
    ownershipGapProducts: summaries.filter((p) => p.nextAction && !p.nextOwnerName && !p.nextOwnerRoleName && !p.waitingOn).slice(0, 80),
    evidenceGapProducts: summaries.filter((p) => p.evidenceGaps.length > 0).slice(0, 80),
    activeProjectRows: projectPage.projects.filter((project) => project.status?.toLowerCase() === 'active').slice(0, 40),
    listsAreSampled: pipeline.nextCursor !== null || projectPage.projects.length >= 100,
    asOf: report.asOf,
  }
}
