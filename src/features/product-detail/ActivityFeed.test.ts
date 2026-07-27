import { describe, expect, it, vi } from 'vitest'
import { submitCommentDraft } from './ActivityFeed'

vi.mock('@/features/board/collab', () => ({
  addComment: vi.fn(),
  listComments: vi.fn(),
  listProductUpdates: vi.fn(),
  userInitials: vi.fn(),
  userName: vi.fn(),
}))

vi.mock('@/lib/uiError', () => ({
  reportOptionalDataError: vi.fn(),
  reportUiError: vi.fn(),
}))

describe('comment submission', () => {
  it('keeps the authored draft and reports the failure when posting fails', async () => {
    const error = new Error('network unavailable')
    const add = vi.fn().mockRejectedValue(error)
    const reload = vi.fn()
    const reportFailure = vi.fn()

    const result = await submitCommentDraft('product-1', '  Keep this draft  ', {
      add,
      reload,
      reportFailure,
    })

    expect(add).toHaveBeenCalledWith('product-1', 'Keep this draft')
    expect(reload).not.toHaveBeenCalled()
    expect(reportFailure).toHaveBeenCalledWith(
      'productDetail.addComment',
      'The comment could not be posted. Your draft was kept.',
      error,
    )
    expect(result).toEqual({ draft: '  Keep this draft  ', comments: null })
  })
})
