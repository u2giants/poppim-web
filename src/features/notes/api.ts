import { api, asDynamic } from '@/lib/supabaseQuery'
import type { BusinessUnit } from '@/domain/products/types'
import { unwrap } from '@/lib/supabaseQuery'

export interface NoteItem {
  id: string
  kind: 'comment' | 'activity'
  body: string
  target: string
  createdAt: string
  author: string | null
}

interface NoteRpcRow {
  id: string
  kind: 'comment' | 'activity'
  body: string
  target: string
  created_at: string
  author: string | null
}

export async function fetchNotesPage(search: string | undefined, businessUnit: BusinessUnit, cursor?: string|null): Promise<{notes:NoteItem[];nextCursor:string|null}> {
  const after=cursor?JSON.parse(atob(cursor)) as {createdAt:string;id:string;kind:string}:null
  const { data, error } = await asDynamic(api()).rpc('pm_notes_page', {
    p_business_unit: businessUnit,
    p_search: search?.trim() || null,
    p_since: new Date(Date.now() - 30 * 86_400_000).toISOString(),
    p_before_created_at: after?.createdAt??null,
    p_before_id: after?.id??null,
    p_before_kind: after?.kind??null,
    p_limit: 101,
  })
  const raw=unwrap<NoteRpcRow[]>({data,error})
  const visible=raw.slice(0,100)
  const notes=visible.map((row) => ({
    id: row.id,
    kind: row.kind,
    body: row.body,
    target: row.target,
    createdAt: row.created_at,
    author: row.author,
  }))
  const last=visible.at(-1)
  return {notes,nextCursor:raw.length>100&&last?btoa(JSON.stringify({createdAt:last.created_at,id:last.id,kind:last.kind})):null}
}
export async function fetchNotes(search:string|undefined,businessUnit:BusinessUnit):Promise<NoteItem[]> {
  return (await fetchNotesPage(search,businessUnit)).notes
}
