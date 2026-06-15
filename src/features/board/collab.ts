import {
  readItems,
  createItem,
  updateItem,
  deleteItem,
  readUsers,
  readComments,
  createComment,
} from '@directus/sdk'
import type { Licensor, ProductType } from '@/lib/types'
import { directus } from '@/lib/directus'
import type {
  ChecklistItem,
  Subtask,
  ProductAssignee,
  Comment,
  DirectusUser,
  ProductFile,
  ProductUpdate,
  ProductTag,
  ProductField,
  ProductActivity,
  ProductLink,
  ProductTimeEntry,
} from '@/lib/types'

const USER_FIELDS = ['id', 'first_name', 'last_name', 'email', 'avatar'] as const

// ---- Checklist ----
export async function listChecklist(productId: string) {
  return directus.request(
    readItems('checklist_item', { filter: { product: { _eq: productId } }, sort: ['sort', 'id'], limit: -1 }),
  ) as Promise<ChecklistItem[]>
}
export async function addChecklist(productId: string, label: string) {
  return directus.request(createItem('checklist_item', { product: productId, label, done: false })) as Promise<ChecklistItem>
}
export async function setChecklistDone(id: string, done: boolean) {
  return directus.request(updateItem('checklist_item', id, { done }))
}
export async function removeChecklist(id: string) {
  return directus.request(deleteItem('checklist_item', id))
}

// ---- Subtasks ----
export async function listSubtasks(productId: string) {
  return directus.request(
    readItems('subtask', {
      filter: { product: { _eq: productId } },
      fields: ['id', 'title', 'done', 'due_date', { assignee: USER_FIELDS }] as never,
      sort: ['sort', 'id'],
      limit: -1,
    }),
  ) as unknown as Promise<Subtask[]>
}
export async function addSubtask(productId: string, title: string) {
  return directus.request(createItem('subtask', { product: productId, title, done: false })) as Promise<Subtask>
}
export async function setSubtaskDone(id: string, done: boolean) {
  return directus.request(updateItem('subtask', id, { done }))
}

// ---- Assignees (M2M via product_assignee) ----
export async function listAssignees(productId: string) {
  return directus.request(
    readItems('product_assignee', {
      filter: { product: { _eq: productId } },
      fields: ['id', { directus_user: USER_FIELDS }] as never,
      limit: -1,
    }),
  ) as unknown as Promise<ProductAssignee[]>
}
export async function addAssignee(productId: string, userId: string) {
  return directus.request(createItem('product_assignee', { product: productId, directus_user: userId })) as Promise<ProductAssignee>
}
export async function removeAssignee(rowId: string) {
  return directus.request(deleteItem('product_assignee', rowId))
}
export async function listUsers() {
  return directus.request(
    readUsers({ fields: USER_FIELDS, filter: { status: { _eq: 'active' } }, sort: ['first_name'], limit: -1 }),
  ) as unknown as Promise<DirectusUser[]>
}

// ---- Comments (native directus_comments) ----
export async function listComments(productId: string) {
  return directus.request(
    readComments({
      filter: { collection: { _eq: 'product' }, item: { _eq: productId } },
      fields: ['id', 'comment', 'date_created', { user_created: USER_FIELDS }] as never,
      sort: ['date_created'],
      limit: -1,
    }),
  ) as unknown as Promise<Comment[]>
}
export async function addComment(productId: string, text: string) {
  return directus.request(createComment({ collection: 'product', item: productId, comment: text }))
}

// ---- ClickUp-origin work data, now first-class Poppim data ----
export async function listProductFiles(productId: string) {
  return directus.request(
    readItems('product_file', {
      filter: { product: { _eq: productId } },
      fields: ['id', 'title', 'file_type', 'mime_type', 'size', 'source_url', 'thumbnail_url', 'stored_url', 'uploaded_at'],
      sort: ['uploaded_at', 'title'],
      limit: -1,
    }),
  ) as Promise<ProductFile[]>
}

export async function listProductUpdates(productId: string) {
  return directus.request(
    readItems('product_update', {
      filter: { product: { _eq: productId } },
      fields: ['id', 'body', 'author_name', 'author_email', 'happened_at', 'kind'],
      sort: ['happened_at', 'id'],
      limit: -1,
    }),
  ) as Promise<ProductUpdate[]>
}

export async function listProductTags(productId: string) {
  return directus.request(
    readItems('product_tag', {
      filter: { product: { _eq: productId } },
      fields: ['id', 'name', 'color'],
      sort: ['name'],
      limit: -1,
    }),
  ) as Promise<ProductTag[]>
}

export async function listProductFields(productId: string) {
  return directus.request(
    readItems('product_field', {
      filter: { product: { _eq: productId } },
      fields: ['id', 'name', 'field_type', 'value_text', 'value_json'],
      sort: ['name'],
      limit: -1,
    }),
  ) as Promise<ProductField[]>
}

export async function listProductActivity(productId: string) {
  return directus.request(
    readItems('product_activity', {
      filter: { product: { _eq: productId } },
      fields: ['id', 'action', 'detail', 'actor_name', 'happened_at'],
      sort: ['happened_at', 'id'],
      limit: -1,
    }),
  ) as Promise<ProductActivity[]>
}

export async function listProductLinks(productId: string) {
  return directus.request(
    readItems('product_link', {
      filter: { product: { _eq: productId } },
      fields: ['id', 'linked_external_id', 'linked_title', 'relation_type', 'direction', 'created_by', 'created_at', { linked_product: ['id', 'code', 'name'] }] as never,
      sort: ['relation_type', 'linked_title'],
      limit: -1,
    }),
  ) as unknown as Promise<ProductLink[]>
}

export async function listProductTimeEntries(productId: string) {
  return directus.request(
    readItems('product_time_entry', {
      filter: { product: { _eq: productId } },
      fields: ['id', 'user_name', 'user_email', 'started_at', 'ended_at', 'duration_ms', 'duration_hours', 'billable', 'description', 'tags'],
      sort: ['started_at', 'id'],
      limit: -1,
    }),
  ) as Promise<ProductTimeEntry[]>
}

export async function updateProduct(id: string, patch: Record<string, unknown>) {
  return directus.request(updateItem('product', id, patch as never))
}

export async function fetchLicensors(): Promise<Licensor[]> {
  return directus.request(readItems('licensor', { sort: ['name'], limit: -1 })) as Promise<Licensor[]>
}

export async function fetchProductTypes(): Promise<ProductType[]> {
  return directus.request(readItems('product_type', { sort: ['name'], limit: -1 })) as Promise<ProductType[]>
}

export function userName(u: DirectusUser | string | null | undefined) {
  if (!u || typeof u === 'string') return 'Unknown'
  return [u.first_name, u.last_name].filter(Boolean).join(' ') || u.email || 'Unknown'
}
export function userInitials(u: DirectusUser | string | null | undefined) {
  return userName(u).split(' ').filter(Boolean).slice(0, 2).map((s) => s[0]?.toUpperCase()).join('') || '?'
}
