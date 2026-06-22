import { createItem, readItems, updateItem } from '@directus/sdk'
import { directus } from '@/lib/directus'
import type { PmDecision, PmDependency, PmReminder, PmWorkflowTemplate } from '@/lib/types'

const USER_FIELDS = ['id', 'first_name', 'last_name', 'email', 'avatar'] as const
const PRODUCT_FIELDS = ['id', 'name', 'business_unit', 'clickup_list_name'] as const

export async function listDependencies(productId: string): Promise<PmDependency[]> {
  return directus.request(
    readItems('pm_dependency', {
      filter: { product: { _eq: productId } },
      fields: [
        'id',
        'title',
        'dependency_type',
        'status',
        'waiting_on',
        'due_at',
        'resolved_at',
        'notes',
        { depends_on_product: PRODUCT_FIELDS },
      ] as never,
      sort: ['status', 'due_at', 'title'],
      limit: -1,
    }),
  ) as unknown as Promise<PmDependency[]>
}

export async function createDependency(productId: string, title: string): Promise<PmDependency> {
  return directus.request(
    createItem('pm_dependency', {
      product: productId,
      title,
      dependency_type: 'blocked_by',
      status: 'open',
    } as never),
  ) as Promise<PmDependency>
}

export async function updateDependencyStatus(id: string, status: PmDependency['status']): Promise<PmDependency> {
  return directus.request(
    updateItem('pm_dependency', id, {
      status,
      resolved_at: status === 'resolved' ? new Date().toISOString() : null,
    } as never),
  ) as Promise<PmDependency>
}

export async function listDecisions(productId: string): Promise<PmDecision[]> {
  return directus.request(
    readItems('pm_decision', {
      filter: { product: { _eq: productId } },
      fields: [
        'id',
        'decision_type',
        'status',
        'decided_at',
        'reason',
        'notes',
        'evidence_url',
        { decided_by: USER_FIELDS },
      ] as never,
      sort: ['-decided_at', '-id'],
      limit: -1,
    }),
  ) as unknown as Promise<PmDecision[]>
}

export async function createDecision(productId: string, decisionType: string, notes?: string): Promise<PmDecision> {
  return directus.request(
    createItem('pm_decision', {
      product: productId,
      object_collection: 'product',
      object_id: productId,
      decision_type: decisionType || 'custom',
      status: 'decided',
      decided_at: new Date().toISOString(),
      notes: notes || null,
    } as never),
  ) as Promise<PmDecision>
}

export async function listReminders(productId: string): Promise<PmReminder[]> {
  return directus.request(
    readItems('pm_reminder', {
      filter: { product: { _eq: productId } },
      fields: [
        'id',
        'title',
        'due_at',
        'status',
        'reminder_type',
        'snoozed_until',
        'completed_at',
        'notes',
        { assigned_to: USER_FIELDS },
      ] as never,
      sort: ['status', 'due_at', 'title'],
      limit: -1,
    }),
  ) as unknown as Promise<PmReminder[]>
}

export async function createReminder(productId: string, title: string, dueAt?: string | null): Promise<PmReminder> {
  return directus.request(
    createItem('pm_reminder', {
      product: productId,
      object_collection: 'product',
      object_id: productId,
      title,
      due_at: dueAt || null,
      status: 'open',
      reminder_type: 'follow_up',
    } as never),
  ) as Promise<PmReminder>
}

export async function updateReminderStatus(id: string, status: PmReminder['status']): Promise<PmReminder> {
  return directus.request(
    updateItem('pm_reminder', id, {
      status,
      completed_at: status === 'done' ? new Date().toISOString() : null,
    } as never),
  ) as Promise<PmReminder>
}

export async function fetchWorkflowTemplates(): Promise<PmWorkflowTemplate[]> {
  return directus.request(
    readItems('pm_workflow_template', {
      fields: [
        'id',
        'name',
        'business_unit',
        'object_type',
        'template_type',
        'active',
        'description',
        'checklist_json',
        'required_evidence_json',
        'default_next_action',
        { default_owner_role: ['id', 'name'] },
      ] as never,
      sort: ['business_unit', 'object_type', 'name'],
      limit: -1,
    }),
  ) as unknown as Promise<PmWorkflowTemplate[]>
}

export async function createWorkflowTemplate(input: {
  name: string
  businessUnit: string
  objectType?: string
  templateType?: string
  description?: string | null
}): Promise<PmWorkflowTemplate> {
  return directus.request(
    createItem('pm_workflow_template', {
      name: input.name,
      business_unit: input.businessUnit,
      object_type: input.objectType ?? 'product',
      template_type: input.templateType ?? 'checklist',
      active: true,
      description: input.description ?? null,
      checklist_json: [],
      required_evidence_json: [],
    } as never),
  ) as Promise<PmWorkflowTemplate>
}
