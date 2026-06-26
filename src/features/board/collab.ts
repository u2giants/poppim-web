import { api, appSchema, core, metadata, pim, boolFromStatus, unwrap } from '@/lib/supabaseQuery'
import type { Database, Json } from '@/lib/database.types'
import type {
  AppUser,
  Buyer,
  ChecklistItem,
  Comment,
  Licensor,
  ProductActivity,
  ProductAssignee,
  ProductField,
  ProductFile,
  ProductUpdate,
  ProductTag,
  ProductLink,
  ProductTimeEntry,
  ProductType,
  Retailer,
  Subtask,
} from '@/lib/types'

function profile(row: any): AppUser {
  const name = row.display_name ?? ''
  const parts = name.trim().split(/\s+/).filter(Boolean)
  return {
    id: row.id,
    first_name: row.first_name ?? parts[0] ?? null,
    last_name: row.last_name ?? (parts.length > 1 ? parts.slice(1).join(' ') : null),
    email: row.email ?? null,
    avatar: row.avatar_url ?? null,
    role: null,
  }
}

function checklistRow(row: any): ChecklistItem {
  return {
    id: row.id,
    product: row.product_id,
    label: row.title,
    done: boolFromStatus(row.status),
    sort: row.sort_order,
    group_name: row.metadata?.group_name ?? null,
    source_id: row.external_id,
    source_system: row.external_source,
  }
}

export async function listChecklist(productId: string) {
  const { data, error } = await pim()
    .from('checklist_item')
    .select('*')
    .eq('product_id', productId)
    .order('sort_order')
    .order('id')
  return unwrap<any[]>({ data, error }).map(checklistRow)
}

export async function addChecklist(productId: string, label: string) {
  const { data, error } = await pim()
    .from('checklist_item')
    .insert({ product_id: productId, title: label, status: 'open' })
    .select('*')
    .single()
  return checklistRow(unwrap<any>({ data, error }))
}

export async function setChecklistDone(id: string, done: boolean) {
  const { data, error } = await pim().from('checklist_item').update({ status: done ? 'done' : 'open' }).eq('id', id).select('*').single()
  return checklistRow(unwrap<any>({ data, error }))
}

export async function removeChecklist(id: string) {
  const { error } = await pim().from('checklist_item').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

// Subtasks are represented as checklist rows with metadata.kind = "subtask".
export async function listSubtasks(productId: string): Promise<Subtask[]> {
  const rows = await listChecklist(productId)
  return rows
    .filter((row) => row.group_name === 'subtask')
    .map((row) => ({ id: row.id, product: row.product, title: row.label, done: row.done, assignee: null, due_date: null, sort: row.sort }))
}

export async function addSubtask(productId: string, title: string): Promise<Subtask> {
  const { data, error } = await pim()
    .from('checklist_item')
    .insert({ product_id: productId, title, status: 'open', metadata: { group_name: 'subtask', kind: 'subtask' } })
    .select('*')
    .single()
  const row = checklistRow(unwrap<any>({ data, error }))
  return { id: row.id, product: row.product, title: row.label, done: row.done, assignee: null, due_date: null, sort: row.sort }
}

export async function setSubtaskDone(id: string, done: boolean) {
  return setChecklistDone(id, done)
}

export async function listAssignees(productId: string): Promise<ProductAssignee[]> {
  const { data, error } = await pim()
    .from('product_assignee')
    .select('id,product_id,profile:profile_id(id,display_name,email,avatar_url)')
    .eq('product_id', productId)
  return unwrap<any[]>({ data, error }).map((row) => ({ id: row.id, product: row.product_id, profile: row.profile ? profile(row.profile) : row.profile_id }))
}

export async function addAssignee(productId: string, userId: string): Promise<ProductAssignee> {
  const { data, error } = await pim()
    .from('product_assignee')
    .insert({ product_id: productId, profile_id: userId })
    .select('id,product_id,profile:profile_id(id,display_name,email,avatar_url)')
    .single()
  const row = unwrap<any>({ data, error })
  return { id: row.id, product: row.product_id, profile: row.profile ? profile(row.profile) : userId }
}

export async function removeAssignee(rowId: string) {
  const { error } = await pim().from('product_assignee').delete().eq('id', rowId)
  if (error) throw new Error(error.message)
}

export async function listUsers(): Promise<AppUser[]> {
  const { data, error } = await (appSchema() as any).from('profile').select('id,display_name,email,avatar_url').order('display_name')
  return unwrap<any[]>({ data, error }).map(profile)
}

export async function listComments(productId: string): Promise<Comment[]> {
  const { data, error } = await (appSchema() as any)
    .from('comment')
    .select('id,body,created_at,profile:created_by_profile_id(id,display_name,email,avatar_url)')
    .eq('target_schema', 'pim')
    .eq('target_table', 'product')
    .eq('target_id', productId)
    .order('created_at')
  return unwrap<any[]>({ data, error }).map((row) => ({
    id: row.id,
    comment: row.body,
    date_created: row.created_at,
    user_created: row.profile ? profile(row.profile) : null,
  }))
}

export async function addComment(productId: string, text: string) {
  const { data, error } = await (appSchema() as any)
    .from('comment')
    .insert({ target_schema: 'pim', target_table: 'product', target_id: productId, body: text })
    .select('*')
    .single()
  return unwrap<any>({ data, error })
}

export async function listProductFiles(productId: string): Promise<ProductFile[]> {
  const { data, error } = await pim().from('product_file').select('*').eq('product_id', productId).order('created_at')
  return unwrap<any[]>({ data, error }).map((row) => ({
    id: row.id,
    product: row.product_id,
    title: row.title,
    file_type: row.metadata?.file_type ?? null,
    mime_type: row.metadata?.mime_type ?? null,
    size: row.metadata?.size ?? null,
    source_url: row.source_url,
    thumbnail_url: row.thumbnail_url,
    stored_url: row.stored_url,
    uploaded_at: row.created_at,
  }))
}

export async function listProductUpdates(productId: string): Promise<ProductUpdate[]> {
  const { data, error } = await pim().from('product_update').select('*').eq('product_id', productId).order('created_at')
  return unwrap<any[]>({ data, error }).map((row) => ({
    id: row.id,
    product: row.product_id,
    body: row.body,
    author_name: row.metadata?.author_name ?? null,
    author_email: row.metadata?.author_email ?? null,
    happened_at: row.created_at,
    kind: row.metadata?.kind ?? null,
  }))
}

export async function listProductTags(productId: string): Promise<ProductTag[]> {
  const { data, error } = await pim().from('product_tag').select('*').eq('product_id', productId).order('tag')
  return unwrap<any[]>({ data, error }).map((row) => ({ id: row.id, product: row.product_id, name: row.tag, color: null }))
}

export async function listProductFields(productId: string): Promise<ProductField[]> {
  const { data, error } = await pim().from('product_field').select('*').eq('product_id', productId).order('field_name')
  return unwrap<any[]>({ data, error }).map((row) => ({
    id: row.id,
    product: row.product_id,
    name: row.field_name,
    field_type: null,
    value_text: typeof row.value_json === 'string' ? row.value_json : null,
    value_json: row.value_json,
  }))
}

export async function listProductActivity(productId: string): Promise<ProductActivity[]> {
  const { data, error } = await (appSchema() as any)
    .from('activity')
    .select('*')
    .eq('target_schema', 'pim')
    .eq('target_table', 'product')
    .eq('target_id', productId)
    .order('created_at')
  return unwrap<any[]>({ data, error }).map((row) => ({
    id: row.id,
    product: productId,
    action: row.action,
    detail: typeof row.payload?.detail === 'string' ? row.payload.detail : null,
    actor_name: row.payload?.actor_name ?? null,
    happened_at: row.created_at,
  }))
}

export async function listProductLinks(productId: string): Promise<ProductLink[]> {
  const { data, error } = await pim()
    .from('product_link')
    .select('*')
    .or(`from_product_id.eq.${productId},to_product_id.eq.${productId}`)
    .order('link_type')
  return unwrap<any[]>({ data, error }).map((row) => ({
    id: row.id,
    product: row.from_product_id,
    linked_product: row.from_product_id === productId ? row.to_product_id : row.from_product_id,
    linked_external_id: null,
    linked_title: row.metadata?.linked_title ?? null,
    relation_type: row.link_type,
    direction: row.from_product_id === productId ? 'outbound' : 'inbound',
    created_by: null,
    created_at: row.created_at,
  }))
}

export async function listProductTimeEntries(productId: string): Promise<ProductTimeEntry[]> {
  const { data, error } = await pim().from('product_time_entry').select('*').eq('product_id', productId).order('started_at')
  return unwrap<any[]>({ data, error }).map((row) => ({
    id: row.id,
    product: row.product_id,
    user_name: row.metadata?.user_name ?? null,
    user_email: row.metadata?.user_email ?? null,
    started_at: row.started_at,
    ended_at: row.metadata?.ended_at ?? null,
    duration_ms: typeof row.seconds_spent === 'number' ? row.seconds_spent * 1000 : null,
    duration_hours: row.seconds_spent != null ? String(Number(row.seconds_spent) / 3600) : null,
    billable: row.metadata?.billable ?? null,
    description: row.metadata?.description ?? null,
    tags: row.metadata?.tags ?? null,
  }))
}

export async function updateProduct(id: string, patch: Record<string, unknown>) {
  type ProductUpdateKey = keyof Database['pim']['Tables']['product']['Update']
  const direct: Database['pim']['Tables']['product']['Update'] = {}
  const metadataPatch: Record<string, unknown> = {}
  const directKeys = new Set<ProductUpdateKey>([
    'name',
    'status',
    'stage',
    'lifecycle_status',
    'cover_url',
    'licensor_id',
    'product_type_id',
    'company_id',
    'buyer_contact_id',
  ])
  const aliases: Record<string, ProductUpdateKey> = {
    licensor: 'licensor_id',
    product_type: 'product_type_id',
    retailer: 'company_id',
    buyer: 'buyer_contact_id',
    lifecycle_state: 'lifecycle_status',
  }

  for (const [key, value] of Object.entries(patch)) {
    const column = aliases[key] ?? key
    if (directKeys.has(column as ProductUpdateKey)) direct[column as ProductUpdateKey] = value as never
    else metadataPatch[key] = value
  }

  if (Object.keys(metadataPatch).length > 0) {
    const existing = await pim().from('product').select('metadata').eq('id', id).single()
    const row = unwrap<{ metadata?: Json }>({ data: existing.data, error: existing.error })
    direct.metadata = { ...metadata(row), ...metadataPatch } as Json
  }

  const { data, error } = await pim().from('product').update(direct).eq('id', id).select('*').single()
  return unwrap<any>({ data, error })
}

export async function fetchLicensors(): Promise<Licensor[]> {
  const { data, error } = await (core() as any).from('licensor').select('id,name').order('name')
  return unwrap<Licensor[]>({ data, error })
}

export async function fetchProductTypes(): Promise<ProductType[]> {
  const { data, error } = await (core() as any).from('product_type').select('id,name').order('name')
  return unwrap<ProductType[]>({ data, error })
}

export async function fetchCustomers(): Promise<Retailer[]> {
  const { data, error } = await (api() as any).from('customer_list').select('id,name,customer_status,is_potential').order('name')
  return unwrap<Retailer[]>({ data, error })
}

export async function fetchBuyers(retailerId: string): Promise<Buyer[]> {
  const { data, error } = await (core() as any)
    .from('contact_company')
    .select('contact:contact_id(id,full_name,email)')
    .eq('company_id', retailerId)
  return unwrap<any[]>({ data, error }).map((row) => ({
    id: row.contact?.id,
    name: row.contact?.full_name ?? row.contact?.email ?? null,
    email: row.contact?.email ?? null,
    retailer: retailerId,
  })).filter((row) => row.id)
}

export function userName(u: AppUser | string | null | undefined) {
  if (!u || typeof u === 'string') return 'Unknown'
  return [u.first_name, u.last_name].filter(Boolean).join(' ') || u.email || 'Unknown'
}

export function userInitials(u: AppUser | string | null | undefined) {
  return userName(u).split(' ').filter(Boolean).slice(0, 2).map((s) => s[0]?.toUpperCase()).join('') || '?'
}
