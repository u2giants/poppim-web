import { pim, unwrap } from '@/lib/supabaseQuery'
import type { Product, ProductSample, ProductSubmission, RevisionRequest } from '@/lib/types'
import type { BusinessUnit } from '@/domain/products/types'
import type { Database } from '@/lib/database.types'
import { metadata } from '@/lib/supabaseQuery'

export interface WorkflowFetchOpts {
  search?: string
  businessUnit?: BusinessUnit
  limit?: number
  cursor?: string | null
}
export interface WorkflowPage<T> { rows:T[];nextCursor:string|null }

const PRODUCT_DEPARTMENT = 'product:product_id!inner(metadata)'
const SUBMISSION_FIELDS = `id,product_id,licensor_id,property_id,status,submitted_at,approved_at,rejected_at,updated_at,metadata,${PRODUCT_DEPARTMENT}`
const SAMPLE_FIELDS = `id,product_id,factory_id,sample_type,status,requested_at,received_at,updated_at,metadata,${PRODUCT_DEPARTMENT}`
const REVISION_FIELDS = `id,product_id,submission_id,requested_by_profile_id,status,body,requested_at,resolved_at,metadata,${PRODUCT_DEPARTMENT}`
const SUBMISSION_WRITE_FIELDS = 'id,product_id,licensor_id,property_id,status,submitted_at,approved_at,rejected_at,updated_at,metadata'
const SAMPLE_WRITE_FIELDS = 'id,product_id,factory_id,sample_type,status,requested_at,received_at,updated_at,metadata'
const REVISION_WRITE_FIELDS = 'id,product_id,submission_id,requested_by_profile_id,status,body,requested_at,resolved_at,metadata'

function departmentAliases(businessUnit: BusinessUnit): string[] {
  if (businessUnit === 'Licensed') return ['Licensed', 'licensed', 'POP', 'POP Creations']
  if (businessUnit === 'Generic') return ['Generic', 'generic', 'Spruce', 'Spruce Line']
  if (businessUnit === 'Software') return ['Software', 'software']
  return []
}

interface OrFilter<T> {
  or(filters: string, options?: { referencedTable?: string }): T
}

function applyWorkflowFilters<T extends OrFilter<T>>(query: T, opts: WorkflowFetchOpts, fields: string[], cursorField = 'updated_at'): T {
  let next = query
  const q = opts.search?.trim()
  if (q) next = next.or(fields.map((field) => `${field}.ilike.%${q}%`).join(','))
  if (opts.businessUnit && opts.businessUnit !== 'Unknown') {
    const values = departmentAliases(opts.businessUnit).map((value) => `"${value}"`).join(',')
    next = next.or(`metadata->>business_unit.in.(${values}),metadata->>department.in.(${values})`, { referencedTable: 'product' })
  }
  if (opts.cursor) {
    const after=JSON.parse(atob(opts.cursor)) as {updatedAt:string;id:string}
    next=next.or(`${cursorField}.lt.${after.updatedAt},and(${cursorField}.eq.${after.updatedAt},id.lt.${after.id})`)
  }
  return next
}

interface CursorRow { id: string; updated_at?: string | null; requested_at?: string | null }
function pageResult<Row extends CursorRow, T>(raw:Row[],limit:number,map:(row:Row)=>T,cursorField:'updated_at'|'requested_at'='updated_at'):WorkflowPage<T>{
  const visible=raw.slice(0,limit);const last=visible.at(-1)
  return {rows:visible.map(map),nextCursor:raw.length>limit&&last?btoa(JSON.stringify({updatedAt:last[cursorField] ?? '',id:last.id})):null}
}

type SubmissionRow = Database['pim']['Tables']['product_submission']['Row']
type SampleRow = Database['pim']['Tables']['product_sample']['Row']
type RevisionRow = Database['pim']['Tables']['revision_request']['Row']

function submission(row: SubmissionRow): ProductSubmission {
  const rowMetadata = metadata(row)
  return {
    id: row.id,
    product: row.product_id,
    project: typeof rowMetadata.project_id === 'string' ? rowMetadata.project_id : null,
    business_unit: typeof rowMetadata.business_unit === 'string' ? rowMetadata.business_unit : null,
    submission_type: typeof rowMetadata.submission_type === 'string' ? rowMetadata.submission_type : null,
    recipient_type: typeof rowMetadata.recipient_type === 'string' ? rowMetadata.recipient_type : null,
    licensor: row.licensor_id,
    submitted_by: typeof rowMetadata.submitted_by === 'string' ? rowMetadata.submitted_by : null,
    submitted_at: row.submitted_at,
    expected_response_at: typeof rowMetadata.expected_response_at === 'string' ? rowMetadata.expected_response_at : null,
    status: row.status,
    response_at: row.approved_at ?? row.rejected_at,
    response_summary: typeof rowMetadata.response_summary === 'string' ? rowMetadata.response_summary : null,
    brand_assurance_number: typeof rowMetadata.brand_assurance_number === 'string' ? rowMetadata.brand_assurance_number : null,
    brand_assurance_file: null,
    portal_url: typeof rowMetadata.portal_url === 'string' ? rowMetadata.portal_url : null,
    portal_reference: typeof rowMetadata.portal_reference === 'string' ? rowMetadata.portal_reference : null,
    revision_required: typeof rowMetadata.revision_required === 'boolean' ? rowMetadata.revision_required : null,
    revision: null,
    notes: typeof rowMetadata.notes === 'string' ? rowMetadata.notes : null,
  }
}

function sample(row: SampleRow): ProductSample {
  const rowMetadata = metadata(row)
  return {
    id: row.id,
    product: row.product_id,
    project: typeof rowMetadata.project_id === 'string' ? rowMetadata.project_id : null,
    factory: row.factory_id,
    sample_type: row.sample_type,
    requested_by: typeof rowMetadata.requested_by === 'string' ? rowMetadata.requested_by : null,
    requested_at: row.requested_at,
    expected_at: typeof rowMetadata.expected_at === 'string' ? rowMetadata.expected_at : null,
    received_at: row.received_at,
    sent_to_buyer_at: typeof rowMetadata.sent_to_buyer_at === 'string' ? rowMetadata.sent_to_buyer_at : null,
    sent_to_licensor_at: typeof rowMetadata.sent_to_licensor_at === 'string' ? rowMetadata.sent_to_licensor_at : null,
    status: row.status,
    primary_photo: null,
    photo_urls: typeof rowMetadata.photo_urls === 'string' ? rowMetadata.photo_urls : null,
    notes: typeof rowMetadata.notes === 'string' ? rowMetadata.notes : null,
    revision_required: typeof rowMetadata.revision_required === 'boolean' ? rowMetadata.revision_required : null,
    revision_reason: typeof rowMetadata.revision_reason === 'string' ? rowMetadata.revision_reason : null,
    revision: null,
  }
}

function revision(row: RevisionRow): RevisionRequest {
  const rowMetadata = metadata(row)
  return {
    id: row.id,
    object_collection: 'product',
    object_id: row.product_id,
    product: row.product_id,
    project: typeof rowMetadata.project_id === 'string' ? rowMetadata.project_id : null,
    design: typeof rowMetadata.design_id === 'string' ? rowMetadata.design_id : null,
    submission: row.submission_id,
    source: typeof rowMetadata.source === 'string' ? rowMetadata.source : null,
    requested_by_user: row.requested_by_profile_id,
    requested_by_external: typeof rowMetadata.requested_by_external === 'string' ? rowMetadata.requested_by_external : null,
    requested_at: row.requested_at,
    assigned_to: typeof rowMetadata.assigned_to === 'string' ? rowMetadata.assigned_to : null,
    due_at: typeof rowMetadata.due_at === 'string' ? rowMetadata.due_at : null,
    status: row.status,
    body: row.body,
    markup_file: null,
    resolved_at: row.resolved_at,
    resolution_note: typeof rowMetadata.resolution_note === 'string' ? rowMetadata.resolution_note : null,
  }
}

export async function fetchSubmissionsPage(opts: WorkflowFetchOpts = {}): Promise<WorkflowPage<ProductSubmission>> {
  const limit=opts.limit??100
  const query = applyWorkflowFilters(pim().from('product_submission').select(SUBMISSION_FIELDS), opts, ['status', 'metadata->>notes', 'metadata->>portal_reference'])
  const { data, error } = await query.order('updated_at', { ascending: false }).order('id', { ascending: false }).limit(limit+1)
  return pageResult(unwrap<SubmissionRow[]>({data,error}),limit,submission)
}
export async function fetchSubmissions(opts:WorkflowFetchOpts={}):Promise<ProductSubmission[]>{return (await fetchSubmissionsPage(opts)).rows}

export async function fetchSamplesPage(opts: WorkflowFetchOpts = {}): Promise<WorkflowPage<ProductSample>> {
  const limit=opts.limit??100
  const query = applyWorkflowFilters(pim().from('product_sample').select(SAMPLE_FIELDS), opts, ['status', 'sample_type', 'metadata->>notes'])
  const { data, error } = await query.order('updated_at', { ascending: false }).order('id', { ascending: false }).limit(limit+1)
  return pageResult(unwrap<SampleRow[]>({data,error}),limit,sample)
}
export async function fetchSamples(opts:WorkflowFetchOpts={}):Promise<ProductSample[]>{return (await fetchSamplesPage(opts)).rows}

export async function fetchRevisionsPage(opts: WorkflowFetchOpts = {}): Promise<WorkflowPage<RevisionRequest>> {
  const limit=opts.limit??100
  const query = applyWorkflowFilters(pim().from('revision_request').select(REVISION_FIELDS), opts, ['status', 'body', 'metadata->>notes'],'requested_at')
  const { data, error } = await query.order('requested_at', { ascending: false }).order('id', { ascending: false }).limit(limit+1)
  return pageResult(unwrap<RevisionRow[]>({data,error}),limit,revision,'requested_at')
}
export async function fetchRevisions(opts:WorkflowFetchOpts={}):Promise<RevisionRequest[]>{return (await fetchRevisionsPage(opts)).rows}

export async function fetchAssignedRevisions(userId: string): Promise<RevisionRequest[]> {
  const { data, error } = await pim().from('revision_request').select(REVISION_FIELDS).eq('metadata->>assigned_to', userId).not('status', 'in', '("resolved","accepted","rejected","canceled")').order('updated_at', { ascending: false }).order('id', { ascending: false }).limit(300)
  return unwrap<RevisionRow[]>({ data, error }).map(revision)
}

function productId(product: Product): string {
  return product.id
}

export async function createSubmissionForProduct(product: Product): Promise<ProductSubmission> {
  const { data, error } = await pim().from('product_submission').insert({ product_id: productId(product), licensor_id: typeof product.licensor === 'string' ? product.licensor : product.licensor?.id ?? null, property_id: typeof product.property === 'string' ? product.property : product.property?.id ?? null, status: 'ready', metadata: { project_id: typeof product.project === 'string' ? product.project : product.project?.id ?? null, submission_type: 'concept', recipient_type: product.licensor ? 'licensor' : 'buyer', expected_response_at: product.pps_requested_date ?? product.on_shelf_date ?? null, brand_assurance_number: product.brand_assurance_number ?? null, revision_required: false, notes: 'Created from product detail in PM frontend.' } }).select(SUBMISSION_WRITE_FIELDS).single()
  return submission(unwrap<SubmissionRow>({ data, error }))
}

export async function createSampleForProduct(product: Product): Promise<ProductSample> {
  const { data, error } = await pim().from('product_sample').insert({ product_id: productId(product), factory_id: typeof product.factory === 'string' ? product.factory : product.factory?.id ?? null, sample_type: product.licensor ? 'pps' : 'factory', status: 'needed', metadata: { project_id: typeof product.project === 'string' ? product.project : product.project?.id ?? null, expected_at: product.pps_requested_date ?? product.on_shelf_date ?? null, revision_required: false, notes: 'Created from product detail in PM frontend.' } }).select(SAMPLE_WRITE_FIELDS).single()
  return sample(unwrap<SampleRow>({ data, error }))
}

export async function createRevisionForProduct(product: Product): Promise<RevisionRequest> {
  const { data, error } = await pim().from('revision_request').insert({ product_id: productId(product), status: 'open', body: 'Revision created from product detail in PM frontend.', metadata: { project_id: typeof product.project === 'string' ? product.project : product.project?.id ?? null, design_id: typeof product.design === 'string' ? product.design : product.design?.id ?? null, source: 'internal', due_at: product.pps_requested_date ?? product.on_shelf_date ?? null } }).select(REVISION_WRITE_FIELDS).single()
  return revision(unwrap<RevisionRow>({ data, error }))
}

export async function updateSubmissionStatus(id: string, status: string): Promise<ProductSubmission> {
  const { data, error } = await pim().from('product_submission').update({ status }).eq('id', id).select(SUBMISSION_WRITE_FIELDS).single()
  return submission(unwrap<SubmissionRow>({ data, error }))
}

export async function updateSampleStatus(id: string, status: string): Promise<ProductSample> {
  const { data, error } = await pim().from('product_sample').update({ status }).eq('id', id).select(SAMPLE_WRITE_FIELDS).single()
  return sample(unwrap<SampleRow>({ data, error }))
}

export async function updateRevisionStatus(id: string, status: string): Promise<RevisionRequest> {
  const patch = status === 'resolved' ? { status, resolved_at: new Date().toISOString() } : { status }
  const { data, error } = await pim().from('revision_request').update(patch).eq('id', id).select(REVISION_WRITE_FIELDS).single()
  return revision(unwrap<RevisionRow>({ data, error }))
}
