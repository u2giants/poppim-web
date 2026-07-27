import { api, metadata, pim, unwrap } from '@/lib/supabaseQuery'
import type { Database } from '@/lib/database.types'
import type { PmSavedView, PmViewPref, ViewFilters } from '@/lib/types'
import type { BusinessUnitFilter, Screen } from '@/lib/appState'
import { saveCurrentView } from '@/features/settings/api'
const VIEW_SCOPE = /^view:([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i

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

export async function fetchViews(userId: string): Promise<PmSavedView[]> {
  const { data, error } = await pim().from('saved_view').select('*').or(`owner_profile_id.eq.${userId},scope.eq.shared`).order('name')
  return unwrap<SavedViewRow[]>({ data, error }).map(savedView)
}

export async function fetchViewPrefs(userId: string): Promise<PmViewPref[]> {
  const { data, error } = await pim().from('view_pref').select('*').eq('profile_id', userId)
  return unwrap<Database['pim']['Tables']['view_pref']['Row'][]>({ data, error }).flatMap((row) => {
    const config = metadata({ metadata: row.config })
    const match = typeof row.scope === 'string' ? VIEW_SCOPE.exec(row.scope) : null
    if (!match) {
      console.warn('Ignoring invalid saved-view preference scope', { preferenceId: row.id })
      return []
    }
    return [{
    id: row.id,
    user: row.profile_id,
    view: match[1],
    sort_order: config.sort_order ?? null,
    color: config.color ?? null,
    hidden: config.hidden ?? false,
    }]
  }) as PmViewPref[]
}

export interface CreateViewInput {
  userId: string
  name: string
  businessUnit: BusinessUnitFilter
  filters: ViewFilters
  visibility: 'personal' | 'shared'
  canCreateShared?: boolean
  screen?: Screen
}

export async function createView(input: CreateViewInput): Promise<PmSavedView> {
  if (input.visibility === 'shared' && !input.canCreateShared) {
    throw new Error('Only administrators can create a shared view.')
  }
  return saveCurrentView({
    userId: input.userId,
    roleId: null,
    name: input.name,
    screen: input.screen ?? 'pipeline',
    businessUnit: input.businessUnit,
    filters: input.filters,
    sort: {},
    visibility: input.visibility,
    columns: { origin: 'user' },
  })
}

export async function renameView(id: string, name: string) {
  const { error } = await pim().from('saved_view').update({ name }).eq('id', id)
  if (error) throw new Error(error.message)
}

export async function deleteView(id: string) {
  const { error } = await pim().from('saved_view').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

export async function upsertViewPref(userId: string, viewId: string, patch: { sort_order?: number; color?: string | null; hidden?: boolean }): Promise<PmViewPref> {
  void userId
  const scope = `view:${viewId}`
  const { data, error } = await api().rpc('pm_upsert_view_pref', { p_scope: scope, p_patch: patch })
  if (error) throw new Error(error.message)
  const row = data?.[0]
  if (!row) throw new Error('The saved-view preference was not returned after saving.')
  const config = row.config && typeof row.config === 'object' && !Array.isArray(row.config) ? row.config : {}
  return {
    id: row.id,
    user: row.profile_id,
    view: viewId,
    sort_order: typeof config.sort_order === 'number' ? config.sort_order : null,
    color: typeof config.color === 'string' ? config.color : null,
    hidden: config.hidden === true,
  } as PmViewPref
}
