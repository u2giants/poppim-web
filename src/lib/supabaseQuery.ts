import { supabase } from './supabase'

export function api() {
  return supabase.schema('api') as never
}

export function pim() {
  return (supabase as any).schema('pim')
}

export function core() {
  return supabase.schema('core') as never
}

export function appSchema() {
  return supabase.schema('app') as never
}

export function unwrap<T>(result: { data: T | null; error: { message?: string } | null }): T {
  if (result.error) throw new Error(result.error.message ?? 'Supabase request failed')
  return result.data as T
}

export function metadata(row: { metadata?: unknown }): Record<string, unknown> {
  return row.metadata && typeof row.metadata === 'object' && !Array.isArray(row.metadata)
    ? row.metadata as Record<string, unknown>
    : {}
}

export function textMeta(row: { metadata?: unknown }, key: string): string | null {
  const value = metadata(row)[key]
  return typeof value === 'string' ? value : null
}

export function numberMeta(row: { metadata?: unknown }, key: string): number | string | null {
  const value = metadata(row)[key]
  return typeof value === 'number' || typeof value === 'string' ? value : null
}

export function boolFromStatus(status: string | null | undefined, doneValue = 'done') {
  return (status ?? '').toLowerCase() === doneValue
}
