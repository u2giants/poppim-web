import { aggregate, readItems } from '@directus/sdk'
import { productToSummary } from '@/domain/products/adapters'
import type { BusinessUnit, ProductSummary } from '@/domain/products/types'
import { directus } from '@/lib/directus'
import type { Project, Stage } from '@/lib/types'
import { PRODUCT_SUMMARY_FIELDS } from '@/features/pipeline/api'
import { fetchStages } from '@/domain/reference/api'

export interface StageCount {
  id: string
  name: string
  count: number
}

export interface UnitCount {
  unit: string
  count: number
}

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

function dateOnly(date: Date): string {
  return date.toISOString().slice(0, 10)
}

function addDays(date: Date, days: number): Date {
  const copy = new Date(date)
  copy.setDate(copy.getDate() + days)
  return copy
}

function countOf(row: { count?: { '*'?: string; id?: string } } | undefined): number {
  return parseInt(row?.count?.['*'] ?? row?.count?.id ?? '0', 10)
}

function businessUnitClause(businessUnit: BusinessUnit): unknown[] {
  if (businessUnit === 'Unknown') return []
  if (businessUnit === 'Licensed') return [{ business_unit: { _in: ['POP', 'POP Creations'] } }]
  if (businessUnit === 'Generic') return [{ business_unit: { _in: ['Spruce', 'Spruce Line'] } }]
  return [{ business_unit: { _eq: 'Software' } }]
}

function productBaseFilter(businessUnit: BusinessUnit) {
  return {
    _and: [
      { stage: { _nnull: true } },
      ...businessUnitClause(businessUnit),
    ],
  }
}

function projectBaseFilter(businessUnit: BusinessUnit) {
  return {
    _and: [
      { status: { _eq: 'active' } },
      ...businessUnitClause(businessUnit),
    ],
  }
}

function stageName(stageId: string, stages: Stage[]): string {
  return stages.find((stage) => stage.id === stageId)?.name ?? 'No stage'
}

export async function fetchControlRoomData(businessUnit: BusinessUnit): Promise<ControlRoomData> {
  const today = dateOnly(new Date())
  const horizon = dateOnly(addDays(new Date(), 21))

  const [
    totalRows,
    projectRows,
    businessRows,
    stageRows,
    urgentRows,
    upcomingRows,
    blockedRows,
    ownershipGapRows,
    evidenceRows,
    activeProjectRows,
    stages,
  ] = await Promise.all([
    directus.request(
      aggregate('product', {
        aggregate: { count: '*' },
        filter: productBaseFilter(businessUnit) as never,
      }),
    ) as Promise<Array<{ count: { '*': string } }>>,
    directus.request(
      aggregate('project', {
        aggregate: { count: '*' },
        filter: projectBaseFilter(businessUnit) as never,
      }),
    ) as Promise<Array<{ count: { '*': string } }>>,
    directus.request(
      aggregate('product', {
        aggregate: { count: 'id' },
        groupBy: ['business_unit'] as never,
        filter: productBaseFilter(businessUnit) as never,
      }),
    ) as unknown as Promise<Array<{ business_unit: string | null; count: { id: string } }>>,
    directus.request(
      aggregate('product', {
        aggregate: { count: 'id' },
        groupBy: ['stage'] as never,
        filter: productBaseFilter(businessUnit) as never,
      }),
    ) as unknown as Promise<Array<{ stage: string | null; count: { id: string } }>>,
    directus.request(
      readItems('product', {
        fields: PRODUCT_SUMMARY_FIELDS as never,
        filter: {
          _and: [
            ...productBaseFilter(businessUnit)._and,
            { _or: [{ priority: { _icontains: 'urgent' } }, { priority: { _icontains: 'high' } }] },
          ],
        } as never,
        sort: ['pps_requested_date', 'on_shelf_date', 'name'],
        limit: 80,
      }),
    ) as Promise<unknown[]>,
    directus.request(
      readItems('product', {
        fields: PRODUCT_SUMMARY_FIELDS as never,
        filter: {
          _and: [
            ...productBaseFilter(businessUnit)._and,
            {
              _or: [
                { pps_requested_date: { _between: [today, horizon] } },
                { on_shelf_date: { _between: [today, horizon] } },
              ],
            },
          ],
        } as never,
        sort: ['pps_requested_date', 'on_shelf_date', 'name'],
        limit: 80,
      }),
    ) as Promise<unknown[]>,
    directus.request(
      readItems('product', {
        fields: PRODUCT_SUMMARY_FIELDS as never,
        filter: {
          _and: [
            ...productBaseFilter(businessUnit)._and,
            {
              _or: [
                { blocker_reason: { _nempty: true } },
                { waiting_on: { _nempty: true } },
                { lifecycle_state: { _in: ['blocked', 'waiting'] } },
              ],
            },
          ],
        } as never,
        sort: ['last_meaningful_update_at', 'pps_requested_date', 'name'],
        limit: 80,
      }),
    ) as Promise<unknown[]>,
    directus.request(
      readItems('product', {
        fields: PRODUCT_SUMMARY_FIELDS as never,
        filter: {
          _and: [
            ...productBaseFilter(businessUnit)._and,
            { next_action: { _nempty: true } },
            { next_owner_user: { _null: true } },
            { next_owner_role: { _null: true } },
            { waiting_on: { _empty: true } },
          ],
        } as never,
        sort: ['pps_requested_date', 'on_shelf_date', 'name'],
        limit: 80,
      }),
    ) as Promise<unknown[]>,
    directus.request(
      readItems('product', {
        fields: PRODUCT_SUMMARY_FIELDS as never,
        filter: productBaseFilter(businessUnit) as never,
        sort: ['-risk_level', 'pps_requested_date', 'on_shelf_date', 'name'],
        limit: 300,
      }),
    ) as Promise<unknown[]>,
    directus.request(
      readItems('project', {
        fields: [
          'id',
          'title',
          'status',
          'business_unit',
          'on_shelf_date',
          'pps_requested_date',
          { retailer: ['id', 'name'] },
          { buyer: ['id', 'name', 'samples_required'] },
          { design_collection: ['id', 'name', 'format', 'theme'] },
        ],
        filter: projectBaseFilter(businessUnit) as never,
        sort: ['pps_requested_date', 'on_shelf_date', 'title'],
        limit: 40,
      }),
    ) as Promise<Project[]>,
    fetchStages(),
  ])

  const evidenceGapProducts = evidenceRows
    .map((row) => productToSummary(row as never))
    .filter((product) => product.evidenceGaps.length > 0)
    .slice(0, 80)

  return {
    totalProducts: countOf(totalRows[0]),
    activeProjects: countOf(projectRows[0]),
    businessUnits: businessRows.map((row) => ({ unit: row.business_unit ?? 'Unknown', count: countOf(row) })),
    stageCounts: stageRows
      .map((row) => ({
        id: row.stage ?? 'none',
        name: row.stage ? stageName(row.stage, stages) : 'No stage',
        count: countOf(row),
      }))
      .sort((a, b) => b.count - a.count),
    urgentProducts: urgentRows.map((row) => productToSummary(row as never)),
    upcomingProducts: upcomingRows.map((row) => productToSummary(row as never)),
    blockedProducts: blockedRows.map((row) => productToSummary(row as never)),
    ownershipGapProducts: ownershipGapRows.map((row) => productToSummary(row as never)),
    evidenceGapProducts,
    activeProjectRows,
  }
}
