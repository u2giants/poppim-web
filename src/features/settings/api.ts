import { pim, unwrap } from '@/lib/supabaseQuery'
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

function savedView(row: any): PmSavedView {
  return {
    id: row.id,
    user: row.owner_profile_id,
    role: row.role_id,
    name: row.name,
    screen: row.config?.screen ?? 'pipeline',
    business_unit: row.config?.business_unit ?? 'Licensed',
    filters_json: row.config?.filters ?? {},
    sort_json: row.config?.sort ?? {},
    columns_json: row.config?.columns ?? {},
    is_default: row.is_default,
    visibility: row.scope === 'shared' ? 'shared' : 'personal',
    origin: row.config?.origin ?? 'user',
    color: row.config?.color ?? null,
    sort_order: row.config?.sort_order ?? null,
  } as PmSavedView
}

export async function fetchSavedViews(userId: string): Promise<PmSavedView[]> {
  const { data, error } = await (pim() as any).from('saved_view').select('*').eq('owner_profile_id', userId).order('name')
  return unwrap<any[]>({ data, error }).map(savedView)
}

export async function saveCurrentView(input: SaveViewInput): Promise<PmSavedView> {
  const { data, error } = await (pim() as any)
    .from('saved_view')
    .insert({
      owner_profile_id: input.userId,
      role_id: input.roleId,
      name: input.name,
      scope: 'personal',
      is_default: false,
      config: { screen: input.screen, business_unit: input.businessUnit, filters: input.filters, sort: input.sort ?? {}, columns: input.columns ?? {} },
    })
    .select('*')
    .single()
  return savedView(unwrap<any>({ data, error }))
}
