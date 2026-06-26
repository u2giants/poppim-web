import { productToSummary } from '@/domain/products/adapters'
import { enrichProductRowsWithBoardFields } from '@/domain/products/enrich'
import { supabaseProductToProduct } from '@/domain/products/supabaseAdapter'
import type { BusinessUnit } from '@/domain/products/types'
import type { StageHistory } from '@/lib/types'
import { appSchema, pim, unwrap } from '@/lib/supabaseQuery'

export interface CountBucket {
  key: string
  label: string
  count: number
}

export interface ReportsData {
  totals: { products: number; projects: number; designs: number; orders: number }
  operational: {
    blocked: number
    ownershipGaps: number
    evidenceGaps: number
    overdueDates: number
    openRevisions: number
    waitingSubmissions: number
    activeSamples: number
    openDependencies: number
    openReminders: number
    recordedDecisions: number
    activeTemplates: number
  }
  stageBuckets: CountBucket[]
  closureBuckets: CountBucket[]
  riskBuckets: CountBucket[]
  waitingBuckets: CountBucket[]
  recentHandoffs: StageHistory[]
}

function unit(row: any) { return row.metadata?.business_unit ?? row.metadata?.department ?? 'Unknown' }
function includeUnit(row: any, businessUnit: BusinessUnit) {
  if (businessUnit === 'Unknown') return true
  const value = String(unit(row)).toLowerCase()
  if (businessUnit === 'Licensed') return ['licensed', 'pop', 'pop creations'].includes(value)
  if (businessUnit === 'Generic') return ['generic', 'spruce', 'spruce line'].includes(value)
  return value === 'software'
}
function bucket(rows: any[], value: (row: any) => string | null | undefined): CountBucket[] {
  const counts = new Map<string, number>()
  for (const row of rows) {
    const key = value(row) ?? 'Unknown'
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }
  return [...counts].map(([key, count]) => ({ key, label: key, count })).sort((a, b) => b.count - a.count)
}

export async function fetchReportsData(businessUnit: BusinessUnit): Promise<ReportsData> {
  const [productResult, projectResult, designResult, orderResult, revisionResult, submissionResult, sampleResult, activityResult, notificationResult, templateResult, stageHistoryResult] = await Promise.all([
    pim().from('product').select('*').limit(5000),
    pim().from('project').select('*').limit(5000),
    pim().from('design').select('*').limit(5000),
    pim().from('customer_order').select('*').limit(5000),
    pim().from('revision_request').select('*').limit(5000),
    pim().from('product_submission').select('*').limit(5000),
    pim().from('product_sample').select('*').limit(5000),
    (appSchema() as any).from('activity').select('*').in('action', ['pm_dependency', 'pm_decision']).limit(5000),
    (appSchema() as any).from('notification').select('*').limit(5000),
    pim().from('saved_view').select('*').eq('scope', 'workflow_template').limit(5000),
    pim().from('stage_history').select('*').order('changed_at', { ascending: false }).limit(30),
  ])
  const rawProducts = unwrap<any[]>({ data: productResult.data, error: productResult.error }).filter((row) => includeUnit(row, businessUnit))
  const products = await enrichProductRowsWithBoardFields(rawProducts)
  const projects = unwrap<any[]>({ data: projectResult.data, error: projectResult.error }).filter((row) => includeUnit(row, businessUnit))
  const designs = unwrap<any[]>({ data: designResult.data, error: designResult.error })
  const orders = unwrap<any[]>({ data: orderResult.data, error: orderResult.error })
  const revisions = unwrap<any[]>({ data: revisionResult.data, error: revisionResult.error })
  const submissions = unwrap<any[]>({ data: submissionResult.data, error: submissionResult.error })
  const samples = unwrap<any[]>({ data: sampleResult.data, error: sampleResult.error })
  const activities = unwrap<any[]>({ data: activityResult.data, error: activityResult.error })
  const notifications = unwrap<any[]>({ data: notificationResult.data, error: notificationResult.error })
  const templates = unwrap<any[]>({ data: templateResult.data, error: templateResult.error })
  const summaries = products.map((row) => productToSummary(supabaseProductToProduct(row)))
  const today = new Date().toISOString().slice(0, 10)
  return {
    totals: { products: products.length, projects: projects.length, designs: designs.length, orders: orders.length },
    operational: {
      blocked: summaries.filter((p) => p.blockerReason || p.waitingOn || p.lifecycleState === 'blocked' || p.lifecycleState === 'waiting').length,
      ownershipGaps: summaries.filter((p) => p.nextAction && !p.nextOwnerName && !p.nextOwnerRoleName && !p.waitingOn).length,
      evidenceGaps: summaries.filter((p) => p.evidenceGaps.length > 0).length,
      overdueDates: summaries.filter((p) => (p.ppsRequestedDate && p.ppsRequestedDate < today) || (p.onShelfDate && p.onShelfDate < today)).length,
      openRevisions: revisions.filter((row) => !['resolved', 'accepted', 'rejected', 'canceled'].includes(row.status)).length,
      waitingSubmissions: submissions.filter((row) => ['ready', 'submitted', 'waiting', 'changes_requested'].includes(row.status)).length,
      activeSamples: samples.filter((row) => !['approved', 'canceled', 'not_required'].includes(row.status)).length,
      openDependencies: activities.filter((row) => row.action === 'pm_dependency' && ['open', 'waiting'].includes(row.payload?.status)).length,
      openReminders: notifications.filter((row) => !row.read_at && ['open', 'snoozed'].includes(row.payload?.status ?? 'open')).length,
      recordedDecisions: activities.filter((row) => row.action === 'pm_decision').length,
      activeTemplates: templates.filter((row) => row.config?.active !== false).length,
    },
    stageBuckets: bucket(products, (row) => row.stage ?? 'No stage'),
    closureBuckets: bucket(products, (row) => row.metadata?.closure_reason),
    riskBuckets: bucket(products, (row) => row.metadata?.risk_level),
    waitingBuckets: bucket(products, (row) => row.metadata?.waiting_on),
    recentHandoffs: unwrap<any[]>({ data: stageHistoryResult.data, error: stageHistoryResult.error }).map((row) => ({ id: row.id, product: row.product_id, from_stage: row.from_stage_id, to_stage: row.to_stage_id, changed_at: row.changed_at })),
  }
}
