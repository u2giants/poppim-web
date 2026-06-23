import type { Product, Stage } from '@/lib/types'
import { metadata, numberMeta, textMeta } from '@/lib/supabaseQuery'

type SupabaseProductRow = Record<string, unknown> & {
  id: string
  code?: string | null
  name?: string | null
  status?: string | null
  stage?: string | null
  lifecycle_status?: string | null
  cover_url?: string | null
  project_id?: string | null
  project_title?: string | null
  company_id?: string | null
  company_name?: string | null
  buyer_contact_id?: string | null
  buyer_name?: string | null
  factory_id?: string | null
  factory_name?: string | null
  licensor_id?: string | null
  licensor_name?: string | null
  property_id?: string | null
  property_name?: string | null
  product_type_id?: string | null
  product_type_name?: string | null
  clickup_task_id?: string | null
  updated_at?: string | null
  metadata?: unknown
}

function relation(id: string | null | undefined, name: string | null | undefined) {
  return id || name ? { id: id ?? name ?? '', name: name ?? null } : null
}

function stageRelation(row: SupabaseProductRow): Stage | null {
  const id = textMeta(row, 'stage_id') ?? row.stage ?? null
  const name = textMeta(row, 'stage_name') ?? row.stage ?? null
  if (!id && !name) return null
  return {
    id: id ?? name ?? '',
    name: name ?? id ?? 'Unknown',
    stage_order: typeof metadata(row).stage_order === 'number' ? metadata(row).stage_order as number : null,
    category: null,
    business_unit: textMeta(row, 'business_unit'),
  }
}

export function supabaseProductToProduct(row: SupabaseProductRow): Product {
  return {
    id: row.id,
    code: row.code ?? row.clickup_task_id ?? null,
    name: row.name ?? null,
    description: textMeta(row, 'description'),
    priority: textMeta(row, 'priority'),
    business_unit: textMeta(row, 'business_unit') ?? textMeta(row, 'department'),
    stage: stageRelation(row),
    retailer: row.company_id || row.company_name ? { id: row.company_id ?? '', name: row.company_name ?? null } : null,
    buyer: row.buyer_contact_id || row.buyer_name ? { id: row.buyer_contact_id ?? '', name: row.buyer_name ?? null } : null,
    licensor: relation(row.licensor_id, row.licensor_name),
    property: relation(row.property_id, row.property_name),
    project: row.project_id || row.project_title
      ? {
        id: row.project_id ?? '',
        title: row.project_title ?? null,
        status: textMeta(row, 'project_status'),
        business_unit: textMeta(row, 'business_unit'),
        retailer: row.company_id || row.company_name ? { id: row.company_id ?? '', name: row.company_name ?? null } : null,
        buyer: row.buyer_contact_id || row.buyer_name ? { id: row.buyer_contact_id ?? '', name: row.buyer_name ?? null } : null,
        on_shelf_date: textMeta(row, 'project_on_shelf_date'),
        brief: null,
        restrictions: null,
      }
      : null,
    design: textMeta(row, 'design_id') || textMeta(row, 'design_name')
      ? { id: textMeta(row, 'design_id') ?? '', name: textMeta(row, 'design_name'), business_unit: textMeta(row, 'business_unit'), status: null, theme: null, nas_path: null, thumbnail_url: textMeta(row, 'design_thumbnail_url'), licensor: null, property: null, product_type: null, season: null, first_offered_to: null }
      : null,
    design_collection: textMeta(row, 'design_collection_id') || textMeta(row, 'design_collection_name')
      ? { id: textMeta(row, 'design_collection_id') ?? '', name: textMeta(row, 'design_collection_name'), format: null, theme: null, business_unit: textMeta(row, 'business_unit'), version_date: null, account_specific_for: null }
      : null,
    product_type: relation(row.product_type_id, row.product_type_name),
    factory: relation(row.factory_id, row.factory_name),
    on_shelf_date: textMeta(row, 'on_shelf_date'),
    pps_requested_date: textMeta(row, 'pps_requested_date'),
    brand_assurance_number: textMeta(row, 'brand_assurance_number'),
    pi_status: textMeta(row, 'pi_status'),
    cover_url: row.cover_url ?? null,
    lifecycle_state: row.lifecycle_status ?? textMeta(row, 'lifecycle_state'),
    next_action: textMeta(row, 'next_action'),
    next_owner_user: null,
    next_owner_role: textMeta(row, 'next_owner_role') ? { id: textMeta(row, 'next_owner_role')!, name: textMeta(row, 'next_owner_role') } : null,
    waiting_on: textMeta(row, 'waiting_on'),
    blocker_reason: textMeta(row, 'blocker_reason'),
    blocked_since: textMeta(row, 'blocked_since'),
    risk_level: textMeta(row, 'risk_level'),
    last_meaningful_update_at: textMeta(row, 'last_meaningful_update_at'),
    closure_reason: textMeta(row, 'closure_reason'),
    closed_at: textMeta(row, 'closed_at'),
    closed_by: null,
    clickup_url: textMeta(row, 'clickup_url'),
    clickup_list_id: textMeta(row, 'clickup_list_id'),
    clickup_list_name: textMeta(row, 'clickup_list_name'),
    clickup_folder_id: textMeta(row, 'clickup_folder_id'),
    clickup_folder_name: textMeta(row, 'clickup_folder_name'),
    clickup_space_id: textMeta(row, 'clickup_space_id'),
    clickup_space_name: textMeta(row, 'clickup_space_name'),
    clickup_creator_id: textMeta(row, 'clickup_creator_id'),
    clickup_creator_name: textMeta(row, 'clickup_creator_name'),
    clickup_time_estimate_ms: numberMeta(row, 'clickup_time_estimate_ms'),
    clickup_orderindex: textMeta(row, 'clickup_orderindex'),
    clickup_parent_id: textMeta(row, 'clickup_parent_id'),
    clickup_top_level_parent_id: textMeta(row, 'clickup_top_level_parent_id'),
    clickup_status: row.status ?? textMeta(row, 'clickup_status'),
    clickup_status_type: textMeta(row, 'clickup_status_type'),
    clickup_status_color: textMeta(row, 'clickup_status_color'),
    clickup_status_order: numberMeta(row, 'clickup_status_order'),
    clickup_created_at: textMeta(row, 'clickup_created_at'),
    clickup_updated_at: row.updated_at ?? textMeta(row, 'clickup_updated_at'),
    clickup_closed_at: textMeta(row, 'clickup_closed_at'),
    clickup_start_at: textMeta(row, 'clickup_start_at'),
    clickup_due_at: textMeta(row, 'clickup_due_at'),
  } as Product
}
