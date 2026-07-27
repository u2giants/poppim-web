import { metadata, pim, unwrap } from '@/lib/supabaseQuery'
import type { PmSavedView } from '@/lib/types'
import type { BusinessUnitFilter, Screen } from '@/lib/appState'
import type { Database, Json } from '@/lib/database.types'

export interface SaveViewInput {
  userId: string
  roleId: string | null
  name: string
  screen: Screen
  businessUnit: BusinessUnitFilter
  filters: unknown
  sort?: unknown
  columns?: unknown
  visibility?: 'personal' | 'shared'
}

function json(value: unknown): Json {
  return (value ?? {}) as Json
}

type SavedViewRow = Database['pim']['Tables']['saved_view']['Row']
function savedView(row: SavedViewRow): PmSavedView {
  const config = metadata({ metadata: row.config })
  return {
    id: row.id,
    user: row.owner_profile_id,
    role: row.role_id,
    name: row.name,
    screen: config.screen ?? 'pipeline',
    business_unit: config.business_unit ?? 'Licensed',
    filters_json: config.filters ?? {},
    sort_json: config.sort ?? {},
    columns_json: config.columns ?? {},
    is_default: row.is_default,
    visibility: row.scope === 'shared' ? 'shared' : 'personal',
    origin: config.origin ?? 'user',
    color: config.color ?? null,
    sort_order: config.sort_order ?? null,
  } as PmSavedView
}

export async function fetchSavedViews(userId: string): Promise<PmSavedView[]> {
  const { data, error } = await pim().from('saved_view').select('*').eq('owner_profile_id', userId).order('name')
  return unwrap<SavedViewRow[]>({ data, error }).map(savedView)
}

export async function saveCurrentView(input: SaveViewInput): Promise<PmSavedView> {
  const { data, error } = await pim()
    .from('saved_view')
    .insert({
      owner_profile_id: input.userId,
      role_id: input.roleId,
      name: input.name,
      scope: input.visibility ?? 'personal',
      is_default: false,
      config: { screen: input.screen, business_unit: input.businessUnit, filters: json(input.filters), sort: json(input.sort), columns: json(input.columns) },
    })
    .select('*')
    .single()
  return savedView(unwrap<SavedViewRow>({ data, error }))
}
