import { productToSummary } from '@/domain/products/adapters'
import { supabaseProductToProduct } from '@/domain/products/supabaseAdapter'
import type { BusinessUnit, ProductSummary } from '@/domain/products/types'
import { pim, unwrap } from '@/lib/supabaseQuery'
import type { Project } from '@/lib/types'
import { fetchStages } from '@/domain/reference/api'

export interface StageCount { id: string; name: string; count: number }
export interface UnitCount { unit: string; count: number }
export interface ControlRoomData {
  totalProducts: number
  activeProjects: number
  businessUnits: UnitCount[]
  stageCounts: StageCount[]
  urgentProducts: ProductSummary[]
  upcomingProducts: ProductSummary[]
  blockedProducts: ProductSummary[]
  ownershipGapProducts: ProductSummary[]
  evidenceGapProducts: ProductSummary[]
  activeProjectRows: Project[]
}

function unit(row: any) { return row.metadata?.business_unit ?? row.metadata?.department ?? 'Unknown' }
function includeUnit(row: any, businessUnit: BusinessUnit) {
  if (businessUnit === 'Unknown') return true
  const value = String(unit(row)).toLowerCase()
  if (businessUnit === 'Licensed') return ['licensed', 'pop', 'pop creations'].includes(value)
  if (businessUnit === 'Generic') return ['generic', 'spruce', 'spruce line'].includes(value)
  return value === 'software'
}

export async function fetchControlRoomData(businessUnit: BusinessUnit): Promise<ControlRoomData> {
  const [productResult, projectResult, stages] = await Promise.all([
    (pim() as any).from('product').select('*').limit(5000),
    (pim() as any).from('project').select('*').limit(500),
    fetchStages(),
  ])
  const products = unwrap<any[]>({ data: productResult.data, error: productResult.error }).filter((row) => includeUnit(row, businessUnit))
  const projects = unwrap<any[]>({ data: projectResult.data, error: projectResult.error }).filter((row) => includeUnit(row, businessUnit))
  const summaries = products.map((row) => productToSummary(supabaseProductToProduct(row)))
  const stageCounts = new Map<string, number>()
  const unitCounts = new Map<string, number>()
  for (const row of products) {
    stageCounts.set(row.stage ?? 'No stage', (stageCounts.get(row.stage ?? 'No stage') ?? 0) + 1)
    unitCounts.set(unit(row), (unitCounts.get(unit(row)) ?? 0) + 1)
  }
  const stageNameById = new Map(stages.map((stage) => [stage.id, stage.name]))
  return {
    totalProducts: products.length,
    activeProjects: projects.filter((project) => (project.status ?? '').toLowerCase() === 'active').length,
    businessUnits: [...unitCounts].map(([unit, count]) => ({ unit, count })),
    stageCounts: [...stageCounts].map(([id, count]) => ({ id, name: stageNameById.get(id) ?? id, count })).sort((a, b) => b.count - a.count),
    urgentProducts: summaries.filter((p) => p.priority === 'urgent' || p.priority === 'high').slice(0, 80),
    upcomingProducts: summaries.filter((p) => p.due).slice(0, 80),
    blockedProducts: summaries.filter((p) => p.blockerReason || p.waitingOn || p.lifecycleState === 'blocked' || p.lifecycleState === 'waiting').slice(0, 80),
    ownershipGapProducts: summaries.filter((p) => p.nextAction && !p.nextOwnerName && !p.nextOwnerRoleName && !p.waitingOn).slice(0, 80),
    evidenceGapProducts: summaries.filter((p) => p.evidenceGaps.length > 0).slice(0, 80),
    activeProjectRows: projects.slice(0, 40).map((row) => ({ id: row.id, title: row.title, status: row.status, business_unit: unit(row), retailer: row.company_id, buyer: row.primary_contact_id, on_shelf_date: row.metadata?.on_shelf_date ?? null, brief: row.metadata?.brief ?? null, restrictions: row.metadata?.restrictions ?? null })),
  }
}
