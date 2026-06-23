import { pim, unwrap } from '@/lib/supabaseQuery'
import type { PmSavedView, PmViewPref, ViewFilters } from '@/lib/types'
import type { BusinessUnitFilter, Screen } from '@/lib/appState'
import { saveCurrentView } from '@/features/settings/api'

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

export async function fetchViews(userId: string): Promise<PmSavedView[]> {
  const { data, error } = await (pim() as any).from('saved_view').select('*').or(`owner_profile_id.eq.${userId},scope.eq.shared`).order('name')
  return unwrap<any[]>({ data, error }).map(savedView)
}

export async function fetchViewPrefs(userId: string): Promise<PmViewPref[]> {
  const { data, error } = await (pim() as any).from('view_pref').select('*').eq('profile_id', userId)
  return unwrap<any[]>({ data, error }).map((row) => ({
    id: row.id,
    user: row.profile_id,
    view: row.scope,
    sort_order: row.config?.sort_order ?? null,
    color: row.config?.color ?? null,
    hidden: row.config?.hidden ?? false,
  })) as PmViewPref[]
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
  return saveCurrentView({
    userId: input.userId,
    roleId: null,
    name: input.name,
    screen: input.screen ?? 'pipeline',
    businessUnit: input.businessUnit,
    filters: input.filters,
    sort: {},
    columns: { visibility: input.visibility, origin: 'user' },
  })
}

export async function renameView(id: string, name: string) {
  const { error } = await (pim() as any).from('saved_view').update({ name }).eq('id', id)
  if (error) throw new Error(error.message)
}

export async function deleteView(id: string) {
  const { error } = await (pim() as any).from('saved_view').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

export async function upsertViewPref(userId: string, viewId: string, patch: { sort_order?: number; color?: string | null; hidden?: boolean }): Promise<void> {
  const scope = `view:${viewId}`
  const { data, error } = await (pim() as any).from('view_pref').select('id,config').eq('profile_id', userId).eq('scope', scope).maybeSingle()
  if (error) throw new Error(error.message)
  const config = { ...(data?.config ?? {}), ...patch }
  const result = data?.id
    ? await (pim() as any).from('view_pref').update({ config }).eq('id', data.id)
    : await (pim() as any).from('view_pref').insert({ profile_id: userId, scope, config })
  if (result.error) throw new Error(result.error.message)
}
