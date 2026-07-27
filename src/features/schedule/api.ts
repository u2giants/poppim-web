import { api, asDynamic } from '@/lib/supabaseQuery'
import type { BusinessUnit } from '@/domain/products/types'
import { unwrap } from '@/lib/supabaseQuery'

export interface ScheduleItem {
  id: string
  date: string
  type: 'on_shelf' | 'pps' | 'sample' | 'submission' | 'reminder'
  title: string
  context: string | null
  status: string | null
}

interface ScheduleRpcRow {
  id: string; event_date: string; kind: ScheduleItem['type']
  title: string; context: string | null; status: string | null
}

export async function fetchScheduleItems(opts: {
  search?: string
  businessUnit: BusinessUnit
  start: string
  end: string
}): Promise<ScheduleItem[]> {
  const { data, error } = await asDynamic(api()).rpc('pm_schedule_page', {
    p_business_unit: opts.businessUnit,
    p_start: opts.start,
    p_end: opts.end,
    p_search: opts.search?.trim() || null,
    p_after_date: null,
    p_after_id: null,
    p_limit: 100,
  })
  return unwrap<ScheduleRpcRow[]>({ data, error }).map((row) => ({
    id: row.id, date: row.event_date, type: row.kind,
    title: row.title, context: row.context, status: row.status,
  }))
}
