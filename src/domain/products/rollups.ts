import { appUserToPerson } from './adapters'
import type { PersonSummary, ProductSummary } from './types'
import { appSchema, pim, unwrap } from '@/lib/supabaseQuery'
import type { AppUser } from '@/lib/types'

const ROLLUP_BATCH_SIZE = 200

interface ProductFileCoverCandidate {
  product_id: string | null
  metadata?: Record<string, unknown> | null
  source_url: string | null
  thumbnail_url: string | null
  stored_url: string | null
}

function chunks<T>(values: T[], size: number): T[][] {
  const result: T[][] = []
  for (let i = 0; i < values.length; i += size) result.push(values.slice(i, i + size))
  return result
}

function fileHref(file: ProductFileCoverCandidate): string | null {
  return file.stored_url || file.source_url || file.thumbnail_url || null
}

function filePreviewUrl(file: ProductFileCoverCandidate): string | null {
  const mime = typeof file.metadata?.mime_type === 'string' ? file.metadata.mime_type : null
  if (file.thumbnail_url?.includes('digitaloceanspaces.com')) return file.thumbnail_url
  if (mime?.startsWith('image/') && file.stored_url) return file.stored_url
  if (file.thumbnail_url) return file.thumbnail_url
  if (mime?.startsWith('image/')) return fileHref(file)
  return null
}

function profileToUser(row: any): AppUser {
  const parts = (row.display_name ?? '').trim().split(/\s+/).filter(Boolean)
  return {
    id: row.id,
    first_name: row.first_name ?? parts[0] ?? null,
    last_name: row.last_name ?? (parts.length > 1 ? parts.slice(1).join(' ') : null),
    email: row.email ?? null,
    avatar: row.avatar_url ?? null,
    role: null,
  }
}

function increment(map: Map<string, number>, id: string | null) {
  if (!id) return
  map.set(id, (map.get(id) ?? 0) + 1)
}

export async function hydrateProductSummaryRollups(products: ProductSummary[]): Promise<ProductSummary[]> {
  const ids = products.map((product) => product.id)
  if (ids.length === 0) return products

  const rollups = await Promise.all(chunks(ids, ROLLUP_BATCH_SIZE).map(async (batch) => {
    const [assigneeResult, checklistResult, fileResult, commentResult] = await Promise.all([
      (pim() as any)
        .from('product_assignee')
        .select('product_id,profile:profile_id(id,display_name,email,avatar_url)')
        .in('product_id', batch),
      (pim() as any)
        .from('checklist_item')
        .select('product_id,status')
        .in('product_id', batch),
      (pim() as any)
        .from('product_file')
        .select('product_id,stored_url,source_url,thumbnail_url,metadata')
        .in('product_id', batch)
        .order('created_at'),
      (appSchema() as any)
        .from('comment')
        .select('target_id')
        .eq('target_schema', 'pim')
        .eq('target_table', 'product')
        .in('target_id', batch),
    ])
    return {
      assigneeRows: unwrap<any[]>({ data: assigneeResult.data, error: assigneeResult.error }),
      checklistRows: unwrap<Array<{ product_id: string | null; status: string | null }>>({ data: checklistResult.data, error: checklistResult.error }),
      fileRows: unwrap<ProductFileCoverCandidate[]>({ data: fileResult.data, error: fileResult.error }),
      commentRows: unwrap<Array<{ target_id: string | null }>>({ data: commentResult.data, error: commentResult.error }),
    }
  }))

  const assignees = new Map<string, PersonSummary[]>()
  const checklist = new Map<string, number>()
  const completedChecklist = new Map<string, number>()
  const files = new Map<string, number>()
  const comments = new Map<string, number>()
  const autoCovers = new Map<string, { coverUrl: string; coverThumbUrl?: string }>()

  for (const rollup of rollups) {
    for (const row of rollup.assigneeRows) {
      const person = row.profile ? appUserToPerson(profileToUser(row.profile)) : null
      if (!row.product_id || !person) continue
      ;(assignees.get(row.product_id) ?? assignees.set(row.product_id, []).get(row.product_id)!).push(person)
    }
    for (const row of rollup.checklistRows) {
      increment(checklist, row.product_id)
      if ((row.status ?? '').toLowerCase() === 'done') increment(completedChecklist, row.product_id)
    }
    for (const row of rollup.fileRows) {
      increment(files, row.product_id)
      if (!row.product_id || autoCovers.has(row.product_id)) continue
      const preview = filePreviewUrl(row)
      if (!preview) continue
      autoCovers.set(row.product_id, { coverUrl: fileHref(row) ?? preview, coverThumbUrl: preview })
    }
    for (const row of rollup.commentRows) increment(comments, row.target_id)
  }

  return products.map((product) => {
    const autoCover = product.coverUrl ? null : autoCovers.get(product.id)
    return {
      ...product,
      assignees: assignees.get(product.id) ?? product.assignees,
      checklist: {
        done: completedChecklist.get(product.id) ?? product.checklist.done,
        total: checklist.get(product.id) ?? product.checklist.total,
      },
      comments: comments.get(product.id) ?? product.comments,
      files: files.get(product.id) ?? product.files,
      coverUrl: product.coverUrl ?? autoCover?.coverUrl,
      coverThumbUrl: product.coverThumbUrl ?? autoCover?.coverThumbUrl,
    }
  })
}
