import { pim, unwrap } from '@/lib/supabaseQuery'
import type { Design, DesignCollection } from '@/lib/types'
import type { BusinessUnit } from '@/domain/products/types'

export interface FetchDesignOpts {
  search?: string
  businessUnit?: BusinessUnit
  limit?: number
}

export async function fetchDesigns(opts: FetchDesignOpts = {}): Promise<Design[]> {
  const { data, error } = await (pim() as any).from('design').select('*').order('status').order('title').limit(opts.limit ?? 300)
  const q = opts.search?.trim().toLowerCase()
  return unwrap<any[]>({ data, error })
    .filter((row) => !q || [row.title, row.status, row.nas_path].filter(Boolean).join(' ').toLowerCase().includes(q))
    .map((row) => ({
      id: row.id,
      name: row.title,
      business_unit: row.metadata?.business_unit ?? null,
      status: row.status,
      theme: row.metadata?.theme ?? null,
      nas_path: row.nas_path,
      thumbnail_url: row.thumbnail_url,
      licensor: null,
      property: null,
      product_type: null,
      season: null,
      first_offered_to: null,
    }))
}

export async function fetchDesignCollections(opts: FetchDesignOpts = {}): Promise<DesignCollection[]> {
  const { data, error } = await (pim() as any).from('design_collection').select('*').order('updated_at', { ascending: false }).limit(opts.limit ?? 300)
  const q = opts.search?.trim().toLowerCase()
  return unwrap<any[]>({ data, error })
    .filter((row) => !q || [row.name, row.season, row.status].filter(Boolean).join(' ').toLowerCase().includes(q))
    .map((row) => ({
      id: row.id,
      name: row.name,
      format: row.metadata?.format ?? null,
      theme: row.metadata?.theme ?? null,
      business_unit: row.metadata?.business_unit ?? null,
      version_date: row.updated_at,
      account_specific_for: row.company_id,
    }))
}

export async function fetchProductCountsByDesign(): Promise<Map<string, number>> {
  const { data, error } = await (pim() as any).from('product').select('design_id')
  const counts = new Map<string, number>()
  for (const row of unwrap<Array<{ design_id: string | null }>>({ data, error })) {
    if (row.design_id) counts.set(row.design_id, (counts.get(row.design_id) ?? 0) + 1)
  }
  return counts
}

export async function fetchProjectCountsByDesignCollection(): Promise<Map<string, number>> {
  const { data, error } = await (pim() as any).from('project').select('design_collection_id')
  const counts = new Map<string, number>()
  for (const row of unwrap<Array<{ design_collection_id: string | null }>>({ data, error })) {
    if (row.design_collection_id) counts.set(row.design_collection_id, (counts.get(row.design_collection_id) ?? 0) + 1)
  }
  return counts
}
