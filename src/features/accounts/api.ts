import { api, core, pim, unwrap } from '@/lib/supabaseQuery'
import type { Buyer, Retailer } from '@/lib/types'
import {
  mapPmCustomerListRow,
  PM_CUSTOMER_LIST,
  PM_CUSTOMER_LIST_SELECT,
  type PmCustomerListRow,
} from '@/domain/reference/pmCustomerList'

export interface AccountCounts {
  projects: number
  orders: number
}

export interface AccountRow {
  retailer: Retailer
  buyers: Buyer[]
  counts: AccountCounts
}

export async function fetchAccountRows(search?: string): Promise<AccountRow[]> {
  const q = search?.trim().toLowerCase()
  const [companyResult, contactResult, projectResult, orderResult] = await Promise.all([
    (api() as any).from(PM_CUSTOMER_LIST).select(PM_CUSTOMER_LIST_SELECT).order('name'),
    (core() as any).from('contact_company').select('company_id,contact:contact_id(id,full_name,email)').order('company_id'),
    pim().from('project').select('company_id'),
    pim().from('customer_order').select('company_id'),
  ])
  const companies = unwrap<PmCustomerListRow[]>({ data: companyResult.data, error: companyResult.error }).map(mapPmCustomerListRow)
  const contacts = unwrap<any[]>({ data: contactResult.data, error: contactResult.error })
  const projects = unwrap<Array<{ company_id: string | null }>>({ data: projectResult.data, error: projectResult.error })
  const orders = unwrap<Array<{ company_id: string | null }>>({ data: orderResult.data, error: orderResult.error })

  const buyersByCompany = new Map<string, Buyer[]>()
  for (const row of contacts) {
    if (!row.company_id || !row.contact) continue
    ;(buyersByCompany.get(row.company_id) ?? buyersByCompany.set(row.company_id, []).get(row.company_id)!).push({
      id: row.contact.id,
      name: row.contact.full_name ?? row.contact.email,
      email: row.contact.email,
      retailer: row.company_id,
    })
  }
  const projectCounts = new Map<string, number>()
  const orderCounts = new Map<string, number>()
  for (const row of projects) if (row.company_id) projectCounts.set(row.company_id, (projectCounts.get(row.company_id) ?? 0) + 1)
  for (const row of orders) if (row.company_id) orderCounts.set(row.company_id, (orderCounts.get(row.company_id) ?? 0) + 1)

  return companies
    .map((retailer: Retailer) => ({
      retailer,
      buyers: buyersByCompany.get(retailer.id) ?? [],
      counts: { projects: projectCounts.get(retailer.id) ?? 0, orders: orderCounts.get(retailer.id) ?? 0 },
    }))
    .filter((row) => !q || row.retailer.name.toLowerCase().includes(q) || row.buyers.some((buyer) => buyer.name?.toLowerCase().includes(q) || buyer.email?.toLowerCase().includes(q)))
}
