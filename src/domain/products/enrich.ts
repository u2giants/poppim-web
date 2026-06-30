import { api, unwrap } from '@/lib/supabaseQuery'

type ProductLikeRow = Record<string, unknown> & { id?: string | null; metadata?: unknown }

const BOARD_ENRICH_BATCH_SIZE = 100

export async function enrichProductRowsWithBoardFields<T extends ProductLikeRow>(rows: T[]): Promise<Array<T & Record<string, unknown>>> {
  const ids = rows.map((row) => row.id).filter((id): id is string => typeof id === 'string' && id.length > 0)
  if (ids.length === 0) return rows

  const boardById = new Map<string, Record<string, unknown>>()
  for (let i = 0; i < ids.length; i += BOARD_ENRICH_BATCH_SIZE) {
    const batch = ids.slice(i, i + BOARD_ENRICH_BATCH_SIZE)
    const result = await (api() as any).from('pm_product_board').select('*').in('id', batch)
    for (const row of unwrap<Array<Record<string, unknown>>>({ data: result.data, error: result.error })) {
      if (typeof row.id === 'string') boardById.set(row.id, row)
    }
  }

  return rows.map((row) => ({
    ...row,
    ...(typeof row.id === 'string' ? boardById.get(row.id) ?? {} : {}),
    metadata: row.metadata,
  }))
}
