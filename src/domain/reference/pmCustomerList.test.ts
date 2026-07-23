import { describe, expect, it } from 'vitest'
import {
  mapPmCustomerListRow,
  PM_CUSTOMER_LIST,
  PM_CUSTOMER_LIST_SELECT,
} from './pmCustomerList'

describe('pmCustomerList', () => {
  it('uses the sanctioned serving relation name', () => {
    expect(PM_CUSTOMER_LIST).toBe('pm_customer_list')
    expect(PM_CUSTOMER_LIST).not.toBe('customer_list')
    expect(PM_CUSTOMER_LIST_SELECT).toContain('display_name')
    expect(PM_CUSTOMER_LIST_SELECT).toContain('core_status')
  })

  it('prefers display_name for the picker label', () => {
    const row = mapPmCustomerListRow({
      id: '11111111-1111-1111-1111-111111111111',
      name: 'Legal Name Corp',
      display_name: 'Target',
      core_status: 'active',
      pm_status: 'active',
    })
    expect(row.id).toBe('11111111-1111-1111-1111-111111111111')
    expect(row.name).toBe('Target')
    expect(row.is_potential).toBe(false)
    expect(row.customer_status).toBe('ACTIVE_CUSTOMER')
  })

  it('falls back to name and maps potential status', () => {
    const row = mapPmCustomerListRow({
      id: '22222222-2222-2222-2222-222222222222',
      name: 'Prospect LLC',
      display_name: null,
      core_status: 'potential',
      pm_status: 'active',
    })
    expect(row.name).toBe('Prospect LLC')
    expect(row.is_potential).toBe(true)
    expect(row.customer_status).toBe('POTENTIAL_CUSTOMER')
  })
})
