import { core, pim, unwrap } from '@/lib/supabaseQuery'
import type { Buyer, Retailer } from '@/lib/types'

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
    (core() as any).from('company').select('id,name,customer_status,metadata').order('name'),
    (core() as any).from('contact_company').select('company_id,contact:contact_id(id,full_name,email)').order('company_id'),
    (pim() as any).from('project').select('company_id'),
    (pim() as any).from('customer_order').select('company_id'),
  ])
  const companies = unwrap<any[]>({ data: companyResult.data, error: companyResult.error })
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
    .map((company) => ({
      retailer: { id: company.id, name: company.name, customer_status: company.customer_status, resale_restriction: company.metadata?.resale_restriction ?? null, notes: company.metadata?.notes ?? null },
      buyers: buyersByCompany.get(company.id) ?? [],
      counts: { projects: projectCounts.get(company.id) ?? 0, orders: orderCounts.get(company.id) ?? 0 },
    }))
    .filter((row) => !q || row.retailer.name.toLowerCase().includes(q) || row.buyers.some((buyer) => buyer.name?.toLowerCase().includes(q) || buyer.email?.toLowerCase().includes(q)))
}
