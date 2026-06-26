import { appSchema, unwrap } from '@/lib/supabaseQuery'

export interface NoteItem {
  id: string
  kind: 'comment' | 'activity'
  body: string
  target: string
  createdAt: string
  author: string | null
}

function profileName(profile: any): string | null {
  return profile?.display_name ?? profile?.email ?? null
}

export async function fetchNotes(search?: string): Promise<NoteItem[]> {
  const q = search?.trim().toLowerCase()
  const [commentResult, activityResult] = await Promise.all([
    (appSchema() as any)
      .from('comment')
      .select('id,body,created_at,target_schema,target_table,target_id,profile:created_by_profile_id(display_name,email)')
      .order('created_at', { ascending: false })
      .limit(250),
    (appSchema() as any)
      .from('activity')
      .select('id,summary,action,created_at,target_schema,target_table,target_id,profile:actor_profile_id(display_name,email)')
      .order('created_at', { ascending: false })
      .limit(250),
  ])

  const comments = unwrap<any[]>({ data: commentResult.data, error: commentResult.error }).map((row) => ({
    id: row.id,
    kind: 'comment' as const,
    body: row.body,
    target: [row.target_schema, row.target_table, row.target_id].filter(Boolean).join(' / '),
    createdAt: row.created_at,
    author: profileName(row.profile),
  }))
  const activities = unwrap<any[]>({ data: activityResult.data, error: activityResult.error }).map((row) => ({
    id: row.id,
    kind: 'activity' as const,
    body: row.summary ?? row.action,
    target: [row.target_schema, row.target_table, row.target_id].filter(Boolean).join(' / '),
    createdAt: row.created_at,
    author: profileName(row.profile),
  }))

  return [...comments, ...activities]
    .filter((item) => !q || [item.body, item.target, item.author, item.kind].filter(Boolean).join(' ').toLowerCase().includes(q))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}
