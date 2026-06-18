// Minimal slice of the shared Directus schema that poppim-web reads.
// Backend collections live in the `directus` repo (pm-system/apply-schema.mjs).

export interface Stage {
  id: string
  name: string
  stage_order: number | null
  category: string | null
  business_unit: string | null
}

// NOTE: the `retailer` collection is a dump of EVERY Twenty-CRM company, not a
// curated list. Only rows whose customer_status is ACTIVE_CUSTOMER or
// POTENTIAL_CUSTOMER are valid customers for app pickers. Filter on it — never
// offer the raw collection as a choice list. See AGENTS.md §11.
export type CustomerStatus = 'ACTIVE_CUSTOMER' | 'POTENTIAL_CUSTOMER' | 'OTHER' | 'UNASSIGNED'

export interface Retailer {
  id: string
  name: string
  customer_status?: CustomerStatus | null
  resale_restriction?: boolean | null
  notes?: string | null
}

export interface Buyer {
  id: string
  name: string | null
  retailer?: string | Retailer | null
  email?: string | null
  samples_required?: boolean | null
}

export interface Licensor {
  id: string
  name: string
  turnaround_days_min?: number | null
  turnaround_days_max?: number | null
  requires_pi?: boolean | null
  prohibits_resale?: boolean | null
}

export interface Property {
  id: string
  name: string | null
  licensor?: string | Licensor | null
}

export interface Factory {
  id: string
  name: string | null
  capabilities?: string | null
  china_team_contact?: string | null
}

export interface ProductType {
  id: string
  name: string | null
}

export interface Season {
  id: string
  name: string | null
  year: number | null
  business_unit: string | null
}

export interface DirectusRole {
  id: string
  name: string | null
}

export interface DirectusFile {
  id: string
  filename_download?: string | null
  title?: string | null
  type?: string | null
}

export interface WorkflowFields {
  lifecycle_state?: string | null
  next_action?: string | null
  next_owner_user?: string | DirectusUser | null
  next_owner_role?: string | DirectusRole | null
  waiting_on?: string | null
  blocker_reason?: string | null
  blocked_since?: string | null
  risk_level?: string | null
  last_meaningful_update_at?: string | null
  closure_reason?: string | null
  closed_at?: string | null
  closed_by?: string | DirectusUser | null
}

export interface Project extends WorkflowFields {
  id: string
  title: string | null
  status: string | null
  business_unit: string | null
  retailer: string | Retailer | null
  buyer?: string | Buyer | null
  season?: string | Season | null
  design_collection?: string | DesignCollection | null
  on_shelf_date: string | null
  pps_requested_date?: string | null
  brief: string | null
  restrictions: string | null
}

export interface DesignCollection extends WorkflowFields {
  id: string
  name: string | null
  format: string | null
  theme: string | null
  business_unit: string | null
  version_date: string | null
  account_specific_for: string | Retailer | null
}

export interface Design extends WorkflowFields {
  id: string
  name: string | null
  business_unit: string | null
  status: string | null
  theme: string | null
  nas_path: string | null
  thumbnail_url: string | null
  licensor: string | Licensor | null
  property: string | Property | null
  product_type: string | ProductType | null
  season: string | Season | null
  first_offered_to: string | Retailer | null
}

export interface Product extends WorkflowFields {
  id: string
  code: string | null
  name: string | null
  description: string | null
  priority: string | null
  business_unit: string | null
  stage: string | Stage | null
  retailer: string | Retailer | null
  buyer?: string | Buyer | null
  licensor: string | Licensor | null
  property?: string | Property | null
  project: string | Project | null
  design?: string | Design | null
  design_collection?: string | DesignCollection | null
  product_type?: string | ProductType | null
  factory?: string | Factory | null
  on_shelf_date: string | null
  pps_requested_date?: string | null
  brand_assurance_number?: string | null
  pi_status: string | null
  cover_url: string | null
  clickup_url: string | null
  clickup_list_id: string | null
  clickup_list_name: string | null
  clickup_folder_id: string | null
  clickup_folder_name: string | null
  clickup_space_id: string | null
  clickup_space_name: string | null
  clickup_creator_id: string | null
  clickup_creator_name: string | null
  clickup_time_estimate_ms: number | string | null
  clickup_orderindex: string | null
  clickup_parent_id: string | null
  clickup_top_level_parent_id: string | null
  clickup_status: string | null
  clickup_status_type: string | null
  clickup_status_color: string | null
  clickup_status_order: number | string | null
  clickup_created_at: string | null
  clickup_updated_at: string | null
  clickup_closed_at: string | null
  clickup_start_at: string | null
  clickup_due_at: string | null
}

export interface Order {
  id: string
  product: string | Product | null
  project?: string | Project | null
  retailer: string | Retailer | null
  buyer: string | Buyer | null
  order_number: string | null
  order_date: string | null
  quantity: number | null
  status?: string | null
  notes?: string | null
}

export interface ProductSubmission {
  id: string
  product: string | Product | null
  project: string | Project | null
  business_unit: string | null
  submission_type: string | null
  recipient_type: string | null
  licensor: string | Licensor | null
  submitted_by: string | DirectusUser | null
  submitted_at: string | null
  expected_response_at: string | null
  status: string | null
  response_at: string | null
  response_summary: string | null
  brand_assurance_number: string | null
  brand_assurance_file: string | DirectusFile | null
  portal_url: string | null
  portal_reference: string | null
  revision_required: boolean | null
  revision: string | RevisionRequest | null
  notes: string | null
}

export interface ProductSample {
  id: string
  product: string | Product | null
  project: string | Project | null
  factory: string | Factory | null
  sample_type: string | null
  requested_by: string | DirectusUser | null
  requested_at: string | null
  expected_at: string | null
  received_at: string | null
  sent_to_buyer_at: string | null
  sent_to_licensor_at: string | null
  status: string | null
  primary_photo: string | DirectusFile | null
  photo_urls: string | null
  notes: string | null
  revision_required: boolean | null
  revision_reason: string | null
  revision: string | RevisionRequest | null
}

export interface RevisionRequest {
  id: string
  object_collection: string | null
  object_id: string | null
  product: string | Product | null
  project: string | Project | null
  design: string | Design | null
  submission: string | ProductSubmission | null
  source: string | null
  requested_by_user: string | DirectusUser | null
  requested_by_external: string | null
  requested_at: string | null
  assigned_to: string | DirectusUser | null
  due_at: string | null
  status: string | null
  body: string | null
  markup_file: string | DirectusFile | null
  resolved_at: string | null
  resolution_note: string | null
}

export interface PmSavedView {
  id: string
  user: string | DirectusUser | null
  role: string | DirectusRole | null
  name: string | null
  screen: string | null
  business_unit: string | null
  filters_json: unknown
  sort_json: unknown
  columns_json: unknown
  is_default: boolean | null
  shared_with_role: string | DirectusRole | null
  visibility: 'personal' | 'shared' | null
  origin: 'user' | 'clickup_list' | null
  color: string | null
  sort_order: number | null
}

export interface PmViewPref {
  id: string
  user: string | DirectusUser | null
  view: string | PmSavedView | null
  sort_order: number | null
  color: string | null
  hidden: boolean | null
}

// The canonical filter payload stored in pm_saved_view.filters_json.
export interface ViewFilters {
  search?: string
  licensorIds?: string[]
  listNames?: string[]
  groupBy?: string
  colorBy?: string
}

export interface StageHistory {
  id: string
  product: string | Product | null
  from_stage: string | Stage | null
  to_stage: string | Stage | null
  changed_at: string | null
}

export interface DirectusUser {
  id: string
  first_name: string | null
  last_name: string | null
  email: string | null
  avatar: string | null
  role: DirectusRole | null
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
  design: Design[]
  design_collection: DesignCollection[]
  stage: Stage[]
  retailer: Retailer[]
  buyer: Buyer[]
  licensor: Licensor[]
  property: Property[]
  factory: Factory[]
  product_type: ProductType[]
  season: Season[]
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
  order: Order[]
  stage_history: StageHistory[]
  product_submission: ProductSubmission[]
  product_sample: ProductSample[]
  revision_request: RevisionRequest[]
  pm_saved_view: PmSavedView[]
  pm_view_pref: PmViewPref[]
}
