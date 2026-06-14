import { createItem, readItems } from '@directus/sdk'
import { directus } from '@/lib/directus'
import type { PmSavedView } from '@/lib/types'
import type { BusinessUnitFilter, Screen } from '@/lib/appState'

export interface SaveViewInput {
  userId: string
  roleId: string | null
  name: string
  screen: Screen
  businessUnit: BusinessUnitFilter
  filters: unknown
  sort?: unknown
  columns?: unknown
}

export async function fetchSavedViews(userId: string): Promise<PmSavedView[]> {
  return directus.request(
    readItems('pm_saved_view', {
      fields: ['id', 'name', 'screen', 'business_unit', 'filters_json', 'sort_json', 'columns_json', 'is_default', { role: ['id', 'name'] }, { shared_with_role: ['id', 'name'] }],
      filter: { user: { _eq: userId } } as never,
      sort: ['screen', 'name'],
      limit: -1,
    }),
  ) as Promise<PmSavedView[]>
}

export async function saveCurrentView(input: SaveViewInput): Promise<PmSavedView> {
  return directus.request(
    createItem('pm_saved_view', {
      user: input.userId,
      role: input.roleId,
      name: input.name,
      screen: input.screen,
      business_unit: input.businessUnit,
      filters_json: input.filters,
      sort_json: input.sort ?? {},
      columns_json: input.columns ?? {},
      is_default: false,
    } as never),
  ) as Promise<PmSavedView>
}
