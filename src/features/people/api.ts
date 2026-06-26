import { appSchema, pim, unwrap } from '@/lib/supabaseQuery'

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

function displayName(row: any) {
  return row.display_name ?? row.email ?? 'Unnamed person'
}

export async function fetchPeopleWorkload(search?: string): Promise<PersonWorkload[]> {
  const q = search?.trim().toLowerCase()
  const [profileResult, assignmentResult, notificationResult, revisionResult] = await Promise.all([
    (appSchema() as any).from('profile').select('id,display_name,email,avatar_url,status').order('display_name'),
    pim().from('product_assignee').select('profile_id'),
    (appSchema() as any).from('notification').select('profile_id,read_at').eq('app', 'pm'),
    pim().from('revision_request').select('metadata,status'),
  ])

  const assignmentCounts = new Map<string, number>()
  for (const row of unwrap<Array<{ profile_id: string | null }>>({ data: assignmentResult.data, error: assignmentResult.error })) {
    if (row.profile_id) assignmentCounts.set(row.profile_id, (assignmentCounts.get(row.profile_id) ?? 0) + 1)
  }

  const reminderCounts = new Map<string, number>()
  for (const row of unwrap<Array<{ profile_id: string | null; read_at: string | null }>>({ data: notificationResult.data, error: notificationResult.error })) {
    if (row.profile_id && !row.read_at) reminderCounts.set(row.profile_id, (reminderCounts.get(row.profile_id) ?? 0) + 1)
  }

  const revisionCounts = new Map<string, number>()
  for (const row of unwrap<any[]>({ data: revisionResult.data, error: revisionResult.error })) {
    const assignedTo = row.metadata && typeof row.metadata === 'object' && !Array.isArray(row.metadata) ? row.metadata.assigned_to : null
    if (typeof assignedTo === 'string' && !['resolved', 'accepted', 'rejected', 'canceled'].includes(row.status ?? '')) {
      revisionCounts.set(assignedTo, (revisionCounts.get(assignedTo) ?? 0) + 1)
    }
  }

  return unwrap<any[]>({ data: profileResult.data, error: profileResult.error })
    .map((row) => ({
      id: row.id,
      name: displayName(row),
      email: row.email,
      avatarUrl: row.avatar_url,
      status: row.status,
      assignments: assignmentCounts.get(row.id) ?? 0,
      reminders: reminderCounts.get(row.id) ?? 0,
      revisions: revisionCounts.get(row.id) ?? 0,
    }))
    .filter((person) => !q || [person.name, person.email, person.status].filter(Boolean).join(' ').toLowerCase().includes(q))
}
