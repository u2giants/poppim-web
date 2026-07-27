import { api, asDynamic } from '@/lib/supabaseQuery'
import type { BusinessUnit } from '@/domain/products/types'
import { unwrap } from '@/lib/supabaseQuery'
import type { Buyer, Retailer } from '@/lib/types'

export interface AccountCounts { projects: number; orders: number }
export interface AccountRow { retailer: Retailer; buyers: Buyer[]; counts: AccountCounts }
export interface AccountPage { rows: AccountRow[]; nextCursor: string | null }

interface AccountRpcRow {
  id: string
  name: string
  core_status: string
  project_count: number
  order_count: number
  buyers: Array<{ id: string; name: string | null; email: string | null }>
}

export async function fetchAccountPage(search: string | undefined, businessUnit: BusinessUnit, cursor?: string | null): Promise<AccountPage> {
  const after = cursor ? JSON.parse(atob(cursor)) as { name:string;id:string } : null
  const { data, error } = await asDynamic(api()).rpc('pm_account_page', {
    p_business_unit: businessUnit,
    p_search: search?.trim() || null,
    p_after_name: after?.name ?? null,
    p_after_id: after?.id ?? null,
    p_limit: 51,
  })
  const raw = unwrap<AccountRpcRow[]>({ data, error })
  const visible = raw.slice(0,50)
  const rows = visible.map((row):AccountRow => ({
    retailer: {
      id: row.id,
      name: row.name,
      customer_status: row.core_status === 'potential' ? 'POTENTIAL_CUSTOMER' : 'ACTIVE_CUSTOMER',
      is_potential: row.core_status === 'potential',
    },
    buyers: row.buyers.map((buyer) => ({ ...buyer, retailer: row.id })),
    counts: { projects: Number(row.project_count), orders: Number(row.order_count) },
  }))
  const last = visible.at(-1)
  return { rows, nextCursor: raw.length > 50 && last ? btoa(JSON.stringify({ name:last.name,id:last.id })) : null }
}

export async function fetchAccountRows(search: string | undefined, businessUnit: BusinessUnit): Promise<AccountRow[]> {
  return (await fetchAccountPage(search,businessUnit)).rows
}
