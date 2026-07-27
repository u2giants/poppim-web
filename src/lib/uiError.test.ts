import { describe, expect, it, vi } from 'vitest'
import { errorMessage, pageLoadFailure, reportOptionalDataError } from './uiError'

const { warning, error } = vi.hoisted(() => ({ warning: vi.fn(), error: vi.fn() }))
vi.mock('sonner', () => ({ toast: { warning, error } }))

describe('UI error reporting', () => {
  it('does not expose non-Error values as user-facing detail', () => {
    expect(errorMessage({ secret: 'value' }, 'Safe message')).toBe('Safe message')
  })

  it('warns without throwing when optional supporting data fails', () => {
    reportOptionalDataError('screen.optional', 'Supporting counts', new Error('offline'))
    expect(warning).toHaveBeenCalledWith(
      'Supporting counts could not be loaded. The rest of the page is still available.',
    )
  })

  it('restores pagination after a load-more failure', () => {
    const restore = vi.fn()
    pageLoadFailure('records.loadMore', 'More records', 'opaque-cursor', restore)(new Error('offline'))
    expect(restore).toHaveBeenCalledWith('opaque-cursor')
  })
})
