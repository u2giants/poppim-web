import { aggregate, readComments, readItems } from '@directus/sdk'
import { directusUserToPerson } from './adapters'
import type { PersonSummary, ProductSummary } from './types'
import { directus } from '@/lib/directus'
import type { DirectusUser } from '@/lib/types'

const USER_FIELDS = ['id', 'first_name', 'last_name', 'email', 'avatar'] as const

function productId(value: unknown): string | null {
  if (!value) return null
  if (typeof value === 'string') return value
  if (typeof value === 'object' && 'id' in value && typeof value.id === 'string') return value.id
  return null
}

function countValue(row: { count?: { id?: string; '*'?: string } } | undefined): number {
  return parseInt(row?.count?.id ?? row?.count?.['*'] ?? '0', 10)
}

function countMap<T extends Record<string, unknown>>(rows: T[], key: keyof T): Map<string, number> {
  const map = new Map<string, number>()
  for (const row of rows) {
    const id = productId(row[key])
    if (!id) continue
    map.set(id, countValue(row as never))
  }
  return map
}

function increment(map: Map<string, number>, id: string | null) {
  if (!id) return
  map.set(id, (map.get(id) ?? 0) + 1)
}

export async function hydrateProductSummaryRollups(products: ProductSummary[]): Promise<ProductSummary[]> {
  const ids = products.map((product) => product.id)
  if (ids.length === 0) return products

  const [assigneeRows, checklistRows, completedChecklistRows, fileRows, commentRows] = await Promise.all([
    directus.request(
      readItems('product_assignee', {
        fields: ['id', 'product', { directus_user: USER_FIELDS }] as never,
        filter: { product: { _in: ids } },
        limit: -1,
      }),
    ) as unknown as Promise<Array<{ product: string | { id: string } | null; directus_user: DirectusUser | string | null }>>,
    directus.request(
      aggregate('checklist_item', {
        aggregate: { count: 'id' },
        groupBy: ['product'] as never,
        filter: { product: { _in: ids } } as never,
      }),
    ) as unknown as Promise<Array<{ product: string | { id: string } | null; count: { id: string } }>>,
    directus.request(
      aggregate('checklist_item', {
        aggregate: { count: 'id' },
        groupBy: ['product'] as never,
        filter: { _and: [{ product: { _in: ids } }, { done: { _eq: true } }] } as never,
      }),
    ) as unknown as Promise<Array<{ product: string | { id: string } | null; count: { id: string } }>>,
    directus.request(
      aggregate('product_file', {
        aggregate: { count: 'id' },
        groupBy: ['product'] as never,
        filter: { product: { _in: ids } } as never,
      }),
    ) as unknown as Promise<Array<{ product: string | { id: string } | null; count: { id: string } }>>,
    directus.request(
      readComments({
        filter: { collection: { _eq: 'product' }, item: { _in: ids } },
        fields: ['id', 'item'] as never,
        limit: -1,
      }),
    ) as unknown as Promise<Array<{ item: string | null }>>,
  ])

  const assignees = new Map<string, PersonSummary[]>()
  for (const row of assigneeRows) {
    const id = productId(row.product)
    const person = directusUserToPerson(row.directus_user)
    if (!id || !person) continue
    ;(assignees.get(id) ?? assignees.set(id, []).get(id)!).push(person)
  }

  const checklist = countMap(checklistRows, 'product')
  const completedChecklist = countMap(completedChecklistRows, 'product')
  const files = countMap(fileRows, 'product')
  const comments = new Map<string, number>()
  for (const row of commentRows) increment(comments, row.item)

  return products.map((product) => ({
    ...product,
    assignees: assignees.get(product.id) ?? product.assignees,
    checklist: {
      done: completedChecklist.get(product.id) ?? product.checklist.done,
      total: checklist.get(product.id) ?? product.checklist.total,
    },
    comments: comments.get(product.id) ?? product.comments,
    files: files.get(product.id) ?? product.files,
  }))
}
