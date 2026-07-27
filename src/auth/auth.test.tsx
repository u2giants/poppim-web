import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { createAuthRequestGuard } from './authRequestGuard'

describe('authentication characterization', () => {
  it('profile network or RLS failure produces an explicit retry state instead of an auth-id fallback user', () => {
    const source = readFileSync(new URL('./auth.tsx', import.meta.url), 'utf8')

    expect(source).not.toMatch(/catch\s*\{[\s\S]*return fallbackUser/)
    expect(source).toMatch(/profileError|profile_error|retry/i)
  })

  it('a session without a mapped profile is not admitted with the auth UUID', () => {
    const source = readFileSync(new URL('./auth.tsx', import.meta.url), 'utf8')

    expect(source).not.toMatch(/if\s*\(!profile\?\.id\)\s*return fallbackUser\(session\.user\.id/)
  })

  it('rejects stale profile completions after a newer token refresh starts', () => {
    const guard = createAuthRequestGuard()
    const initial = guard.begin()
    const tokenRefresh = guard.begin()

    expect(guard.isCurrent(initial)).toBe(false)
    expect(guard.isCurrent(tokenRefresh)).toBe(true)
  })

  it('rejects all profile completions after unmount', () => {
    const guard = createAuthRequestGuard()
    const pending = guard.begin()
    guard.unmount()

    expect(guard.isCurrent(pending)).toBe(false)
  })
})
