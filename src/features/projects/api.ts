import { api, asDynamic } from '@/lib/supabaseQuery'
import type { BusinessUnit } from '@/domain/products/types'
import { enrichProductRowsWithBoardFields } from '@/domain/products/enrich'
import { supabaseProductToProduct } from '@/domain/products/supabaseAdapter'
import { metadata as metadataOf, pim, unwrap } from '@/lib/supabaseQuery'
import type { Json } from '@/lib/database.types'
import type { Project, Product } from '@/lib/types'

interface ProjectRpcRow {
  id: string; title: string; status: string | null; business_unit: string | null
  company_id: string | null; company_name: string | null
  contact_id: string | null; contact_name: string | null
  design_collection_id: string | null; collection_name: string | null
  on_shelf_date: string | null; pps_requested_date: string | null
  brief: string | null; restrictions: string | null; product_count: number
  updated_at: string
}

export async function fetchProjects(businessUnit: BusinessUnit, search?: string, cursor?: string | null): Promise<{ projects: Project[]; counts: Map<string, number>; nextCursor: string | null }> {
  const after = cursor ? JSON.parse(atob(cursor)) as { updatedAt:string;id:string } : null
  const { data, error } = await asDynamic(api()).rpc('pm_project_page', {
    p_business_unit: businessUnit,
    p_search: search?.trim() || null,
    p_after_updated_at: after?.updatedAt ?? null,
    p_after_id: after?.id ?? null,
    p_limit: 101,
  })
  const raw = unwrap<ProjectRpcRow[]>({ data, error })
  const rows = raw.slice(0,100)
  const last = rows.at(-1)
  return {
    projects: rows.map((row) => ({
      id: row.id, title: row.title, status: row.status, business_unit: row.business_unit,
      retailer: row.company_id ? { id: row.company_id, name: row.company_name ?? 'Unknown' } : null,
      buyer: row.contact_id ? { id: row.contact_id, name: row.contact_name ?? 'Unknown' } : null,
      design_collection: row.design_collection_id ? { id: row.design_collection_id, name: row.collection_name ?? 'Unknown', format: null, theme: null, business_unit: null, version_date: null, account_specific_for: null } : null,
      on_shelf_date: row.on_shelf_date, pps_requested_date: row.pps_requested_date,
      brief: row.brief, restrictions: row.restrictions,
    })),
    counts: new Map(rows.map((row) => [row.id, Number(row.product_count)])),
    nextCursor: raw.length > 100 && last ? btoa(JSON.stringify({ updatedAt:last.updated_at,id:last.id })) : null,
  }
}

export const PROJECT_EDIT_CONFLICT = 'This project was changed by someone else. Reload and try again.'

export type ProjectFieldPatch = {
  company_id?: string | null
  primary_contact_id?: string | null
  on_shelf_date?: string | null
  pps_requested_date?: string | null
}

// Retailer and buyer are columns on pim.project; the two dates live in its
// metadata jsonb (same keys pm_project_page reads). Metadata is merged
// client-side, guarded by updated_at so a concurrent edit is not overwritten.
export async function updateProjectFields(projectId: string, patch: ProjectFieldPatch): Promise<void> {
  const { on_shelf_date, pps_requested_date, ...direct } = patch
  const metadataPatch: Record<string, string | null> = {}
  if (on_shelf_date !== undefined) metadataPatch.on_shelf_date = on_shelf_date
  if (pps_requested_date !== undefined) metadataPatch.pps_requested_date = pps_requested_date

  if (Object.keys(metadataPatch).length === 0) {
    // RLS hides a refused update as zero rows rather than an error.
    const rows = unwrap<Array<{ id: string }>>(await pim().from('project').update(direct).eq('id', projectId).select('id'))
    if (rows.length === 0) throw new Error('This project could not be saved.')
    return
  }

  const current = unwrap<{ metadata: Json; updated_at: string }>(
    await pim().from('project').select('metadata,updated_at').eq('id', projectId).single(),
  )
  const metadata = { ...metadataOf(current) }
  for (const [key, value] of Object.entries(metadataPatch)) {
    if (value === null) delete metadata[key]
    else metadata[key] = value
  }
  const rows = unwrap<Array<{ id: string }>>(
    await pim().from('project').update({ ...direct, metadata: metadata as Json }).eq('id', projectId).eq('updated_at', current.updated_at).select('id'),
  )
  if (rows.length === 0) throw new Error(PROJECT_EDIT_CONFLICT)
}

export async function fetchProjectProducts(projectId: string): Promise<Product[]> {
  const { data, error } = await pim().from('product')
    .select('id,name,status,stage,lifecycle_status,cover_url,project_id,design_id,company_id,buyer_contact_id,factory_id,licensor_id,property_id,product_type_id,updated_at,metadata')
    .eq('project_id', projectId).order('name').order('id').limit(200)
  const rows = await enrichProductRowsWithBoardFields(unwrap({ data, error }))
  return rows.map((row) => supabaseProductToProduct(row))
}
