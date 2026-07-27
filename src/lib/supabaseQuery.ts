import { supabase } from './supabase'

interface DynamicResult {
  data: unknown
  error: { message?: string } | null
}

/**
 * Narrow escape hatch for shared-backend objects that are not represented
 * precisely by the generated Supabase client (principally JSON-heavy RPCs).
 * Results remain unknown until each feature validates/maps its own row shape.
 */
export interface DynamicQuery extends PromiseLike<DynamicResult> {
  from(relation: string): DynamicQuery
  rpc(name: string, args?: Record<string, unknown>): DynamicQuery
  select(columns?: string): DynamicQuery
  insert(values: unknown): DynamicQuery
  update(values: unknown): DynamicQuery
  delete(): DynamicQuery
  eq(column: string, value: unknown): DynamicQuery
  neq(column: string, value: unknown): DynamicQuery
  in(column: string, values: readonly unknown[]): DynamicQuery
  is(column: string, value: unknown): DynamicQuery
  or(filters: string, options?: Record<string, unknown>): DynamicQuery
  order(column: string, options?: Record<string, unknown>): DynamicQuery
  limit(count: number): DynamicQuery
  range(from: number, to: number): DynamicQuery
  single(): DynamicQuery
  maybeSingle(): DynamicQuery
}

export function asDynamic(value: unknown): DynamicQuery {
  return value as DynamicQuery
}

export function dynamicApi(): DynamicQuery {
  return asDynamic(api())
}

export function dynamicApp(): DynamicQuery {
  return appSchema() as unknown as DynamicQuery
}

export function dynamicCore(): DynamicQuery {
  return core() as unknown as DynamicQuery
}

export function dynamicPim(): DynamicQuery {
  return pim() as unknown as DynamicQuery
}

export function api() {
  return supabase.schema('api')
}

export function pim() {
  return supabase.schema('pim')
}

export function core() {
  return supabase.schema('core')
}

export function appSchema() {
  return supabase.schema('app')
}

export function unwrap<T>(result: { data: T | null; error: { message?: string } | null }): T
export function unwrap<T = unknown>(result: { data: unknown; error: { message?: string } | null }): T
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
