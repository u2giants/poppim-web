// Minimal slice of the shared Directus schema that poppim-web reads.
// Backend collections live in the `directus` repo (pm-system/apply-schema.mjs).

export interface Stage {
  id: string
  name: string
  stage_order: number | null
  category: string | null
  business_unit: string | null
}

export interface Retailer {
  id: string
  name: string
}

export interface Licensor {
  id: string
  name: string
}

export interface Product {
  id: string
  code: string | null
  name: string | null
  business_unit: string | null
  stage: string | Stage | null
  retailer: string | Retailer | null
  licensor: string | Licensor | null
  on_shelf_date: string | null
  pi_status: string | null
  cover_url: string | null
}

export interface DirectusUser {
  id: string
  first_name: string | null
  last_name: string | null
  email: string | null
  avatar: string | null
  role: { id: string; name: string } | null
}

export interface ChecklistItem {
  id: string
  product: string
  label: string | null
  done: boolean
  sort: number | null
}

export interface Subtask {
  id: string
  product: string
  title: string | null
  done: boolean
  assignee: string | DirectusUser | null
  due_date: string | null
  sort: number | null
}

export interface ProductAssignee {
  id: string
  product: string
  directus_user: DirectusUser | string
}

export interface Comment {
  id: string
  comment: string
  date_created: string
  user_created: DirectusUser | string | null
}

export interface Schema {
  product: Product[]
  stage: Stage[]
  retailer: Retailer[]
  checklist_item: ChecklistItem[]
  subtask: Subtask[]
  product_assignee: ProductAssignee[]
}
