import { readItems, aggregate } from '@directus/sdk'
import { directus } from '@/lib/directus'
import type { Product, Stage } from '@/lib/types'
import { LICENSOR_DISPLAY } from './adapter'
export { fetchStages, setProductStage, stageId } from '../board/api'

const PIPELINE_FIELDS = [
  'id',
  'code',
  'name',
  'on_shelf_date',
  'pi_status',
  'cover_url',
  { stage: ['id', 'name'] },
  { licensor: ['id', 'name'] },
] as const

// Maps display-name licensors (e.g. "Disney") back to the raw names stored in Directus ("disney")
function toRawLicensors(displayNames: string[]): string[] {
  return Object.entries(LICENSOR_DISPLAY)
    .filter(([, display]) => displayNames.includes(display))
    .map(([raw]) => raw)
}

function buildFilter(search?: string, licensors?: string[]): Record<string, unknown> {
  const raw = licensors?.length ? toRawLicensors(licensors) : []
  const and: unknown[] = [{ stage: { _nnull: true } }]
  if (search?.trim()) {
    and.push({ _or: [{ name: { _icontains: search.trim() } }, { code: { _icontains: search.trim() } }] })
  }
  if (raw.length) and.push({ licensor: { name: { _in: raw } } })
  return { _and: and }
}

export interface FetchProductsOpts {
  search?: string
  licensors?: string[]
  limit?: number
}

export async function fetchPipelineProducts(opts: FetchProductsOpts = {}): Promise<Product[]> {
  const { search, licensors, limit = 300 } = opts
  return directus.request(
    readItems('product', {
      fields: PIPELINE_FIELDS,
      filter: buildFilter(search, licensors) as never,
      limit,
    }),
  ) as Promise<Product[]>
}

export async function countPipelineProducts(opts: Omit<FetchProductsOpts, 'limit'> = {}): Promise<number> {
  const result = await directus.request(
    aggregate('product', {
      aggregate: { count: '*' },
      filter: buildFilter(opts.search, opts.licensors) as never,
    }),
  ) as Array<{ count: { '*': string } }>
  return parseInt(result[0]?.count?.['*'] ?? '0', 10)
}

export function stageById(stages: Stage[]): Map<string, Stage> {
  return new Map(stages.map((s) => [s.id, s]))
}
