import { readItems } from '@directus/sdk'
import { directus } from '@/lib/directus'
import type { PmReminder, Product, RevisionRequest } from '@/lib/types'
import { PRODUCT_SUMMARY_FIELDS } from '@/features/pipeline/api'
import { fetchAssignedRevisions, fetchLifecycleOwnedProducts } from '@/features/workflow/api'

export async function fetchAssignedProductIds(userId: string): Promise<string[]> {
  const rows = await directus.request(
    readItems('product_assignee', {
      fields: ['product'],
      filter: { directus_user: { _eq: userId } },
      limit: -1,
    }),
  ) as Array<{ product: string | { id: string } | null }>

  return rows
    .map((row) => {
      if (!row.product) return null
      return typeof row.product === 'string' ? row.product : row.product.id
    })
    .filter((id): id is string => Boolean(id))
}

export async function fetchAssignedProducts(userId: string): Promise<Product[]> {
  const ids = await fetchAssignedProductIds(userId)
  if (ids.length === 0) return []

  return directus.request(
    readItems('product', {
      fields: PRODUCT_SUMMARY_FIELDS as never,
      filter: { id: { _in: ids } },
      limit: -1,
    }),
  ) as Promise<Product[]>
}

export async function fetchMyWorkProducts(userId: string, roleId: string | null): Promise<Product[]> {
  const [assigned, lifecycleOwned] = await Promise.all([
    fetchAssignedProducts(userId),
    fetchLifecycleOwnedProducts(userId, roleId),
  ])
  const map = new Map<string, Product>()
  for (const product of [...assigned, ...lifecycleOwned]) map.set(product.id, product)
  return [...map.values()]
}

export async function fetchMyRevisionWork(userId: string): Promise<RevisionRequest[]> {
  return fetchAssignedRevisions(userId)
}

export async function fetchMyReminders(userId: string): Promise<PmReminder[]> {
  return directus.request(
    readItems('pm_reminder', {
      fields: [
        'id',
        'title',
        'due_at',
        'status',
        'reminder_type',
        'notes',
        { product: PRODUCT_SUMMARY_FIELDS },
      ] as never,
      filter: {
        assigned_to: { _eq: userId },
        status: { _in: ['open', 'snoozed'] },
      },
      sort: ['due_at', 'title'],
      limit: -1,
    }),
  ) as unknown as Promise<PmReminder[]>
}
