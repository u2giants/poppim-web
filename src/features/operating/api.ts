import { api, appSchema, pim, unwrap } from '@/lib/supabaseQuery'
import type { PmDecision, PmDependency, PmReminder, PmWorkflowTemplate } from '@/lib/types'

function opPayload(kind: string, productId: string, extra: Record<string, unknown>) {
  return { kind, product_id: productId, ...extra }
}

async function currentProfileId() {
  const { data, error } = await (api() as any).rpc('current_user_profile')
  const profileId = data && typeof data === 'object' && typeof data.id === 'string' ? data.id : null
  if (error || !profileId) throw new Error(error?.message ?? 'No Supabase profile is available for this session.')
  return profileId
}

export async function listDependencies(productId: string): Promise<PmDependency[]> {
  const { data, error } = await (appSchema() as any).from('activity').select('*').eq('target_schema', 'pim').eq('target_table', 'product').eq('target_id', productId).eq('action', 'pm_dependency').order('created_at')
  return unwrap<any[]>({ data, error }).map((row) => ({ id: row.id, product: productId, depends_on_product: row.payload?.depends_on_product ?? null, project: null, title: row.payload?.title ?? null, dependency_type: row.payload?.dependency_type ?? 'blocked_by', status: row.payload?.status ?? 'open', waiting_on: row.payload?.waiting_on ?? null, due_at: row.payload?.due_at ?? null, resolved_at: row.payload?.resolved_at ?? null, notes: row.payload?.notes ?? null, source_system: 'supabase', source_id: row.id }))
}

export async function createDependency(productId: string, title: string): Promise<PmDependency> {
  const { data, error } = await (appSchema() as any).from('activity').insert({ target_schema: 'pim', target_table: 'product', target_id: productId, action: 'pm_dependency', summary: title, payload: opPayload('dependency', productId, { title, dependency_type: 'blocked_by', status: 'open' }) }).select('*').single()
  const row = unwrap<any>({ data, error })
  return { id: row.id, product: productId, depends_on_product: null, project: null, title, dependency_type: 'blocked_by', status: 'open', waiting_on: null, due_at: null, resolved_at: null, notes: null, source_system: 'supabase', source_id: row.id }
}

export async function updateDependencyStatus(id: string, status: PmDependency['status']): Promise<PmDependency> {
  const { data, error } = await (appSchema() as any).from('activity').select('*').eq('id', id).single()
  const row = unwrap<any>({ data, error })
  const payload = { ...(row.payload ?? {}), status, resolved_at: status === 'resolved' ? new Date().toISOString() : null }
  const result = await (appSchema() as any).from('activity').update({ payload }).eq('id', id).select('*').single()
  const updated = unwrap<any>({ data: result.data, error: result.error })
  return { id, product: updated.target_id, depends_on_product: null, project: null, title: payload.title ?? null, dependency_type: payload.dependency_type ?? 'blocked_by', status, waiting_on: payload.waiting_on ?? null, due_at: payload.due_at ?? null, resolved_at: payload.resolved_at ?? null, notes: payload.notes ?? null, source_system: 'supabase', source_id: id }
}

export async function listDecisions(productId: string): Promise<PmDecision[]> {
  const { data, error } = await (appSchema() as any).from('activity').select('*').eq('target_schema', 'pim').eq('target_table', 'product').eq('target_id', productId).eq('action', 'pm_decision').order('created_at', { ascending: false })
  return unwrap<any[]>({ data, error }).map((row) => ({ id: row.id, product: productId, project: null, object_collection: 'product', object_id: productId, decision_type: row.payload?.decision_type ?? null, status: row.payload?.status ?? 'decided', decided_by: row.actor_profile_id, decided_at: row.created_at, reason: row.payload?.reason ?? null, notes: row.payload?.notes ?? null, evidence_url: row.payload?.evidence_url ?? null, source_system: 'supabase', source_id: row.id }))
}

export async function createDecision(productId: string, decisionType: string, notes?: string): Promise<PmDecision> {
  const { data, error } = await (appSchema() as any).from('activity').insert({ target_schema: 'pim', target_table: 'product', target_id: productId, action: 'pm_decision', summary: decisionType || 'custom', payload: opPayload('decision', productId, { decision_type: decisionType || 'custom', status: 'decided', notes: notes ?? null }) }).select('*').single()
  const row = unwrap<any>({ data, error })
  return { id: row.id, product: productId, project: null, object_collection: 'product', object_id: productId, decision_type: decisionType || 'custom', status: 'decided', decided_by: row.actor_profile_id, decided_at: row.created_at, reason: null, notes: notes ?? null, evidence_url: null, source_system: 'supabase', source_id: row.id }
}

export async function listReminders(productId: string): Promise<PmReminder[]> {
  const { data, error } = await (appSchema() as any).from('notification').select('*').eq('target_schema', 'pim').eq('target_table', 'product').eq('target_id', productId).order('created_at')
  return unwrap<any[]>({ data, error }).map((row) => ({ id: row.id, product: productId, project: null, object_collection: 'product', object_id: productId, title: row.title, due_at: row.payload?.due_at ?? null, assigned_to: row.profile_id, status: row.read_at ? 'done' : row.payload?.status ?? 'open', reminder_type: row.payload?.reminder_type ?? 'follow_up', snoozed_until: row.payload?.snoozed_until ?? null, completed_at: row.read_at, notes: row.body }))
}

export async function createReminder(productId: string, title: string, dueAt?: string | null): Promise<PmReminder> {
  const profileId = await currentProfileId()
  const { data, error } = await (appSchema() as any).from('notification').insert({ app: 'pm', profile_id: profileId, target_schema: 'pim', target_table: 'product', target_id: productId, title, body: null, payload: opPayload('reminder', productId, { due_at: dueAt ?? null, status: 'open', reminder_type: 'follow_up' }) }).select('*').single()
  const row = unwrap<any>({ data, error })
  return { id: row.id, product: productId, project: null, object_collection: 'product', object_id: productId, title, due_at: dueAt ?? null, assigned_to: row.profile_id, status: 'open', reminder_type: 'follow_up', snoozed_until: null, completed_at: null, notes: null }
}

export async function updateReminderStatus(id: string, status: PmReminder['status']): Promise<PmReminder> {
  const existing = await (appSchema() as any).from('notification').select('payload').eq('id', id).single()
  const existingRow = unwrap<{ payload?: unknown }>({ data: existing.data, error: existing.error })
  const existingPayload = existingRow.payload && typeof existingRow.payload === 'object' && !Array.isArray(existingRow.payload)
    ? existingRow.payload as Record<string, unknown>
    : {}
  const payload = { ...existingPayload, status }
  const patch = status === 'done' ? { read_at: new Date().toISOString(), payload } : { payload }
  const { data, error } = await (appSchema() as any).from('notification').update(patch).eq('id', id).select('*').single()
  const row = unwrap<any>({ data, error })
  return { id: row.id, product: row.target_id, project: null, object_collection: 'product', object_id: row.target_id, title: row.title, due_at: row.payload?.due_at ?? null, assigned_to: row.profile_id, status, reminder_type: row.payload?.reminder_type ?? 'follow_up', snoozed_until: row.payload?.snoozed_until ?? null, completed_at: row.read_at, notes: row.body }
}

export async function fetchWorkflowTemplates(): Promise<PmWorkflowTemplate[]> {
  const { data, error } = await pim().from('saved_view').select('*').eq('scope', 'workflow_template').order('name')
  return unwrap<any[]>({ data, error }).map((row) => ({ id: row.id, name: row.name, business_unit: row.config?.business_unit ?? null, object_type: row.config?.object_type ?? 'product', template_type: row.config?.template_type ?? 'checklist', active: row.config?.active ?? true, description: row.config?.description ?? null, checklist_json: row.config?.checklist_json ?? [], required_evidence_json: row.config?.required_evidence_json ?? [], default_next_action: row.config?.default_next_action ?? null, default_owner_role: null }))
}

export async function createWorkflowTemplate(input: { name: string; businessUnit: string; objectType?: string; templateType?: string; description?: string | null }): Promise<PmWorkflowTemplate> {
  const config = { business_unit: input.businessUnit, object_type: input.objectType ?? 'product', template_type: input.templateType ?? 'checklist', active: true, description: input.description ?? null, checklist_json: [], required_evidence_json: [] }
  const { data, error } = await pim().from('saved_view').insert({ name: input.name, scope: 'workflow_template', config, is_default: false }).select('*').single()
  const row = unwrap<any>({ data, error })
  return { id: row.id, name: row.name, business_unit: input.businessUnit, object_type: config.object_type as never, template_type: config.template_type as never, active: true, description: input.description ?? null, checklist_json: [], required_evidence_json: [], default_next_action: null, default_owner_role: null }
}
