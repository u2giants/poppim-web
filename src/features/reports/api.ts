import { aggregate, readItems } from '@directus/sdk'
import { directus } from '@/lib/directus'
import type { StageHistory } from '@/lib/types'
import type { BusinessUnit } from '@/domain/products/types'

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
  stageBuckets: CountBucket[]
  closureBuckets: CountBucket[]
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

  const [
    products,
    projects,
    designs,
    orders,
    stageRows,
    closureRows,
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
    stageBuckets: stageRows
      .map((row) => ({ key: stageName(row.stage), label: stageName(row.stage), count: countValue(row) }))
      .sort((a, b) => b.count - a.count),
    closureBuckets: closureRows
      .map((row) => ({ key: row.closure_reason ?? 'unknown', label: row.closure_reason ?? 'Unknown', count: countValue(row) }))
      .sort((a, b) => b.count - a.count),
    recentHandoffs,
  }
}
