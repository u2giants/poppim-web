import { appSchema, pim, unwrap } from '@/lib/supabaseQuery'
import type { PmReminder, Product, RevisionRequest } from '@/lib/types'
import { supabaseProductToProduct } from '@/domain/products/supabaseAdapter'
import { fetchAssignedRevisions, fetchLifecycleOwnedProducts } from '@/features/workflow/api'

export async function fetchAssignedProductIds(userId: string): Promise<string[]> {
  const { data, error } = await (pim() as any).from('product_assignee').select('product_id').eq('profile_id', userId)
  return unwrap<Array<{ product_id: string | null }>>({ data, error }).map((row) => row.product_id).filter((id): id is string => Boolean(id))
}

export async function fetchAssignedProducts(userId: string): Promise<Product[]> {
  const ids = await fetchAssignedProductIds(userId)
  if (ids.length === 0) return []
  const { data, error } = await (pim() as any).from('product').select('*').in('id', ids)
  return unwrap<any[]>({ data, error }).map((row) => supabaseProductToProduct(row))
}

export async function fetchMyWorkProducts(userId: string, roleId: string | null): Promise<Product[]> {
  const [assigned, lifecycleOwned] = await Promise.all([fetchAssignedProducts(userId), fetchLifecycleOwnedProducts(userId, roleId)])
  const map = new Map<string, Product>()
  for (const product of [...assigned, ...lifecycleOwned]) map.set(product.id, product)
  return [...map.values()]
}

export async function fetchMyRevisionWork(userId: string): Promise<RevisionRequest[]> {
  return fetchAssignedRevisions(userId)
}

export async function fetchMyReminders(userId: string): Promise<PmReminder[]> {
  const { data, error } = await (appSchema() as any).from('notification').select('*').eq('profile_id', userId).is('read_at', null).order('created_at')
  return unwrap<any[]>({ data, error }).map((row) => ({ id: row.id, product: row.target_id, project: null, object_collection: row.target_table, object_id: row.target_id, title: row.title, due_at: row.payload?.due_at ?? null, assigned_to: row.profile_id, status: row.payload?.status ?? 'open', reminder_type: row.payload?.reminder_type ?? null, snoozed_until: row.payload?.snoozed_until ?? null, completed_at: row.read_at, notes: row.body }))
}
