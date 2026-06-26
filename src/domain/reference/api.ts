import { api, core, pim, unwrap } from '@/lib/supabaseQuery'
import type { Licensor, Retailer, Stage } from '@/lib/types'

export async function fetchLicensors(): Promise<Licensor[]> {
  const { data, error } = await (core() as any).from('licensor').select('id,name').order('name')
  return unwrap<Array<Licensor>>({ data, error })
}

export async function fetchRetailers(): Promise<Retailer[]> {
  const { data, error } = await (api() as any).from('customer_list').select('id,name,customer_status,is_potential').order('name')
  return unwrap<Array<Retailer>>({ data, error })
}

export async function fetchStages(): Promise<Stage[]> {
  const { data, error } = await pim().from('stage').select('id,name,sort_order,pipeline,metadata').order('sort_order')
  const rows = unwrap<Array<{ id: string; name: string; sort_order: number | null; pipeline: string | null; metadata?: unknown }>>({ data, error })
  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    stage_order: row.sort_order,
    category: null,
    business_unit: row.pipeline,
  }))
}
