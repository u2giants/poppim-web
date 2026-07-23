import type { CustomerStatus, Retailer } from '@/lib/types'

/** Sanctioned PostgREST relation for PM/PIM Customer pickers and lists. */
export const PM_CUSTOMER_LIST = 'pm_customer_list' as const

export type PmCustomerListRow = {
  id: string
  name: string | null
  display_name?: string | null
  core_status?: string | null
  pm_status?: string | null
}

/**
 * Map api.pm_customer_list rows into the app Retailer shape.
 * Prefers curated display_name for labels; derives legacy status fields only
 * for older UI that still peeks at them (the view already filters inactive).
 */
export function mapPmCustomerListRow(row: PmCustomerListRow): Retailer {
  const core = (row.core_status ?? 'active').toLowerCase()
  const isPotential = core === 'potential'
  const customer_status: CustomerStatus = isPotential ? 'POTENTIAL_CUSTOMER' : 'ACTIVE_CUSTOMER'
  const label = (row.display_name?.trim() || row.name?.trim() || row.id) as string
  return {
    id: row.id,
    name: label,
    customer_status,
    is_potential: isPotential,
  }
}

export const PM_CUSTOMER_LIST_SELECT =
  'id,name,display_name,core_status,pm_status' as const
