import { beforeEach, describe, expect, it, vi } from 'vitest'
import { cachedReference, clearReferenceCache } from './referenceCache'

describe('cachedReference', () => {
  beforeEach(() => clearReferenceCache())

  it('loads once and shares the result within the TTL', async () => {
    const load = vi.fn().mockResolvedValue(['a'])
    expect(await cachedReference('k', load)).toEqual(['a'])
    expect(await cachedReference('k', load)).toEqual(['a'])
    expect(load).toHaveBeenCalledTimes(1)
  })

  it('shares one in-flight request between concurrent callers', async () => {
    const load = vi.fn().mockResolvedValue(['a'])
    await Promise.all([cachedReference('k', load), cachedReference('k', load)])
    expect(load).toHaveBeenCalledTimes(1)
  })

  it('does not cache failures', async () => {
    const load = vi.fn()
      .mockRejectedValueOnce(new Error('boom'))
      .mockResolvedValue(['a'])
    await expect(cachedReference('k', load)).rejects.toThrow('boom')
    expect(await cachedReference('k', load)).toEqual(['a'])
    expect(load).toHaveBeenCalledTimes(2)
  })

  it('reloads after the TTL expires', async () => {
    const load = vi.fn().mockResolvedValue(['a'])
    await cachedReference('k', load, 0)
    await cachedReference('k', load, 0)
    expect(load).toHaveBeenCalledTimes(2)
  })
})
