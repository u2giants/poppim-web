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

export interface Project {
  id: string
  title: string | null
  status: string | null
  business_unit: string | null
  retailer: string | Retailer | null
  on_shelf_date: string | null
  brief: string | null
  restrictions: string | null
}

export interface Product {
  id: string
  code: string | null
  name: string | null
  description: string | null
  priority: string | null
  business_unit: string | null
  stage: string | Stage | null
  retailer: string | Retailer | null
  licensor: string | Licensor | null
  project: string | Project | null
  on_shelf_date: string | null
  pi_status: string | null
  cover_url: string | null
  clickup_url: string | null
  clickup_list_name: string | null
  clickup_created_at: string | null
  clickup_updated_at: string | null
  clickup_closed_at: string | null
  clickup_start_at: string | null
  clickup_due_at: string | null
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
  group_name: string | null
  source_id: string | null
  source_system: string | null
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

export interface ProductFile {
  id: string
  product: string
  title: string | null
  file_type: string | null
  mime_type: string | null
  size: number | null
  source_url: string | null
  thumbnail_url: string | null
  stored_url: string | null
  uploaded_at: string | null
}

export interface ProductUpdate {
  id: string
  product: string
  body: string | null
  author_name: string | null
  author_email: string | null
  happened_at: string | null
  kind: string | null
}

export interface ProductTag {
  id: string
  product: string
  name: string | null
  color: string | null
}

export interface ProductField {
  id: string
  product: string
  name: string | null
  field_type: string | null
  value_text: string | null
  value_json: unknown
}

export interface ProductActivity {
  id: string
  product: string
  action: string | null
  detail: string | null
  actor_name: string | null
  happened_at: string | null
}

export interface ProductLink {
  id: string
  product: string
  linked_product: string | Product | null
  linked_external_id: string | null
  linked_title: string | null
  relation_type: string | null
  direction: string | null
  created_by: string | null
  created_at: string | null
}

export interface ProductTimeEntry {
  id: string
  product: string
  user_name: string | null
  user_email: string | null
  started_at: string | null
  ended_at: string | null
  duration_ms: number | null
  duration_hours: string | null
  billable: boolean | null
  description: string | null
  tags: string | null
}

export interface Schema {
  product: Product[]
  project: Project[]
  stage: Stage[]
  retailer: Retailer[]
  checklist_item: ChecklistItem[]
  subtask: Subtask[]
  product_assignee: ProductAssignee[]
  product_file: ProductFile[]
  product_update: ProductUpdate[]
  product_tag: ProductTag[]
  product_field: ProductField[]
  product_activity: ProductActivity[]
  product_link: ProductLink[]
  product_time_entry: ProductTimeEntry[]
}
