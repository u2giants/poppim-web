import { api, asDynamic } from '@/lib/supabaseQuery'
import { dynamicCore } from '@/lib/supabaseQuery'
import { dynamicApp } from '@/lib/supabaseQuery'
import { pim, boolFromStatus, metadata, textMeta, unwrap } from '@/lib/supabaseQuery'
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
import {
  mapPmCustomerListRow,
  PM_CUSTOMER_LIST,
  PM_CUSTOMER_LIST_SELECT,
  type PmCustomerListRow,
} from '@/domain/reference/pmCustomerList'

type ChecklistRow = Database['pim']['Tables']['checklist_item']['Row']
type AssigneeRow = Database['pim']['Tables']['product_assignee']['Row']
type ProductFileRow = Database['pim']['Tables']['product_file']['Row']
type ProductUpdateRow = Database['pim']['Tables']['product_update']['Row']
type ProductTagRow = Database['pim']['Tables']['product_tag']['Row']
type ProductFieldRow = Database['pim']['Tables']['product_field']['Row']
type ProductLinkRow = Database['pim']['Tables']['product_link']['Row']
type ProductTimeEntryRow = Database['pim']['Tables']['product_time_entry']['Row']
interface ProfileRow { id: string; display_name?: string | null; first_name?: string | null; last_name?: string | null; email?: string | null; avatar_url?: string | null }
interface CommentRow { id: string; body: string; created_at: string; profile?: ProfileRow | null }
interface ActivityRow { id: string; action: string; created_at: string; payload?: Record<string, unknown> | null }
interface BuyerRow { id: string; name: string | null; email: string | null; contact?: { id?: string; full_name?: string | null; name?: string | null; email?: string | null } | null }

function profile(row: ProfileRow): AppUser {
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

function checklistRow(row: ChecklistRow): ChecklistItem {
  const rowMetadata = metadata(row)
  return {
    id: row.id,
    product: row.product_id ?? '',
    label: row.title ?? '',
    done: boolFromStatus(row.status),
    sort: row.sort_order,
    group_name: typeof rowMetadata.group_name === 'string' ? rowMetadata.group_name : null,
    source_id: row.external_id ?? '',
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
  return unwrap({ data, error }).map(checklistRow)
}

export async function addChecklist(productId: string, label: string) {
  const { data, error } = await pim()
    .from('checklist_item')
    .insert({ product_id: productId, title: label, status: 'open' })
    .select('*')
    .single()
  return checklistRow(unwrap({ data, error }))
}

export async function setChecklistDone(id: string, done: boolean) {
  const { data, error } = await pim().from('checklist_item').update({ status: done ? 'done' : 'open' }).eq('id', id).select('*').single()
  return checklistRow(unwrap({ data, error }))
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
  const row = checklistRow(unwrap({ data, error }))
  return { id: row.id, product: row.product, title: row.label, done: row.done, assignee: null, due_date: null, sort: row.sort }
}

export async function setSubtaskDone(id: string, done: boolean) {
  return setChecklistDone(id, done)
}

export async function listAssignees(productId: string): Promise<ProductAssignee[]> {
  const { data, error } = await pim()
    .from('product_assignee')
    .select('id,product_id,profile_id')
    .eq('product_id', productId)
  const rows = unwrap<AssigneeRow[]>({ data, error })
  const profileIds = [...new Set(rows.map((row) => row.profile_id).filter(Boolean))]
  const profileResult = profileIds.length > 0
    ? await dynamicApp().from('profile').select('id,display_name,email,avatar_url').in('id', profileIds)
    : { data: [], error: null }
  const profiles = new Map(unwrap<ProfileRow[]>({ data: profileResult.data, error: profileResult.error }).map((row) => [row.id, profile(row)]))
  return rows.map((row) => ({ id: row.id, product: row.product_id, profile: profiles.get(row.profile_id) ?? row.profile_id }))
}

export async function addAssignee(productId: string, userId: string): Promise<ProductAssignee> {
  const { data, error } = await pim()
    .from('product_assignee')
    .insert({ product_id: productId, profile_id: userId })
    .select('id,product_id,profile_id')
    .single()
  const row = unwrap<AssigneeRow>({ data, error })
  const profileResult = await dynamicApp()
    .from('profile')
    .select('id,display_name,email,avatar_url')
    .eq('id', row.profile_id)
    .maybeSingle()
  const user = unwrap<ProfileRow | null>({ data: profileResult.data, error: profileResult.error })
  return { id: row.id, product: row.product_id, profile: user ? profile(user) : userId }
}

export async function removeAssignee(rowId: string) {
  const { error } = await pim().from('product_assignee').delete().eq('id', rowId)
  if (error) throw new Error(error.message)
}

export async function listUsers(): Promise<AppUser[]> {
  const { data, error } = await dynamicApp().from('profile').select('id,display_name,email,avatar_url').order('display_name')
  return unwrap<ProfileRow[]>({ data, error }).map(profile)
}

export async function listComments(productId: string): Promise<Comment[]> {
  const { data, error } = await dynamicApp()
    .from('comment')
    .select('id,body,created_at,profile:created_by_profile_id(id,display_name,email,avatar_url)')
    .eq('target_schema', 'pim')
    .eq('target_table', 'product')
    .eq('target_id', productId)
    .order('created_at')
  return unwrap<CommentRow[]>({ data, error }).map((row) => ({
    id: row.id,
    comment: row.body,
    date_created: row.created_at,
    user_created: row.profile ? profile(row.profile) : null,
  }))
}

export async function addComment(productId: string, text: string) {
  const { data, error } = await dynamicApp()
    .from('comment')
    .insert({ target_schema: 'pim', target_table: 'product', target_id: productId, body: text })
    .select('*')
    .single()
  return unwrap<Record<string, unknown>>({ data, error })
}

export async function listProductFiles(productId: string): Promise<ProductFile[]> {
  const { data, error } = await pim().from('product_file').select('*').eq('product_id', productId).order('created_at')
  return unwrap<ProductFileRow[]>({ data, error }).map((row) => ({
    id: row.id,
    product: row.product_id,
    title: row.title,
    file_type: textMeta(row, 'file_type'),
    mime_type: textMeta(row, 'mime_type'),
    size: typeof metadata(row).size === 'number' ? metadata(row).size as number : null,
    source_url: row.source_url,
    thumbnail_url: row.thumbnail_url,
    stored_url: row.stored_url,
    uploaded_at: row.created_at,
  }))
}

export async function listProductUpdates(productId: string): Promise<ProductUpdate[]> {
  const { data, error } = await pim().from('product_update').select('*').eq('product_id', productId).order('created_at')
  return unwrap<ProductUpdateRow[]>({ data, error }).map((row) => ({
    id: row.id,
    product: row.product_id,
    body: row.body,
    author_name: textMeta(row, 'author_name'),
    author_email: textMeta(row, 'author_email'),
    happened_at: row.created_at,
    kind: textMeta(row, 'kind'),
  }))
}

export async function listProductTags(productId: string): Promise<ProductTag[]> {
  const { data, error } = await pim().from('product_tag').select('*').eq('product_id', productId).order('tag')
  return unwrap<ProductTagRow[]>({ data, error }).map((row) => ({ id: row.id, product: row.product_id, name: row.tag, color: null }))
}

export async function listProductFields(productId: string): Promise<ProductField[]> {
  const { data, error } = await pim().from('product_field').select('*').eq('product_id', productId).order('field_name')
  return unwrap<ProductFieldRow[]>({ data, error }).map((row) => ({
    id: row.id,
    product: row.product_id,
    name: row.field_name,
    field_type: null,
    value_text: typeof row.value_json === 'string' ? row.value_json : null,
    value_json: row.value_json,
  }))
}

export async function listProductActivity(productId: string): Promise<ProductActivity[]> {
  const { data, error } = await dynamicApp()
    .from('activity')
    .select('*')
    .eq('target_schema', 'pim')
    .eq('target_table', 'product')
    .eq('target_id', productId)
    .order('created_at')
  return unwrap<ActivityRow[]>({ data, error }).map((row) => ({
    id: row.id,
    product: productId,
    action: row.action,
    detail: typeof row.payload?.detail === 'string' ? row.payload.detail : null,
    actor_name: typeof row.payload?.actor_name === 'string' ? row.payload.actor_name : null,
    happened_at: row.created_at,
  }))
}

export async function listProductLinks(productId: string): Promise<ProductLink[]> {
  const { data, error } = await pim()
    .from('product_link')
    .select('*')
    .or(`from_product_id.eq.${productId},to_product_id.eq.${productId}`)
    .order('link_type')
  return unwrap<ProductLinkRow[]>({ data, error }).map((row) => ({
    id: row.id,
    product: row.from_product_id,
    linked_product: row.from_product_id === productId ? row.to_product_id : row.from_product_id,
    linked_external_id: null,
    linked_title: textMeta(row, 'linked_title'),
    relation_type: row.link_type,
    direction: row.from_product_id === productId ? 'outbound' : 'inbound',
    created_by: null,
    created_at: row.created_at,
  }))
}

export async function listProductTimeEntries(productId: string): Promise<ProductTimeEntry[]> {
  const { data, error } = await pim().from('product_time_entry').select('*').eq('product_id', productId).order('started_at')
  return unwrap<ProductTimeEntryRow[]>({ data, error }).map((row) => ({
    id: row.id,
    product: row.product_id,
    user_name: textMeta(row, 'user_name'),
    user_email: textMeta(row, 'user_email'),
    started_at: row.started_at,
    ended_at: textMeta(row, 'ended_at'),
    duration_ms: typeof row.seconds_spent === 'number' ? row.seconds_spent * 1000 : null,
    duration_hours: row.seconds_spent != null ? String(Number(row.seconds_spent) / 3600) : null,
    billable: typeof metadata(row).billable === 'boolean' ? metadata(row).billable as boolean : null,
    description: textMeta(row, 'description'),
    tags: Array.isArray(metadata(row).tags) ? JSON.stringify(metadata(row).tags) : null,
  }))
}

export async function updateProduct(id: string, patch: Record<string, unknown>, expectedUpdatedAt?: string | null) {
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

  let authoritative: Record<string, unknown> = {}
  if (Object.keys(direct).length > 0) {
    const { data, error } = await pim().from('product').update(direct).eq('id', id).select('*').single()
    authoritative = unwrap<Record<string, unknown>>({ data, error })
  }
  if (Object.keys(metadataPatch).length > 0) {
    const expectedVersion = typeof authoritative.updated_at === 'string'
      ? authoritative.updated_at
      : expectedUpdatedAt ?? null
    const { data, error } = await asDynamic(api()).rpc('pm_patch_product_metadata', {
      p_product_id: id,
      p_patch: metadataPatch as Json,
      p_expected_updated_at: expectedVersion ?? undefined,
    })
    const row = unwrap<Array<Record<string, unknown>>>({ data, error })[0]
    authoritative = { ...authoritative, ...row }
  }
  return authoritative
}

export async function fetchLicensors(): Promise<Licensor[]> {
  const { data, error } = await dynamicCore().from('licensor').select('id,name').order('name')
  return unwrap<Licensor[]>({ data, error })
}

export async function fetchProductTypes(): Promise<ProductType[]> {
  const { data, error } = await dynamicCore().from('product_type').select('id,name').order('name')
  return unwrap<ProductType[]>({ data, error })
}

export async function fetchCustomers(): Promise<Retailer[]> {
  // api.pm_customer_list: global active/potential AND PM extension active.
  // Identity is UUID company_id; labels prefer curated display_name.
  const { data, error } = await asDynamic(api())
    .from(PM_CUSTOMER_LIST)
    .select(PM_CUSTOMER_LIST_SELECT)
    .order('name')
  return unwrap<PmCustomerListRow[]>({ data, error }).map(mapPmCustomerListRow)
}

export async function fetchBuyers(retailerId: string): Promise<Buyer[]> {
  const { data, error } = await dynamicCore()
    .from('contact_company')
    .select('contact:contact_id(id,full_name,email)')
    .eq('company_id', retailerId)
  return unwrap<BuyerRow[]>({ data, error }).flatMap((row) => row.contact?.id ? [{
    id: row.contact.id,
    name: row.contact?.full_name ?? row.contact?.email ?? null,
    email: row.contact?.email ?? null,
    retailer: retailerId,
  }] : [])
}

export function userName(u: AppUser | string | null | undefined) {
  if (!u || typeof u === 'string') return 'Unknown'
  return [u.first_name, u.last_name].filter(Boolean).join(' ') || u.email || 'Unknown'
}

export function userInitials(u: AppUser | string | null | undefined) {
  return userName(u).split(' ').filter(Boolean).slice(0, 2).map((s) => s[0]?.toUpperCase()).join('') || '?'
}
