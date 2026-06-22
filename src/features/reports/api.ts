import { aggregate, readItems } from '@directus/sdk'
import { directus } from '@/lib/directus'
import type { StageHistory } from '@/lib/types'
import { productToSummary } from '@/domain/products/adapters'
import type { BusinessUnit } from '@/domain/products/types'
import { PRODUCT_SUMMARY_FIELDS } from '@/features/pipeline/api'

export interface CountBucket {
  key: string
  label: string
  count: number
}

export interface ReportsData {
  totals: {
    products: number
    projects: number
    designs: number
    orders: number
  }
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

function countValue(row: { count?: { id?: string; '*'?: string } } | undefined): number {
  return parseInt(row?.count?.id ?? row?.count?.['*'] ?? '0', 10)
}

function businessUnitClause(businessUnit: BusinessUnit): unknown[] {
  if (businessUnit === 'Unknown') return []
  if (businessUnit === 'Licensed') return [{ business_unit: { _in: ['POP', 'POP Creations'] } }]
  if (businessUnit === 'Generic') return [{ business_unit: { _in: ['Spruce', 'Spruce Line'] } }]
  return [{ business_unit: { _eq: 'Software' } }]
}

function stageName(value: unknown): string {
  if (!value) return 'No stage'
  if (typeof value === 'string') return value
  if (typeof value === 'object' && 'name' in value && typeof value.name === 'string') return value.name
  return 'No stage'
}

export async function fetchReportsData(businessUnit: BusinessUnit): Promise<ReportsData> {
  const productFilter = { _and: businessUnitClause(businessUnit) }
  const projectFilter = { _and: businessUnitClause(businessUnit) }
  const today = new Date().toISOString().slice(0, 10)

  const [
    products,
    projects,
    designs,
    orders,
    stageRows,
    closureRows,
    riskRows,
    waitingRows,
    blockedRows,
    ownershipGapRows,
    overdueRows,
    revisionRows,
    submissionRows,
    sampleRows,
    dependencyRows,
    reminderRows,
    decisionRows,
    templateRows,
    evidenceRows,
    recentHandoffs,
  ] = await Promise.all([
    directus.request(
      aggregate('product', {
        aggregate: { count: '*' },
        filter: productFilter as never,
      }),
    ) as Promise<Array<{ count: { '*': string } }>>,
    directus.request(
      aggregate('project', {
        aggregate: { count: '*' },
        filter: projectFilter as never,
      }),
    ) as Promise<Array<{ count: { '*': string } }>>,
    directus.request(
      aggregate('design', {
        aggregate: { count: '*' },
        filter: productFilter as never,
      }),
    ) as Promise<Array<{ count: { '*': string } }>>,
    directus.request(
      aggregate('order', {
        aggregate: { count: '*' },
      }),
    ) as Promise<Array<{ count: { '*': string } }>>,
    directus.request(
      aggregate('product', {
        aggregate: { count: 'id' },
        groupBy: ['stage'] as never,
        filter: productFilter as never,
      }),
    ) as unknown as Promise<Array<{ stage: string | { id: string; name?: string | null } | null; count: { id: string } }>>,
    directus.request(
      aggregate('product', {
        aggregate: { count: 'id' },
        groupBy: ['closure_reason'] as never,
        filter: { _and: [...businessUnitClause(businessUnit), { closure_reason: { _nnull: true } }] } as never,
      }),
    ) as unknown as Promise<Array<{ closure_reason: string | null; count: { id: string } }>>,
    directus.request(
      aggregate('product', {
        aggregate: { count: 'id' },
        groupBy: ['risk_level'] as never,
        filter: { _and: [...businessUnitClause(businessUnit), { risk_level: { _nnull: true } }] } as never,
      }),
    ) as unknown as Promise<Array<{ risk_level: string | null; count: { id: string } }>>,
    directus.request(
      aggregate('product', {
        aggregate: { count: 'id' },
        groupBy: ['waiting_on'] as never,
        filter: { _and: [...businessUnitClause(businessUnit), { waiting_on: { _nempty: true } }] } as never,
      }),
    ) as unknown as Promise<Array<{ waiting_on: string | null; count: { id: string } }>>,
    directus.request(
      aggregate('product', {
        aggregate: { count: '*' },
        filter: {
          _and: [
            ...businessUnitClause(businessUnit),
            { _or: [{ blocker_reason: { _nempty: true } }, { waiting_on: { _nempty: true } }, { lifecycle_state: { _in: ['blocked', 'waiting'] } }] },
          ],
        } as never,
      }),
    ) as Promise<Array<{ count: { '*': string } }>>,
    directus.request(
      aggregate('product', {
        aggregate: { count: '*' },
        filter: {
          _and: [
            ...businessUnitClause(businessUnit),
            { next_action: { _nempty: true } },
            { next_owner_user: { _null: true } },
            { next_owner_role: { _null: true } },
            { waiting_on: { _empty: true } },
          ],
        } as never,
      }),
    ) as Promise<Array<{ count: { '*': string } }>>,
    directus.request(
      aggregate('product', {
        aggregate: { count: '*' },
        filter: {
          _and: [
            ...businessUnitClause(businessUnit),
            { _or: [{ pps_requested_date: { _lt: today } }, { on_shelf_date: { _lt: today } }] },
          ],
        } as never,
      }),
    ) as Promise<Array<{ count: { '*': string } }>>,
    directus.request(
      aggregate('revision_request', {
        aggregate: { count: '*' },
        filter: { _and: [{ status: { _nin: ['resolved', 'accepted', 'rejected', 'canceled'] } }, ...businessUnitClause(businessUnit).map((clause) => ({ product: clause }))] } as never,
      }),
    ) as Promise<Array<{ count: { '*': string } }>>,
    directus.request(
      aggregate('product_submission', {
        aggregate: { count: '*' },
        filter: { _and: [...businessUnitClause(businessUnit), { status: { _in: ['ready', 'submitted', 'waiting', 'changes_requested'] } }] } as never,
      }),
    ) as Promise<Array<{ count: { '*': string } }>>,
    directus.request(
      aggregate('product_sample', {
        aggregate: { count: '*' },
        filter: { _and: [{ status: { _nin: ['approved', 'canceled', 'not_required'] } }, ...businessUnitClause(businessUnit).map((clause) => ({ product: clause }))] } as never,
      }),
    ) as Promise<Array<{ count: { '*': string } }>>,
    directus.request(
      aggregate('pm_dependency', {
        aggregate: { count: '*' },
        filter: { _and: [{ status: { _in: ['open', 'waiting'] } }, ...businessUnitClause(businessUnit).map((clause) => ({ product: clause }))] } as never,
      }),
    ) as Promise<Array<{ count: { '*': string } }>>,
    directus.request(
      aggregate('pm_reminder', {
        aggregate: { count: '*' },
        filter: { _and: [{ status: { _in: ['open', 'snoozed'] } }, ...businessUnitClause(businessUnit).map((clause) => ({ product: clause }))] } as never,
      }),
    ) as Promise<Array<{ count: { '*': string } }>>,
    directus.request(
      aggregate('pm_decision', {
        aggregate: { count: '*' },
        filter: { _and: [...businessUnitClause(businessUnit).map((clause) => ({ product: clause }))] } as never,
      }),
    ) as Promise<Array<{ count: { '*': string } }>>,
    directus.request(
      aggregate('pm_workflow_template', {
        aggregate: { count: '*' },
        filter: {
          _and: [
            { active: { _eq: true } },
            businessUnit === 'Licensed'
              ? { business_unit: { _in: ['All', 'POP Creations'] } }
              : businessUnit === 'Generic'
                ? { business_unit: { _in: ['All', 'Spruce Line'] } }
                : { business_unit: { _in: ['All', 'Software'] } },
          ],
        } as never,
      }),
    ) as Promise<Array<{ count: { '*': string } }>>,
    directus.request(
      readItems('product', {
        fields: PRODUCT_SUMMARY_FIELDS as never,
        filter: productFilter as never,
        limit: 500,
      }),
    ) as Promise<unknown[]>,
    directus.request(
      readItems('stage_history', {
        fields: [
          'id',
          'changed_at',
          { from_stage: ['id', 'name'] },
          { to_stage: ['id', 'name'] },
          {
            product: [
              'id',
              'code',
              'name',
              'business_unit',
              { project: ['id', 'title', { retailer: ['id', 'name'] }, { buyer: ['id', 'name'] }] },
              { licensor: ['id', 'name'] },
            ],
          },
        ],
        filter: businessUnit === 'Unknown'
          ? undefined
          : { product: { business_unit: businessUnit === 'Licensed' ? { _in: ['POP', 'POP Creations'] } : businessUnit === 'Generic' ? { _in: ['Spruce', 'Spruce Line'] } : { _eq: 'Software' } } } as never,
        sort: ['-changed_at'],
        limit: 30,
      }),
    ) as Promise<StageHistory[]>,
  ])

  return {
    totals: {
      products: countValue(products[0]),
      projects: countValue(projects[0]),
      designs: countValue(designs[0]),
      orders: countValue(orders[0]),
    },
    operational: {
      blocked: countValue(blockedRows[0]),
      ownershipGaps: countValue(ownershipGapRows[0]),
      evidenceGaps: evidenceRows.map((row) => productToSummary(row as never)).filter((product) => product.evidenceGaps.length > 0).length,
      overdueDates: countValue(overdueRows[0]),
      openRevisions: countValue(revisionRows[0]),
      waitingSubmissions: countValue(submissionRows[0]),
      activeSamples: countValue(sampleRows[0]),
      openDependencies: countValue(dependencyRows[0]),
      openReminders: countValue(reminderRows[0]),
      recordedDecisions: countValue(decisionRows[0]),
      activeTemplates: countValue(templateRows[0]),
    },
    stageBuckets: stageRows
      .map((row) => ({ key: stageName(row.stage), label: stageName(row.stage), count: countValue(row) }))
      .sort((a, b) => b.count - a.count),
    closureBuckets: closureRows
      .map((row) => ({ key: row.closure_reason ?? 'unknown', label: row.closure_reason ?? 'Unknown', count: countValue(row) }))
      .sort((a, b) => b.count - a.count),
    riskBuckets: riskRows
      .map((row) => ({ key: row.risk_level ?? 'unknown', label: row.risk_level ?? 'Unknown', count: countValue(row) }))
      .sort((a, b) => b.count - a.count),
    waitingBuckets: waitingRows
      .map((row) => ({ key: row.waiting_on ?? 'unknown', label: row.waiting_on ?? 'Unknown', count: countValue(row) }))
      .sort((a, b) => b.count - a.count),
    recentHandoffs,
  }
}
