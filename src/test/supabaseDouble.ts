export interface QueryCall {
  method: string
  args: unknown[]
}

export interface QueryResult<T = unknown> {
  data: T
  error: { message: string } | null
}

export function queryDouble<T>(
  result: QueryResult<T>,
  calls: QueryCall[] = [],
) {
  const query: Record<string, unknown> = {}
  const methods = [
    'select',
    'order',
    'limit',
    'range',
    'eq',
    'in',
    'or',
    'ilike',
    'gte',
    'is',
    'maybeSingle',
    'single',
    'insert',
    'update',
    'delete',
  ]

  for (const method of methods) {
    query[method] = (...args: unknown[]) => {
      calls.push({ method, args })
      return query
    }
  }

  query.then = (
    resolve: (value: QueryResult<T>) => unknown,
    reject?: (reason: unknown) => unknown,
  ) => Promise.resolve(result).then(resolve, reject)

  return query
}

export function schemaDouble(
  results: Record<string, QueryResult | QueryResult[]>,
  callsByTable: Record<string, QueryCall[]> = {},
) {
  const queues = new Map(
    Object.entries(results).map(([table, value]) => [
      table,
      Array.isArray(value) ? [...value] : [value],
    ]),
  )

  return {
    from(table: string) {
      const calls = callsByTable[table] ?? (callsByTable[table] = [])
      const queue = queues.get(table) ?? []
      const result = queue.shift() ?? { data: [], error: null }
      return queryDouble(result, calls)
    },
  }
}
