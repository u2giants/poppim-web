import { readItems } from '@directus/sdk'
import { directus } from '@/lib/directus'
import type { Product, RevisionRequest } from '@/lib/types'
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
      fields: PRODUCT_SUMMARY_FIELDS,
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
