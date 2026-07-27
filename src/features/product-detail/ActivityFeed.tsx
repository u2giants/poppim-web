import { useEffect, useRef, useState } from 'react'
import { Send } from 'lucide-react'
import { addComment, listComments, listProductUpdates, userInitials, userName } from '@/features/board/collab'
import { reportOptionalDataError, reportUiError } from '@/lib/uiError'
import type { Comment, ProductUpdate } from '@/lib/types'
import { avatarColor, timeAgo } from './formatters'

interface CommentSubmissionDependencies {
  add: typeof addComment
  reload: typeof listComments
  reportFailure: typeof reportUiError
}

export async function submitCommentDraft(
  productId: string,
  draft: string,
  dependencies: CommentSubmissionDependencies = {
    add: addComment,
    reload: listComments,
    reportFailure: reportUiError,
  },
): Promise<{ draft: string; comments: Comment[] | null }> {
  const text = draft.trim()
  try {
    await dependencies.add(productId, text)
    return { draft: '', comments: await dependencies.reload(productId) }
  } catch (error) {
    dependencies.reportFailure('productDetail.addComment', 'The comment could not be posted. Your draft was kept.', error)
    return { draft, comments: null }
  }
}

export function ActivityFeed({ productId }: { productId: string }) {
  const [comments, setComments] = useState<Comment[]>([])
  const [updates, setUpdates] = useState<ProductUpdate[]>([])
  const [draft, setDraft] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const feedRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let current = true
    Promise.all([listComments(productId), listProductUpdates(productId)])
      .then(([freshComments, freshUpdates]) => {
        if (!current) return
        setComments(freshComments)
        setUpdates(freshUpdates)
      })
      .catch((error) => reportOptionalDataError('productDetail.loadUpdates', 'Comments and updates', error))
    return () => { current = false }
  }, [productId])

  async function submit() {
    const text = draft.trim()
    if (!text || submitting) return
    setSubmitting(true)
    const result = await submitCommentDraft(productId, draft)
    setDraft(result.draft)
    if (result.comments) {
      setComments(result.comments)
      setTimeout(() => feedRef.current?.scrollTo({ top: feedRef.current.scrollHeight, behavior: 'smooth' }), 50)
    }
    setSubmitting(false)
  }

  return (
    <>
      <div ref={feedRef} className="flex-1 space-y-4 overflow-y-auto px-6 py-4">
        {comments.length === 0 && updates.length === 0 && <p className="text-[13px]" style={{ color: '#94A0B5' }}>No activity yet.</p>}
        {updates.map((update) => {
          const name = update.author_name || update.author_email || 'ClickUp'
          return (
            <div key={update.id} className="flex gap-2.5">
              <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white" style={{ background: avatarColor(name) }}>
                {name.split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('') || 'CU'}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-[13px] font-semibold" style={{ color: '#1B2840' }}>{name}</span>
                  <span className="text-[12px]" style={{ color: '#94A0B5' }}>{update.happened_at ? timeAgo(update.happened_at) : 'ClickUp'}</span>
                </div>
                <p className="mt-0.5 whitespace-pre-wrap text-[13px] leading-relaxed" style={{ color: '#5A6883' }}>{update.body}</p>
              </div>
            </div>
          )
        })}
        {comments.map((comment) => {
          const name = userName(comment.user_created)
          return (
            <div key={comment.id} className="flex gap-2.5">
              <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white" style={{ background: avatarColor(name) }}>
                {userInitials(comment.user_created)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-[13px] font-semibold" style={{ color: '#1B2840' }}>{name}</span>
                  <span className="text-[12px]" style={{ color: '#94A0B5' }}>{timeAgo(comment.date_created)}</span>
                </div>
                <p className="mt-0.5 text-[13px] leading-relaxed" style={{ color: '#5A6883' }}>{comment.comment}</p>
              </div>
            </div>
          )
        })}
      </div>
      <div className="shrink-0 px-6 py-4" style={{ borderTop: '1px solid #EAEEF5' }}>
        <div className="relative">
          <textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => { if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) submit() }}
            placeholder="Write a comment… (⌘↵ to send)"
            rows={3}
            className="w-full resize-none rounded-xl border px-4 py-3 pr-10 text-[13.5px] outline-none transition-colors placeholder:text-[#94A0B5]"
            style={{ borderColor: '#EAEEF5', color: '#1B2840', background: '#fff' }}
            onFocus={(event) => { event.currentTarget.style.borderColor = '#0094FF' }}
            onBlur={(event) => { event.currentTarget.style.borderColor = '#EAEEF5' }}
          />
          <button onClick={submit} disabled={!draft.trim() || submitting} className="absolute right-3 bottom-3 flex items-center justify-center rounded-lg p-1.5 transition-colors disabled:opacity-30" style={{ background: draft.trim() ? '#0094FF' : 'transparent', color: draft.trim() ? '#fff' : '#94A0B5' }}>
            <Send className="size-3.5" />
          </button>
        </div>
      </div>
    </>
  )
}
