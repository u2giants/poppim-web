import { pim, unwrap } from '@/lib/supabaseQuery'
import type { Product, ProductSample, ProductSubmission, RevisionRequest } from '@/lib/types'
import type { BusinessUnit } from '@/domain/products/types'
import { enrichProductRowsWithBoardFields } from '@/domain/products/enrich'
import { supabaseProductToProduct } from '@/domain/products/supabaseAdapter'

export interface WorkflowFetchOpts {
  search?: string
  businessUnit?: BusinessUnit
  limit?: number
}

export const PRODUCT_CONTEXT_FIELDS = ['*'] as const

function matchesSearch(row: any, search?: string) {
  const q = search?.trim().toLowerCase()
  if (!q) return true
  return [row.status, row.body, row.notes, row.metadata?.notes, row.metadata?.portal_reference].filter(Boolean).join(' ').toLowerCase().includes(q)
}

function submission(row: any): ProductSubmission {
  return {
    id: row.id,
    product: row.product_id,
    project: row.metadata?.project_id ?? null,
    business_unit: row.metadata?.business_unit ?? null,
    submission_type: row.metadata?.submission_type ?? null,
    recipient_type: row.metadata?.recipient_type ?? null,
    licensor: row.licensor_id,
    submitted_by: row.metadata?.submitted_by ?? null,
    submitted_at: row.submitted_at,
    expected_response_at: row.metadata?.expected_response_at ?? null,
    status: row.status,
    response_at: row.approved_at ?? row.rejected_at,
    response_summary: row.metadata?.response_summary ?? null,
    brand_assurance_number: row.metadata?.brand_assurance_number ?? null,
    brand_assurance_file: null,
    portal_url: row.metadata?.portal_url ?? null,
    portal_reference: row.metadata?.portal_reference ?? null,
    revision_required: row.metadata?.revision_required ?? null,
    revision: null,
    notes: row.metadata?.notes ?? null,
  }
}

function sample(row: any): ProductSample {
  return {
    id: row.id,
    product: row.product_id,
    project: row.metadata?.project_id ?? null,
    factory: row.factory_id,
    sample_type: row.sample_type,
    requested_by: row.metadata?.requested_by ?? null,
    requested_at: row.requested_at,
    expected_at: row.metadata?.expected_at ?? null,
    received_at: row.received_at,
    sent_to_buyer_at: row.metadata?.sent_to_buyer_at ?? null,
    sent_to_licensor_at: row.metadata?.sent_to_licensor_at ?? null,
    status: row.status,
    primary_photo: null,
    photo_urls: row.metadata?.photo_urls ?? null,
    notes: row.metadata?.notes ?? null,
    revision_required: row.metadata?.revision_required ?? null,
    revision_reason: row.metadata?.revision_reason ?? null,
    revision: null,
  }
}

function revision(row: any): RevisionRequest {
  return {
    id: row.id,
    object_collection: 'product',
    object_id: row.product_id,
    product: row.product_id,
    project: row.metadata?.project_id ?? null,
    design: row.metadata?.design_id ?? null,
    submission: row.submission_id,
    source: row.metadata?.source ?? null,
    requested_by_user: row.requested_by_profile_id,
    requested_by_external: row.metadata?.requested_by_external ?? null,
    requested_at: row.requested_at,
    assigned_to: row.metadata?.assigned_to ?? null,
    due_at: row.metadata?.due_at ?? null,
    status: row.status,
    body: row.body,
    markup_file: null,
    resolved_at: row.resolved_at,
    resolution_note: row.metadata?.resolution_note ?? null,
  }
}

export async function fetchSubmissions(opts: WorkflowFetchOpts = {}): Promise<ProductSubmission[]> {
  const { data, error } = await pim().from('product_submission').select('*').order('submitted_at', { ascending: false }).limit(opts.limit ?? 300)
  return unwrap<any[]>({ data, error }).filter((row) => matchesSearch(row, opts.search)).map(submission)
}

export async function fetchSamples(opts: WorkflowFetchOpts = {}): Promise<ProductSample[]> {
  const { data, error } = await pim().from('product_sample').select('*').order('requested_at', { ascending: false }).limit(opts.limit ?? 300)
  return unwrap<any[]>({ data, error }).filter((row) => matchesSearch(row, opts.search)).map(sample)
}

export async function fetchRevisions(opts: WorkflowFetchOpts = {}): Promise<RevisionRequest[]> {
  const { data, error } = await pim().from('revision_request').select('*').order('requested_at', { ascending: false }).limit(opts.limit ?? 300)
  return unwrap<any[]>({ data, error }).filter((row) => matchesSearch(row, opts.search)).map(revision)
}

export async function fetchLifecycleOwnedProducts(userId: string, roleId: string | null): Promise<Product[]> {
  const { data, error } = await pim().from('product').select('*').or(`metadata->>next_owner_user.eq.${userId},metadata->>next_owner_role.eq.${roleId ?? ''}`)
  const rows = await enrichProductRowsWithBoardFields(unwrap<any[]>({ data, error }))
  return rows.map((row) => supabaseProductToProduct(row))
}

export async function fetchAssignedRevisions(userId: string): Promise<RevisionRequest[]> {
  const { data, error } = await pim().from('revision_request').select('*').eq('metadata->>assigned_to', userId).not('status', 'in', '("resolved","accepted","rejected","canceled")').order('requested_at')
  return unwrap<any[]>({ data, error }).map(revision)
}

function productId(product: Product): string {
  return product.id
}

export async function createSubmissionForProduct(product: Product): Promise<ProductSubmission> {
  const { data, error } = await pim().from('product_submission').insert({ product_id: productId(product), licensor_id: typeof product.licensor === 'string' ? product.licensor : product.licensor?.id ?? null, property_id: typeof product.property === 'string' ? product.property : product.property?.id ?? null, status: 'ready', metadata: { project_id: typeof product.project === 'string' ? product.project : product.project?.id ?? null, submission_type: 'concept', recipient_type: product.licensor ? 'licensor' : 'buyer', expected_response_at: product.pps_requested_date ?? product.on_shelf_date ?? null, brand_assurance_number: product.brand_assurance_number ?? null, revision_required: false, notes: 'Created from product detail in PM frontend.' } }).select('*').single()
  return submission(unwrap<any>({ data, error }))
}

export async function createSampleForProduct(product: Product): Promise<ProductSample> {
  const { data, error } = await pim().from('product_sample').insert({ product_id: productId(product), factory_id: typeof product.factory === 'string' ? product.factory : product.factory?.id ?? null, sample_type: product.licensor ? 'pps' : 'factory', status: 'needed', metadata: { project_id: typeof product.project === 'string' ? product.project : product.project?.id ?? null, expected_at: product.pps_requested_date ?? product.on_shelf_date ?? null, revision_required: false, notes: 'Created from product detail in PM frontend.' } }).select('*').single()
  return sample(unwrap<any>({ data, error }))
}

export async function createRevisionForProduct(product: Product): Promise<RevisionRequest> {
  const { data, error } = await pim().from('revision_request').insert({ product_id: productId(product), status: 'open', body: 'Revision created from product detail in PM frontend.', metadata: { project_id: typeof product.project === 'string' ? product.project : product.project?.id ?? null, design_id: typeof product.design === 'string' ? product.design : product.design?.id ?? null, source: 'internal', due_at: product.pps_requested_date ?? product.on_shelf_date ?? null } }).select('*').single()
  return revision(unwrap<any>({ data, error }))
}

export async function updateSubmissionStatus(id: string, status: string): Promise<ProductSubmission> {
  const { data, error } = await pim().from('product_submission').update({ status }).eq('id', id).select('*').single()
  return submission(unwrap<any>({ data, error }))
}

export async function updateSampleStatus(id: string, status: string): Promise<ProductSample> {
  const { data, error } = await pim().from('product_sample').update({ status }).eq('id', id).select('*').single()
  return sample(unwrap<any>({ data, error }))
}

export async function updateRevisionStatus(id: string, status: string): Promise<RevisionRequest> {
  const patch = status === 'resolved' ? { status, resolved_at: new Date().toISOString() } : { status }
  const { data, error } = await pim().from('revision_request').update(patch).eq('id', id).select('*').single()
  return revision(unwrap<any>({ data, error }))
}
