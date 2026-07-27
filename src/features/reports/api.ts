import { api, asDynamic } from '@/lib/supabaseQuery'
import type { BusinessUnit } from '@/domain/products/types'
import type { StageHistory } from '@/lib/types'
import { unwrap } from '@/lib/supabaseQuery'

export interface CountBucket {
  key: string
  label: string
  count: number
}

export interface ReportsData {
  asOf: string
  totals: { products: number; projects: number; designs: number; orders: number }
  operational: {
    blocked: number
    urgent: number
    activeProjects: number
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
  handoffsAvailable: boolean
}

interface ReportRpcRow {
  as_of: string
  totals: ReportsData['totals']
  operational: {
    blocked: number
    urgent: number
    active_projects: number
    ownership_gaps: number
    evidence_gaps: number
    overdue_dates: number
    open_revisions: number
    waiting_submissions: number
    active_samples: number
    open_dependencies: number
    open_reminders: number
    recorded_decisions: number
    active_templates: number
  }
  stage_buckets: CountBucket[]
  closure_buckets: CountBucket[]
  risk_buckets: CountBucket[]
  waiting_buckets: CountBucket[]
}

interface HandoffRpcRow {
  id: string
  product_id: string
  product_name: string
  from_stage_id: string | null
  from_stage_name: string | null
  to_stage_id: string | null
  to_stage_name: string | null
  changed_at: string
}

export async function fetchReportsData(businessUnit: BusinessUnit): Promise<ReportsData> {
  const reportResult = await asDynamic(api()).rpc('pm_department_report', { p_business_unit: businessUnit })
  const raw = unwrap<ReportRpcRow>({ data: reportResult.data, error: reportResult.error })

  let recentHandoffs: StageHistory[] = []
  let handoffsAvailable = true
  try {
    const result = await asDynamic(api()).rpc('pm_department_handoffs', {
      p_business_unit: businessUnit,
      p_since: new Date(Date.now() - 30 * 86_400_000).toISOString(),
      p_limit: 30,
    })
    recentHandoffs = unwrap<HandoffRpcRow[]>({ data: result.data, error: result.error }).map((row) => ({
      id: row.id,
      product: { id: row.product_id, name: row.product_name } as StageHistory['product'],
      from_stage: row.from_stage_id ? { id: row.from_stage_id, name: row.from_stage_name ?? 'Unknown' } as StageHistory['from_stage'] : null,
      to_stage: row.to_stage_id ? { id: row.to_stage_id, name: row.to_stage_name ?? 'Unknown' } as StageHistory['to_stage'] : null,
      changed_at: row.changed_at,
    }))
  } catch {
    handoffsAvailable = false
  }

  return {
    asOf: raw.as_of,
    totals: raw.totals,
    operational: {
      blocked: raw.operational.blocked,
      urgent: raw.operational.urgent,
      activeProjects: raw.operational.active_projects,
      ownershipGaps: raw.operational.ownership_gaps,
      evidenceGaps: raw.operational.evidence_gaps,
      overdueDates: raw.operational.overdue_dates,
      openRevisions: raw.operational.open_revisions,
      waitingSubmissions: raw.operational.waiting_submissions,
      activeSamples: raw.operational.active_samples,
      openDependencies: raw.operational.open_dependencies,
      openReminders: raw.operational.open_reminders,
      recordedDecisions: raw.operational.recorded_decisions,
      activeTemplates: raw.operational.active_templates,
    },
    stageBuckets: raw.stage_buckets,
    closureBuckets: raw.closure_buckets,
    riskBuckets: raw.risk_buckets,
    waitingBuckets: raw.waiting_buckets,
    recentHandoffs,
    handoffsAvailable,
  }
}
