/**
 * Short-lived in-memory cache for reference lookups (stages, licensors,
 * product types, the customer list). These change rarely but were refetched in
 * full every time a product detail modal opened, which cost four round trips
 * per card click. In-flight promises are shared, so concurrent callers issue a
 * single request.
 */
const DEFAULT_TTL_MS = 5 * 60 * 1000

interface Entry<T> {
  expiresAt: number
  value: Promise<T>
}

const entries = new Map<string, Entry<unknown>>()

export function cachedReference<T>(key: string, load: () => Promise<T>, ttlMs = DEFAULT_TTL_MS): Promise<T> {
  const now = Date.now()
  const existing = entries.get(key)
  if (existing && existing.expiresAt > now) return existing.value as Promise<T>

  const value = load().catch((error: unknown) => {
    // Never cache a failure: the next caller should retry.
    entries.delete(key)
    throw error
  })
  entries.set(key, { expiresAt: now + ttlMs, value })
  return value
}

export function clearReferenceCache() {
  entries.clear()
}
