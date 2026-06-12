import { readItems, aggregate } from '@directus/sdk'
import { directus } from '@/lib/directus'
import type { Project, Product } from '@/lib/types'

export async function fetchProjects(): Promise<Project[]> {
  return directus.request(
    readItems('project', {
      fields: ['id', 'title', 'status', 'business_unit', 'on_shelf_date', 'brief', 'restrictions',
        { retailer: ['id', 'name'] }],
      sort: ['title'],
      limit: -1,
    }),
  ) as Promise<Project[]>
}

// Returns a map of projectId → product count (single query via groupBy).
export async function fetchProjectProductCounts(): Promise<Map<string, number>> {
  const rows = (await directus.request(
    aggregate('product', {
      aggregate: { count: 'id' },
      groupBy: ['project'] as never,
      filter: { project: { _nnull: true } } as never,
    }),
  )) as unknown as Array<{ project: string; count: { id: string } }>
  return new Map(rows.map((r) => [r.project, parseInt(r.count.id, 10)]))
}

// Fetches the products belonging to a single project.
export async function fetchProjectProducts(projectId: string): Promise<Product[]> {
  return directus.request(
    readItems('product', {
      fields: ['id', 'code', 'name', 'on_shelf_date', 'pi_status', 'cover_url',
        { stage: ['id', 'name'] }, { licensor: ['id', 'name'] }],
      filter: { project: { _eq: projectId } } as never,
      limit: 200,
      sort: ['name'],
    }),
  ) as Promise<Product[]>
}
