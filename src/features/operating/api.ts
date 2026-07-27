import { api, asDynamic } from '@/lib/supabaseQuery'
import { dynamicApp } from '@/lib/supabaseQuery'
import { pim, unwrap } from '@/lib/supabaseQuery'
import type { PmDecision, PmDependency, PmReminder, PmWorkflowTemplate } from '@/lib/types'
import { metadata } from '@/lib/supabaseQuery'
import type { Database } from '@/lib/database.types'

interface ActivityDbRow {
  id: string
  target_id: string
  actor_profile_id: string | null
  created_at: string
  payload?: Record<string, unknown> | null
}
interface NotificationDbRow {
  id: string
  target_id: string
  profile_id: string
  title: string
  body: string | null
  read_at: string | null
  payload?: Record<string, unknown> | null
}
type SavedViewRow = Database['pim']['Tables']['saved_view']['Row']

function payloadText(payload: Record<string, unknown> | null | undefined, key: string): string | null {
  const value = payload?.[key]
  return typeof value === 'string' ? value : null
}
function oneOf<T extends string>(value: string | null, allowed: readonly T[], fallback: T): T {
  return value !== null && allowed.includes(value as T) ? value as T : fallback
}

function opPayload(kind: string, productId: string, extra: Record<string, unknown>) {
  return { kind, product_id: productId, ...extra }
}

async function currentProfileId() {
  const { data, error } = await asDynamic(api()).rpc('current_user_profile')
  const profileId = data && typeof data === 'object' && !Array.isArray(data) && 'id' in data && typeof data.id === 'string' ? data.id : null
  if (error || !profileId) throw new Error(error?.message ?? 'No Supabase profile is available for this session.')
  return profileId
}

export async function listDependencies(productId: string): Promise<PmDependency[]> {
  const { data, error } = await dynamicApp().from('activity').select('*').eq('target_schema', 'pim').eq('target_table', 'product').eq('target_id', productId).eq('action', 'pm_dependency').order('created_at')
  return unwrap<ActivityDbRow[]>({ data, error }).map((row) => ({ id: row.id, product: productId, depends_on_product: payloadText(row.payload, 'depends_on_product'), project: null, title: payloadText(row.payload, 'title'), dependency_type: oneOf(payloadText(row.payload, 'dependency_type'), ['blocked_by','blocks','related','duplicate','parent_child'] as const, 'blocked_by'), status: oneOf(payloadText(row.payload, 'status'), ['open','waiting','resolved','canceled'] as const, 'open'), waiting_on: payloadText(row.payload, 'waiting_on'), due_at: payloadText(row.payload, 'due_at'), resolved_at: payloadText(row.payload, 'resolved_at'), notes: payloadText(row.payload, 'notes'), source_system: 'supabase', source_id: row.id }))
}

export async function createDependency(productId: string, title: string): Promise<PmDependency> {
  const { data, error } = await dynamicApp().from('activity').insert({ target_schema: 'pim', target_table: 'product', target_id: productId, action: 'pm_dependency', summary: title, payload: opPayload('dependency', productId, { title, dependency_type: 'blocked_by', status: 'open' }) }).select('*').single()
  const row = unwrap<ActivityDbRow>({ data, error })
  return { id: row.id, product: productId, depends_on_product: null, project: null, title, dependency_type: 'blocked_by', status: 'open', waiting_on: null, due_at: null, resolved_at: null, notes: null, source_system: 'supabase', source_id: row.id }
}

export async function updateDependencyStatus(id: string, status: PmDependency['status']): Promise<PmDependency> {
  const { data, error } = await dynamicApp().from('activity').select('*').eq('id', id).single()
  const row = unwrap<ActivityDbRow>({ data, error })
  const payload: Record<string, unknown> = { ...(row.payload ?? {}), status, resolved_at: status === 'resolved' ? new Date().toISOString() : null }
  const result = await dynamicApp().from('activity').update({ payload }).eq('id', id).select('*').single()
  const updated = unwrap<ActivityDbRow>({ data: result.data, error: result.error })
  return { id, product: updated.target_id, depends_on_product: null, project: null, title: payloadText(payload, 'title'), dependency_type: oneOf(payloadText(payload, 'dependency_type'), ['blocked_by','blocks','related','duplicate','parent_child'] as const, 'blocked_by'), status, waiting_on: payloadText(payload, 'waiting_on'), due_at: payloadText(payload, 'due_at'), resolved_at: payloadText(payload, 'resolved_at'), notes: payloadText(payload, 'notes'), source_system: 'supabase', source_id: id }
}

export async function listDecisions(productId: string): Promise<PmDecision[]> {
  const { data, error } = await dynamicApp().from('activity').select('*').eq('target_schema', 'pim').eq('target_table', 'product').eq('target_id', productId).eq('action', 'pm_decision').order('created_at', { ascending: false })
  return unwrap<ActivityDbRow[]>({ data, error }).map((row) => ({ id: row.id, product: productId, project: null, object_collection: 'product', object_id: productId, decision_type: payloadText(row.payload, 'decision_type'), status: oneOf(payloadText(row.payload, 'status'), ['proposed','decided','superseded','canceled'] as const, 'decided'), decided_by: row.actor_profile_id, decided_at: row.created_at, reason: payloadText(row.payload, 'reason'), notes: payloadText(row.payload, 'notes'), evidence_url: payloadText(row.payload, 'evidence_url'), source_system: 'supabase', source_id: row.id }))
}

export async function createDecision(productId: string, decisionType: string, notes?: string): Promise<PmDecision> {
  const { data, error } = await dynamicApp().from('activity').insert({ target_schema: 'pim', target_table: 'product', target_id: productId, action: 'pm_decision', summary: decisionType || 'custom', payload: opPayload('decision', productId, { decision_type: decisionType || 'custom', status: 'decided', notes: notes ?? null }) }).select('*').single()
  const row = unwrap<ActivityDbRow>({ data, error })
  return { id: row.id, product: productId, project: null, object_collection: 'product', object_id: productId, decision_type: decisionType || 'custom', status: 'decided', decided_by: row.actor_profile_id, decided_at: row.created_at, reason: null, notes: notes ?? null, evidence_url: null, source_system: 'supabase', source_id: row.id }
}

export async function listReminders(productId: string): Promise<PmReminder[]> {
  const { data, error } = await dynamicApp().from('notification').select('*').eq('target_schema', 'pim').eq('target_table', 'product').eq('target_id', productId).order('created_at')
  return unwrap<NotificationDbRow[]>({ data, error }).map((row) => ({ id: row.id, product: productId, project: null, object_collection: 'product', object_id: productId, title: row.title, due_at: payloadText(row.payload, 'due_at'), assigned_to: row.profile_id, status: row.read_at ? 'done' : oneOf(payloadText(row.payload, 'status'), ['open','snoozed','done','canceled'] as const, 'open'), reminder_type: payloadText(row.payload, 'reminder_type') ?? 'follow_up', snoozed_until: payloadText(row.payload, 'snoozed_until'), completed_at: row.read_at, notes: row.body }))
}

export async function createReminder(productId: string, title: string, dueAt?: string | null): Promise<PmReminder> {
  const profileId = await currentProfileId()
  const { data, error } = await dynamicApp().from('notification').insert({ app: 'pm', profile_id: profileId, target_schema: 'pim', target_table: 'product', target_id: productId, title, body: null, payload: opPayload('reminder', productId, { due_at: dueAt ?? null, status: 'open', reminder_type: 'follow_up' }) }).select('*').single()
  const row = unwrap<NotificationDbRow>({ data, error })
  return { id: row.id, product: productId, project: null, object_collection: 'product', object_id: productId, title, due_at: dueAt ?? null, assigned_to: row.profile_id, status: 'open', reminder_type: 'follow_up', snoozed_until: null, completed_at: null, notes: null }
}

export async function updateReminderStatus(id: string, status: PmReminder['status']): Promise<PmReminder> {
  const existing = await dynamicApp().from('notification').select('payload').eq('id', id).single()
  const existingRow = unwrap<{ payload?: unknown }>({ data: existing.data, error: existing.error })
  const existingPayload = existingRow.payload && typeof existingRow.payload === 'object' && !Array.isArray(existingRow.payload)
    ? existingRow.payload as Record<string, unknown>
    : {}
  const payload = { ...existingPayload, status }
  const patch = status === 'done' ? { read_at: new Date().toISOString(), payload } : { payload }
  const { data, error } = await dynamicApp().from('notification').update(patch).eq('id', id).select('*').single()
  const row = unwrap<NotificationDbRow>({ data, error })
  return { id: row.id, product: row.target_id, project: null, object_collection: 'product', object_id: row.target_id, title: row.title, due_at: payloadText(row.payload, 'due_at'), assigned_to: row.profile_id, status, reminder_type: payloadText(row.payload, 'reminder_type') ?? 'follow_up', snoozed_until: payloadText(row.payload, 'snoozed_until'), completed_at: row.read_at, notes: row.body }
}

export async function fetchWorkflowTemplates(): Promise<PmWorkflowTemplate[]> {
  const { data, error } = await pim().from('saved_view').select('*').eq('scope', 'workflow_template').order('name')
  return unwrap<SavedViewRow[]>({ data, error }).map((row) => {
    const config = metadata({ metadata: row.config })
    return { id: row.id, name: row.name, business_unit: payloadText(config, 'business_unit'), object_type: oneOf(payloadText(config, 'object_type'), ['product','project','submission','sample','revision'] as const, 'product'), template_type: oneOf(payloadText(config, 'template_type'), ['checklist','stage_gate','project','submission','sample'] as const, 'checklist'), active: typeof config.active === 'boolean' ? config.active : true, description: payloadText(config, 'description'), checklist_json: Array.isArray(config.checklist_json) ? config.checklist_json : [], required_evidence_json: Array.isArray(config.required_evidence_json) ? config.required_evidence_json : [], default_next_action: payloadText(config, 'default_next_action'), default_owner_role: null }
  })
}

export async function createWorkflowTemplate(input: { name: string; businessUnit: string; objectType?: string; templateType?: string; description?: string | null }): Promise<PmWorkflowTemplate> {
  const config = { business_unit: input.businessUnit, object_type: input.objectType ?? 'product', template_type: input.templateType ?? 'checklist', active: true, description: input.description ?? null, checklist_json: [], required_evidence_json: [] }
  const { data, error } = await pim().from('saved_view').insert({ name: input.name, scope: 'workflow_template', config, is_default: false }).select('*').single()
  const row = unwrap<SavedViewRow>({ data, error })
  return { id: row.id, name: row.name, business_unit: input.businessUnit, object_type: config.object_type as never, template_type: config.template_type as never, active: true, description: input.description ?? null, checklist_json: [], required_evidence_json: [], default_next_action: null, default_owner_role: null }
}
