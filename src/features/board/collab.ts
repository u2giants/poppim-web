import {
  readItems,
  createItem,
  updateItem,
  deleteItem,
  readUsers,
  readComments,
  createComment,
} from '@directus/sdk'
import { directus } from '@/lib/directus'
import type { ChecklistItem, Subtask, ProductAssignee, Comment, DirectusUser } from '@/lib/types'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const USER_FIELDS = ['id', 'first_name', 'last_name', 'email', 'avatar'] as any

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
      fields: ['id', 'title', 'done', 'due_date', { assignee: USER_FIELDS }] as any,
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
      fields: ['id', { directus_user: USER_FIELDS }] as any,
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
      fields: ['id', 'comment', 'date_created', { user_created: USER_FIELDS }] as any,
      sort: ['date_created'],
      limit: -1,
    }),
  ) as unknown as Promise<Comment[]>
}
export async function addComment(productId: string, text: string) {
  return directus.request(createComment({ collection: 'product', item: productId, comment: text }))
}

export function userName(u: DirectusUser | string | null | undefined) {
  if (!u || typeof u === 'string') return 'Unknown'
  return [u.first_name, u.last_name].filter(Boolean).join(' ') || u.email || 'Unknown'
}
export function userInitials(u: DirectusUser | string | null | undefined) {
  return userName(u).split(' ').filter(Boolean).slice(0, 2).map((s) => s[0]?.toUpperCase()).join('') || '?'
}
