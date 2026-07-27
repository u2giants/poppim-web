import { api, asDynamic } from '@/lib/supabaseQuery'
import type { BusinessUnit } from '@/domain/products/types'
import { unwrap } from '@/lib/supabaseQuery'

export interface PersonWorkload {
  id: string
  name: string
  email: string | null
  avatarUrl: string | null
  status: string | null
  assignments: number
  reminders: number
  revisions: number
}

interface WorkloadRow {
  id: string
  display_name: string
  email: string | null
  avatar_url: string | null
  status: string | null
  assignments: number
  reminders: number
  revisions: number
}

export async function fetchPeoplePage(search: string | undefined, businessUnit: BusinessUnit, cursor?: string | null): Promise<{ people:PersonWorkload[];nextCursor:string|null }> {
  const after=cursor ? JSON.parse(atob(cursor)) as {name:string;id:string} : null
  const { data, error } = await asDynamic(api()).rpc('pm_people_workload_page', {
    p_business_unit: businessUnit,
    p_search: search?.trim() || null,
    p_after_name: after?.name ?? null,
    p_after_id: after?.id ?? null,
    p_limit: 61,
  })
  const raw=unwrap<WorkloadRow[]>({ data, error })
  const visible=raw.slice(0,60)
  const people=visible.map((row) => ({
    id: row.id,
    name: row.display_name,
    email: row.email,
    avatarUrl: row.avatar_url,
    status: row.status,
    assignments: Number(row.assignments),
    reminders: Number(row.reminders),
    revisions: Number(row.revisions),
  }))
  const last=visible.at(-1)
  return {people,nextCursor:raw.length>60&&last?btoa(JSON.stringify({name:last.display_name,id:last.id})):null}
}
export async function fetchPeopleWorkload(search:string|undefined,businessUnit:BusinessUnit):Promise<PersonWorkload[]> {
  return (await fetchPeoplePage(search,businessUnit)).people
}
