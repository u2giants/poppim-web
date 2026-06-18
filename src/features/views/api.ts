import { createItem, readItems, updateItem, deleteItem } from '@directus/sdk'
import { directus } from '@/lib/directus'
import type { PmSavedView, PmViewPref, ViewFilters } from '@/lib/types'
import type { BusinessUnitFilter, Screen } from '@/lib/appState'

const VIEW_FIELDS = ['id', 'name', 'screen', 'business_unit', 'filters_json', 'visibility', 'origin', 'color', 'sort_order', { user: ['id'] }] as const

// Views the user can see: their own + any shared view. Row-level scoping is done
// here (the Directus policy is wildcard, matching how pm_saved_view already works).
export async function fetchViews(userId: string): Promise<PmSavedView[]> {
  return directus.request(
    readItems('pm_saved_view', {
      fields: VIEW_FIELDS as never,
      filter: { _and: [{ screen: { _eq: 'pipeline' } }, { _or: [{ user: { _eq: userId } }, { visibility: { _eq: 'shared' } }] }] } as never,
      sort: ['sort_order', 'name'],
      limit: -1,
    }),
  ) as unknown as Promise<PmSavedView[]>
}

export async function fetchViewPrefs(userId: string): Promise<PmViewPref[]> {
  return directus.request(
    readItems('pm_view_pref', {
      fields: ['id', 'sort_order', 'color', 'hidden', { view: ['id'] }] as never,
      filter: { user: { _eq: userId } } as never,
      limit: -1,
    }),
  ) as unknown as Promise<PmViewPref[]>
}

export interface CreateViewInput {
  userId: string
  name: string
  businessUnit: BusinessUnitFilter
  filters: ViewFilters
  visibility: 'personal' | 'shared'
  screen?: Screen
}

export async function createView(input: CreateViewInput): Promise<PmSavedView> {
  return directus.request(
    createItem('pm_saved_view', {
      user: input.userId,
      name: input.name,
      screen: input.screen ?? 'pipeline',
      business_unit: input.businessUnit,
      filters_json: input.filters,
      visibility: input.visibility,
      origin: 'user',
      is_default: false,
    } as never),
  ) as unknown as Promise<PmSavedView>
}

export async function renameView(id: string, name: string) {
  return directus.request(updateItem('pm_saved_view', id, { name } as never))
}

export async function deleteView(id: string) {
  return directus.request(deleteItem('pm_saved_view', id))
}

// Per-user override (order/color/hidden) for any view, incl. shared/seeded ones.
// Read-then-upsert since there is no composite unique constraint at the DB layer.
export async function upsertViewPref(
  userId: string,
  viewId: string,
  patch: { sort_order?: number; color?: string | null; hidden?: boolean },
): Promise<void> {
  const existing = (await directus.request(
    readItems('pm_view_pref', {
      fields: ['id'] as never,
      filter: { _and: [{ user: { _eq: userId } }, { view: { _eq: viewId } }] } as never,
      limit: 1,
    }),
  )) as unknown as Array<{ id: string }>
  if (existing[0]) {
    await directus.request(updateItem('pm_view_pref', existing[0].id, patch as never))
  } else {
    await directus.request(createItem('pm_view_pref', { user: userId, view: viewId, ...patch } as never))
  }
}
