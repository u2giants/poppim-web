import { readItems } from '@directus/sdk'
import { directus } from '@/lib/directus'
import type { Product, Stage } from '@/lib/types'
export { fetchStages, setProductStage, stageId } from '../board/api'

// Fetches products with the fields needed for PipelinePage display.
export async function fetchPipelineProducts(limit = 500): Promise<Product[]> {
  return directus.request(
    readItems('product', {
      fields: [
        'id',
        'code',
        'name',
        'on_shelf_date',
        'pi_status',
        { stage: ['id', 'name'] },
        { licensor: ['id', 'name'] },
      ],
      filter: { stage: { _nnull: true } },
      limit,
    }),
  ) as Promise<Product[]>
}

// Builds a map of stageId → Stage from a fetched stages array.
export function stageById(stages: Stage[]): Map<string, Stage> {
  return new Map(stages.map((s) => [s.id, s]))
}
