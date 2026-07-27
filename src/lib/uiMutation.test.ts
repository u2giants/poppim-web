import { describe, expect, it, vi } from 'vitest'
import { runUiMutation } from './uiMutation'

vi.mock('sonner', () => ({ toast: { error: vi.fn(), success: vi.fn() } }))

describe('runUiMutation', () => {
  it('rolls back and returns null when the write fails', async () => {
    const optimistic = vi.fn()
    const rollback = vi.fn()
    const result = await runUiMutation({
      operation: 'test.save',
      optimistic,
      execute: () => Promise.reject(new Error('denied')),
      rollback,
      failureMessage: 'Save failed',
    })
    expect(result).toBeNull()
    expect(optimistic).toHaveBeenCalledOnce()
    expect(rollback).toHaveBeenCalledOnce()
  })

  it('keeps optimistic state when the write succeeds', async () => {
    const rollback = vi.fn()
    const result = await runUiMutation({
      operation: 'test.save',
      optimistic: vi.fn(),
      execute: () => Promise.resolve('saved'),
      rollback,
      failureMessage: 'Save failed',
    })
    expect(result).toBe('saved')
    expect(rollback).not.toHaveBeenCalled()
  })
})
