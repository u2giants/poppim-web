import { pim, unwrap } from '@/lib/supabaseQuery'
import { enrichProductRowsWithBoardFields } from '@/domain/products/enrich'
import { supabaseProductToProduct } from '@/domain/products/supabaseAdapter'
import type { Project, Product } from '@/lib/types'

export async function fetchProjects(): Promise<Project[]> {
  const { data, error } = await pim().from('project').select('*,company:company_id(id,name),contact:primary_contact_id(id,full_name,email),collection:design_collection_id(id,name,season,metadata)').order('title')
  return unwrap<any[]>({ data, error }).map((row) => ({
    id: row.id,
    title: row.title,
    status: row.status,
    business_unit: row.metadata?.business_unit ?? row.stage ?? null,
    retailer: row.company ? { id: row.company.id, name: row.company.name } : null,
    buyer: row.contact ? { id: row.contact.id, name: row.contact.full_name ?? row.contact.email } : null,
    design_collection: row.collection ? { id: row.collection.id, name: row.collection.name, format: null, theme: null, business_unit: null, version_date: null, account_specific_for: null } : null,
    on_shelf_date: row.metadata?.on_shelf_date ?? null,
    pps_requested_date: row.metadata?.pps_requested_date ?? null,
    brief: row.metadata?.brief ?? null,
    restrictions: row.metadata?.restrictions ?? null,
  }))
}

export async function fetchProjectProductCounts(): Promise<Map<string, number>> {
  const { data, error } = await pim().from('product').select('project_id')
  const counts = new Map<string, number>()
  for (const row of unwrap<Array<{ project_id: string | null }>>({ data, error })) {
    if (row.project_id) counts.set(row.project_id, (counts.get(row.project_id) ?? 0) + 1)
  }
  return counts
}

export async function fetchProjectProducts(projectId: string): Promise<Product[]> {
  const { data, error } = await pim().from('product').select('*').eq('project_id', projectId).order('name').limit(200)
  const rows = await enrichProductRowsWithBoardFields(unwrap<any[]>({ data, error }))
  return rows.map((row) => supabaseProductToProduct(row))
}
