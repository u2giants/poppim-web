import { productToSummary } from '@/domain/products/adapters'
import { enrichProductRowsWithBoardFields } from '@/domain/products/enrich'
import { supabaseProductToProduct } from '@/domain/products/supabaseAdapter'
import { appSchema, metadata, pim, unwrap } from '@/lib/supabaseQuery'

export interface ScheduleItem {
  id: string
  date: string
  type: 'on_shelf' | 'pps' | 'sample' | 'submission' | 'reminder'
  title: string
  context: string | null
  status: string | null
}

function asDate(value: unknown): string | null {
  return typeof value === 'string' && value.length >= 10 ? value.slice(0, 10) : null
}

function push(items: ScheduleItem[], item: ScheduleItem | null) {
  if (item?.date) items.push(item)
}

export async function fetchScheduleItems(search?: string): Promise<ScheduleItem[]> {
  const q = search?.trim().toLowerCase()
  const [productResult, sampleResult, submissionResult, reminderResult] = await Promise.all([
    pim().from('product').select('*').limit(1500),
    pim().from('product_sample').select('*').limit(500),
    pim().from('product_submission').select('*').limit(500),
    (appSchema() as any).from('notification').select('*').eq('app', 'pm').is('read_at', null).limit(500),
  ])

  const products = await enrichProductRowsWithBoardFields(unwrap<any[]>({ data: productResult.data, error: productResult.error }))
  const summaries = products.map((row) => productToSummary(supabaseProductToProduct(row)))
  const productTitles = new Map(summaries.map((product) => [product.id, product.title]))
  const items: ScheduleItem[] = []

  for (const product of summaries) {
    push(items, product.onShelfDate ? { id: `${product.id}:shelf`, date: product.onShelfDate, type: 'on_shelf', title: product.title, context: product.projectTitle, status: product.stageName } : null)
    push(items, product.ppsRequestedDate ? { id: `${product.id}:pps`, date: product.ppsRequestedDate, type: 'pps', title: product.title, context: product.licensorName ?? product.retailerName, status: product.lifecycleState } : null)
  }

  for (const row of unwrap<any[]>({ data: sampleResult.data, error: sampleResult.error })) {
    const meta = metadata(row)
    push(items, {
      id: `sample:${row.id}`,
      date: asDate(row.received_at) ?? asDate(meta.expected_at) ?? asDate(row.requested_at) ?? '',
      type: 'sample',
      title: productTitles.get(row.product_id) ?? 'Product sample',
      context: typeof row.sample_type === 'string' ? row.sample_type : null,
      status: row.status ?? null,
    })
  }

  for (const row of unwrap<any[]>({ data: submissionResult.data, error: submissionResult.error })) {
    const meta = metadata(row)
    push(items, {
      id: `submission:${row.id}`,
      date: asDate(meta.expected_response_at) ?? asDate(row.submitted_at) ?? '',
      type: 'submission',
      title: productTitles.get(row.product_id) ?? 'Product submission',
      context: typeof meta.submission_type === 'string' ? meta.submission_type : null,
      status: row.status ?? null,
    })
  }

  for (const row of unwrap<any[]>({ data: reminderResult.data, error: reminderResult.error })) {
    const meta = metadata(row)
    push(items, {
      id: `reminder:${row.id}`,
      date: asDate(meta.due_at) ?? asDate(row.created_at) ?? '',
      type: 'reminder',
      title: row.title ?? 'Reminder',
      context: row.target_table ?? null,
      status: typeof meta.status === 'string' ? meta.status : 'open',
    })
  }

  return items
    .filter((item) => !q || [item.title, item.context, item.status, item.type].filter(Boolean).join(' ').toLowerCase().includes(q))
    .sort((a, b) => a.date.localeCompare(b.date))
}
