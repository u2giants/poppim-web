import { createItem, readItems, updateItem } from '@directus/sdk'
import { directus } from '@/lib/directus'
import type { Product, ProductSample, ProductSubmission, RevisionRequest } from '@/lib/types'
import type { BusinessUnit } from '@/domain/products/types'
import { PRODUCT_SUMMARY_FIELDS } from '@/features/pipeline/api'

export interface WorkflowFetchOpts {
  search?: string
  businessUnit?: BusinessUnit
  limit?: number
}

const USER_FIELDS = ['id', 'first_name', 'last_name', 'email', 'avatar'] as const
const FILE_FIELDS = ['id', 'filename_download', 'title', 'type'] as const

function unitValues(unit?: BusinessUnit): string[] | null {
  if (!unit || unit === 'Unknown') return null
  if (unit === 'Licensed') return ['POP', 'POP Creations']
  if (unit === 'Generic') return ['Spruce', 'Spruce Line']
  return ['Software']
}

function productUnitFilter(unit?: BusinessUnit) {
  const values = unitValues(unit)
  return values ? [{ product: { business_unit: { _in: values } } }] : []
}

function directUnitFilter(unit?: BusinessUnit) {
  const values = unitValues(unit)
  return values ? [{ business_unit: { _in: values } }] : []
}

function submissionSearchFilter(search?: string) {
  const q = search?.trim()
  if (!q) return []
  return [{
    _or: [
      { product: { code: { _icontains: q } } },
      { product: { name: { _icontains: q } } },
      { project: { title: { _icontains: q } } },
      { notes: { _icontains: q } },
      { body: { _icontains: q } },
      { response_summary: { _icontains: q } },
      { portal_reference: { _icontains: q } },
      { brand_assurance_number: { _icontains: q } },
    ],
  }]
}

function sampleSearchFilter(search?: string) {
  const q = search?.trim()
  if (!q) return []
  return [{
    _or: [
      { product: { code: { _icontains: q } } },
      { product: { name: { _icontains: q } } },
      { project: { title: { _icontains: q } } },
      { notes: { _icontains: q } },
      { revision_reason: { _icontains: q } },
    ],
  }]
}

function revisionSearchFilter(search?: string) {
  const q = search?.trim()
  if (!q) return []
  return [{
    _or: [
      { product: { code: { _icontains: q } } },
      { product: { name: { _icontains: q } } },
      { project: { title: { _icontains: q } } },
      { body: { _icontains: q } },
      { requested_by_external: { _icontains: q } },
      { resolution_note: { _icontains: q } },
    ],
  }]
}

export const PRODUCT_CONTEXT_FIELDS = [
  'id',
  'code',
  'name',
  'description',
  'priority',
  'business_unit',
  'lifecycle_state',
  'next_action',
  { next_owner_user: ['id', 'first_name', 'last_name', 'email', 'avatar'] },
  { next_owner_role: ['id', 'name'] },
  'waiting_on',
  'blocker_reason',
  'risk_level',
  'on_shelf_date',
  'pps_requested_date',
  'pi_status',
  'brand_assurance_number',
  'closure_reason',
  'cover_url',
  'clickup_due_at',
  { stage: ['id', 'name'] },
  { licensor: ['id', 'name'] },
  { property: ['id', 'name'] },
  { product_type: ['id', 'name'] },
  { factory: ['id', 'name'] },
  { project: ['id', 'title', 'status', 'business_unit', 'on_shelf_date', { retailer: ['id', 'name'] }, { buyer: ['id', 'name', 'samples_required'] }] },
  { design: ['id', 'name', 'status', 'theme', 'thumbnail_url'] },
] as const

export async function fetchSubmissions(opts: WorkflowFetchOpts = {}): Promise<ProductSubmission[]> {
  const { limit = 300 } = opts
  return directus.request(
    readItems('product_submission', {
      fields: [
        'id',
        'business_unit',
        'submission_type',
        'recipient_type',
        'submitted_at',
        'expected_response_at',
        'status',
        'response_at',
        'response_summary',
        'brand_assurance_number',
        'portal_url',
        'portal_reference',
        'revision_required',
        'notes',
        { product: PRODUCT_CONTEXT_FIELDS },
        { project: ['id', 'title', 'business_unit', { retailer: ['id', 'name'] }, { buyer: ['id', 'name'] }] },
        { licensor: ['id', 'name'] },
        { submitted_by: USER_FIELDS },
        { brand_assurance_file: FILE_FIELDS },
        { revision: ['id', 'status', 'source', 'due_at'] },
      ] as never,
      filter: { _and: [...directUnitFilter(opts.businessUnit), ...submissionSearchFilter(opts.search)] } as never,
      sort: ['expected_response_at', '-submitted_at'],
      limit,
    }),
  ) as Promise<ProductSubmission[]>
}

export async function fetchSamples(opts: WorkflowFetchOpts = {}): Promise<ProductSample[]> {
  const { limit = 300 } = opts
  return directus.request(
    readItems('product_sample', {
      fields: [
        'id',
        'sample_type',
        'requested_at',
        'expected_at',
        'received_at',
        'sent_to_buyer_at',
        'sent_to_licensor_at',
        'status',
        'photo_urls',
        'notes',
        'revision_required',
        'revision_reason',
        { product: PRODUCT_CONTEXT_FIELDS },
        { project: ['id', 'title', 'business_unit', { retailer: ['id', 'name'] }, { buyer: ['id', 'name'] }] },
        { factory: ['id', 'name', 'china_team_contact'] },
        { requested_by: USER_FIELDS },
        { primary_photo: FILE_FIELDS },
        { revision: ['id', 'status', 'source', 'due_at'] },
      ] as never,
      filter: { _and: [...productUnitFilter(opts.businessUnit), ...sampleSearchFilter(opts.search)] } as never,
      sort: ['expected_at', '-requested_at'],
      limit,
    }),
  ) as Promise<ProductSample[]>
}

export async function fetchRevisions(opts: WorkflowFetchOpts = {}): Promise<RevisionRequest[]> {
  const { limit = 300 } = opts
  return directus.request(
    readItems('revision_request', {
      fields: [
        'id',
        'object_collection',
        'object_id',
        'source',
        'requested_by_external',
        'requested_at',
        'due_at',
        'status',
        'body',
        'resolved_at',
        'resolution_note',
        { product: PRODUCT_CONTEXT_FIELDS },
        { project: ['id', 'title', 'business_unit', { retailer: ['id', 'name'] }, { buyer: ['id', 'name'] }] },
        { design: ['id', 'name', 'business_unit', 'status', 'theme', 'thumbnail_url'] },
        { submission: ['id', 'submission_type', 'status', 'expected_response_at'] },
        { requested_by_user: USER_FIELDS },
        { assigned_to: USER_FIELDS },
        { markup_file: FILE_FIELDS },
      ] as never,
      filter: { _and: [...productUnitFilter(opts.businessUnit), ...revisionSearchFilter(opts.search)] } as never,
      sort: ['due_at', '-requested_at'],
      limit,
    }),
  ) as Promise<RevisionRequest[]>
}

export async function fetchLifecycleOwnedProducts(userId: string, roleId: string | null): Promise<Product[]> {
  const ownership = roleId
    ? { _or: [{ next_owner_user: { _eq: userId } }, { next_owner_role: { _eq: roleId } }] }
    : { next_owner_user: { _eq: userId } }
  return directus.request(
    readItems('product', {
      fields: PRODUCT_SUMMARY_FIELDS as never,
      filter: ownership as never,
      limit: -1,
    }),
  ) as Promise<Product[]>
}

export async function fetchAssignedRevisions(userId: string): Promise<RevisionRequest[]> {
  return directus.request(
    readItems('revision_request', {
      fields: [
        'id',
        'source',
        'requested_at',
        'due_at',
        'status',
        'body',
        { product: PRODUCT_CONTEXT_FIELDS },
        { assigned_to: USER_FIELDS },
      ] as never,
      filter: {
        _and: [
          { assigned_to: { _eq: userId } },
          { status: { _nin: ['resolved', 'accepted', 'rejected', 'canceled'] } },
        ],
      } as never,
      sort: ['due_at', '-requested_at'],
      limit: -1,
    }),
  ) as Promise<RevisionRequest[]>
}

function relationId(value: unknown): string | null {
  if (!value) return null
  if (typeof value === 'string') return value
  if (typeof value === 'object' && 'id' in value && typeof value.id === 'string') return value.id
  return null
}

function businessUnitValue(product: Product): string | null {
  if (product.business_unit === 'Licensed') return 'POP Creations'
  if (product.business_unit === 'Generic') return 'Spruce Line'
  if (product.business_unit === 'Software') return 'Software'
  return product.business_unit ?? null
}

export async function createSubmissionForProduct(product: Product): Promise<ProductSubmission> {
  return directus.request(
    createItem('product_submission', {
      product: product.id,
      project: relationId(product.project),
      business_unit: businessUnitValue(product),
      submission_type: 'concept',
      recipient_type: product.licensor ? 'licensor' : 'buyer',
      licensor: relationId(product.licensor),
      status: 'ready',
      expected_response_at: product.pps_requested_date ?? product.on_shelf_date ?? null,
      brand_assurance_number: product.brand_assurance_number ?? null,
      revision_required: false,
      notes: 'Created from product detail in PM frontend.',
    } as never),
  ) as Promise<ProductSubmission>
}

export async function createSampleForProduct(product: Product): Promise<ProductSample> {
  return directus.request(
    createItem('product_sample', {
      product: product.id,
      project: relationId(product.project),
      factory: relationId(product.factory),
      sample_type: product.licensor ? 'pps' : 'factory',
      status: 'needed',
      expected_at: product.pps_requested_date ?? product.on_shelf_date ?? null,
      revision_required: false,
      notes: 'Created from product detail in PM frontend.',
    } as never),
  ) as Promise<ProductSample>
}

export async function createRevisionForProduct(product: Product): Promise<RevisionRequest> {
  return directus.request(
    createItem('revision_request', {
      object_collection: 'product',
      object_id: product.id,
      product: product.id,
      project: relationId(product.project),
      design: relationId(product.design),
      source: 'internal',
      status: 'open',
      due_at: product.pps_requested_date ?? product.on_shelf_date ?? null,
      body: 'Revision created from product detail in PM frontend.',
    } as never),
  ) as Promise<RevisionRequest>
}

export async function updateSubmissionStatus(id: string, status: string): Promise<ProductSubmission> {
  return directus.request(updateItem('product_submission', id, { status } as never)) as Promise<ProductSubmission>
}

export async function updateSampleStatus(id: string, status: string): Promise<ProductSample> {
  return directus.request(updateItem('product_sample', id, { status } as never)) as Promise<ProductSample>
}

export async function updateRevisionStatus(id: string, status: string): Promise<RevisionRequest> {
  const patch = status === 'resolved'
    ? { status, resolved_at: new Date().toISOString() }
    : { status }
  return directus.request(updateItem('revision_request', id, patch as never)) as Promise<RevisionRequest>
}
