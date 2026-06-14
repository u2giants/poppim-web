import { aggregate, readItems } from '@directus/sdk'
import { directus } from '@/lib/directus'
import type { Design, DesignCollection } from '@/lib/types'
import type { BusinessUnit } from '@/domain/products/types'

export const DESIGN_FIELDS = [
  'id',
  'name',
  'business_unit',
  'status',
  'theme',
  'nas_path',
  'thumbnail_url',
  { licensor: ['id', 'name'] },
  { property: ['id', 'name'] },
  { product_type: ['id', 'name'] },
  { season: ['id', 'name', 'year', 'business_unit'] },
  { first_offered_to: ['id', 'name'] },
] as const

export const DESIGN_COLLECTION_FIELDS = [
  'id',
  'name',
  'format',
  'theme',
  'business_unit',
  'version_date',
  { account_specific_for: ['id', 'name'] },
] as const

export interface FetchDesignOpts {
  search?: string
  businessUnit?: BusinessUnit
  limit?: number
}

function businessUnitClause(businessUnit: BusinessUnit | undefined): unknown[] {
  if (!businessUnit || businessUnit === 'Unknown') return []
  if (businessUnit === 'Licensed') return [{ business_unit: { _in: ['POP', 'POP Creations'] } }]
  if (businessUnit === 'Generic') return [{ business_unit: { _in: ['Spruce', 'Spruce Line'] } }]
  return [{ business_unit: { _eq: 'Software' } }]
}

function searchClause(search: string | undefined): unknown[] {
  const q = search?.trim()
  if (!q) return []
  return [{
    _or: [
      { name: { _icontains: q } },
      { theme: { _icontains: q } },
      { nas_path: { _icontains: q } },
    ],
  }]
}

export async function fetchDesigns(opts: FetchDesignOpts = {}): Promise<Design[]> {
  const { limit = 300 } = opts
  return directus.request(
    readItems('design', {
      fields: DESIGN_FIELDS,
      filter: { _and: [...businessUnitClause(opts.businessUnit), ...searchClause(opts.search)] } as never,
      sort: ['status', 'name'],
      limit,
    }),
  ) as Promise<Design[]>
}

export async function fetchDesignCollections(opts: FetchDesignOpts = {}): Promise<DesignCollection[]> {
  const { limit = 300 } = opts
  return directus.request(
    readItems('design_collection', {
      fields: DESIGN_COLLECTION_FIELDS,
      filter: {
        _and: [
          ...businessUnitClause(opts.businessUnit),
          ...(opts.search?.trim()
            ? [{ _or: [{ name: { _icontains: opts.search.trim() } }, { theme: { _icontains: opts.search.trim() } }, { format: { _icontains: opts.search.trim() } }] }]
            : []),
        ],
      } as never,
      sort: ['-version_date', 'name'],
      limit,
    }),
  ) as Promise<DesignCollection[]>
}

export async function fetchProductCountsByDesign(): Promise<Map<string, number>> {
  const rows = await directus.request(
    aggregate('product', {
      aggregate: { count: 'id' },
      groupBy: ['design'] as never,
      filter: { design: { _nnull: true } } as never,
    }),
  ) as unknown as Array<{ design: string | null; count: { id: string } }>

  return new Map(rows.filter((row) => row.design).map((row) => [row.design!, parseInt(row.count.id, 10)]))
}

export async function fetchProjectCountsByDesignCollection(): Promise<Map<string, number>> {
  const rows = await directus.request(
    aggregate('project', {
      aggregate: { count: 'id' },
      groupBy: ['design_collection'] as never,
      filter: { design_collection: { _nnull: true } } as never,
    }),
  ) as unknown as Array<{ design_collection: string | null; count: { id: string } }>

  return new Map(rows.filter((row) => row.design_collection).map((row) => [row.design_collection!, parseInt(row.count.id, 10)]))
}
