import { useEffect, useRef, useState } from 'react'
import type { MockTask } from '@/lib/mockData'
import { LICENSOR_META, STAGE_COLORS, CATEGORY_ICONS } from '@/lib/mockData'
import { stageColor } from '@/features/pipeline/adapter'
import { X, Send } from 'lucide-react'
import type { Comment, ProductAssignee } from '@/lib/types'
import { listComments, addComment, listAssignees, userName, userInitials } from '@/features/board/collab'

// ─── Helpers ────────────────────────────────────────────────────────────────

function timeAgo(iso: string): string {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  if (diff < 7 * 86400) return `${Math.floor(diff / 86400)}d ago`
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function avatarColor(seed: string): string {
  const COLORS = ['#4F9DF7','#6B54C9','#3F9A50','#D24B83','#DB6645','#2589AB','#239281','#C8942A']
  let h = 0
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0
  return COLORS[h % COLORS.length]
}

// ─── Props ───────────────────────────────────────────────────────────────────

interface Props {
  task: MockTask | null
  onClose: () => void
}

// ─── Modal ───────────────────────────────────────────────────────────────────

export function TaskDetailModal({ task, onClose }: Props) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const [coverOk, setCoverOk] = useState(true)

  useEffect(() => {
    if (!task) return
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [task, onClose])

  // Reset the cover error flag when a different card is opened.
  useEffect(() => { setCoverOk(true) }, [task?.id])

  if (!task) return null

  const licMeta = LICENSOR_META[task.licensor]
  const resolvedStageColors = STAGE_COLORS[task.stage] ?? stageColor(task.stage)

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(20,40,80,0.45)' }}
      onClick={(e) => { if (e.target === overlayRef.current) onClose() }}
    >
      <div
        className="flex overflow-hidden"
        style={{
          width: 'min(1080px, 95vw)',
          height: 'min(750px, 92vh)',
          borderRadius: 16,
          background: '#fff',
          boxShadow: '0 24px 64px -16px rgba(20,40,80,0.40)',
        }}
      >
        {/* ── Left pane ── */}
        <div className="flex min-w-0 flex-1 flex-col overflow-y-auto">
          {/* Top bar */}
          <div className="flex shrink-0 items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid #EAEEF5' }}>
            <span className="text-[13px]" style={{ color: '#5A6883' }}>
              {task.licensor} / {task.stage}
            </span>
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="flex items-center justify-center rounded-lg p-1.5 transition-colors hover:bg-[#F6F8FC]"
              >
                <X className="size-5" style={{ color: '#5A6883' }} />
              </button>
            </div>
          </div>

          {/* Task type chip */}
          <div className="px-6 pt-5">
            <span
              className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[12px] font-semibold"
              style={{ background: '#F6F8FC', color: '#5A6883' }}
            >
              <span>{CATEGORY_ICONS[task.category] ?? '📦'}</span>
              Product
            </span>
          </div>

          {/* Title */}
          <h2
            className="px-6 pt-3 font-extrabold leading-tight"
            style={{ fontSize: 25, color: '#1B2840', letterSpacing: '-0.02em' }}
          >
            {task.title}
          </h2>

          {/* Full-size cover (the board shows a thumbnail; here we load the original) */}
          {task.coverUrl && coverOk && (
            <div className="px-6 pt-5">
              <img
                src={task.coverUrl}
                alt=""
                className="max-h-[420px] w-full rounded-xl object-contain"
                style={{ background: '#F6F8FC' }}
                onError={() => setCoverOk(false)}
              />
            </div>
          )}

          {/* Fields grid */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-4 px-6 pt-5">
            <ModalField label="Status">
              <span
                className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[12.5px] font-semibold capitalize"
                style={{ background: resolvedStageColors.bg, color: '#1B2840' }}
              >
                <span className="size-2 rounded-full shrink-0" style={{ background: resolvedStageColors.dot }} />
                {task.stage}
              </span>
            </ModalField>

            <ModalField label="Licensor">
              {licMeta ? (
                <div
                  className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[12.5px] font-bold text-white"
                  style={{ background: licMeta.gradient }}
                >
                  {licMeta.letter} {task.licensor}
                </div>
              ) : (
                <span className="text-[13.5px] font-semibold" style={{ color: '#1B2840' }}>{task.licensor}</span>
              )}
            </ModalField>

            <ModalField label="Due">
              <span className="text-[13.5px] font-semibold" style={{ color: task.dueOver ? '#D2502B' : '#1B2840' }}>
                {task.due ?? '—'}
              </span>
            </ModalField>

            <ModalField label="Category">
              <span className="text-[13.5px] font-semibold capitalize" style={{ color: '#1B2840' }}>
                {task.category}
              </span>
            </ModalField>
          </div>

          {/* Assignees (loaded from API) */}
          <div className="px-6 pt-5">
            <AssigneesField productId={task.id} />
          </div>

          {/* Spacer */}
          <div className="flex-1 px-6 pb-6" />
        </div>

        {/* ── Right pane: Activity ── */}
        <div className="flex w-[374px] shrink-0 flex-col" style={{ borderLeft: '1px solid #EAEEF5' }}>
          <div className="shrink-0 px-6 py-4" style={{ borderBottom: '1px solid #EAEEF5' }}>
            <h3 className="text-[15px] font-bold" style={{ color: '#1B2840' }}>Activity</h3>
          </div>
          <ActivityFeed productId={task.id} />
        </div>
      </div>
    </div>
  )
}

// ─── Assignees ───────────────────────────────────────────────────────────────

function AssigneesField({ productId }: { productId: string }) {
  const [rows, setRows] = useState<ProductAssignee[]>([])

  useEffect(() => {
    listAssignees(productId).then(setRows).catch(() => setRows([]))
  }, [productId])

  if (rows.length === 0) return (
    <ModalField label="Assignees">
      <span className="text-[13px]" style={{ color: '#94A0B5' }}>—</span>
    </ModalField>
  )

  return (
    <ModalField label="Assignees">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex">
          {rows.slice(0, 5).map((r, i) => {
            const initials = userInitials(r.directus_user)
            const name = userName(r.directus_user)
            return (
              <div
                key={r.id}
                className="flex size-7 shrink-0 items-center justify-center rounded-full border-2 border-white text-[10px] font-bold text-white"
                style={{ background: avatarColor(name), marginLeft: i === 0 ? 0 : -8, position: 'relative', zIndex: 5 - i }}
                title={name}
              >
                {initials}
              </div>
            )
          })}
        </div>
        <span className="text-[13px]" style={{ color: '#1B2840' }}>
          {rows.map((r) => userName(r.directus_user).split(' ')[0]).join(', ')}
        </span>
      </div>
    </ModalField>
  )
}

// ─── Activity feed ───────────────────────────────────────────────────────────

function ActivityFeed({ productId }: { productId: string }) {
  const [comments, setComments] = useState<Comment[]>([])
  const [draft, setDraft] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const feedRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    listComments(productId).then(setComments).catch(() => setComments([]))
  }, [productId])

  async function submit() {
    const text = draft.trim()
    if (!text || submitting) return
    setSubmitting(true)
    try {
      await addComment(productId, text)
      setDraft('')
      const fresh = await listComments(productId)
      setComments(fresh)
      setTimeout(() => feedRef.current?.scrollTo({ top: feedRef.current.scrollHeight, behavior: 'smooth' }), 50)
    } catch {
      // silent — comment not posted
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <div ref={feedRef} className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {comments.length === 0 && (
          <p className="text-[13px]" style={{ color: '#94A0B5' }}>No activity yet.</p>
        )}
        {comments.map((c) => {
          const name = userName(c.user_created)
          const initials = userInitials(c.user_created)
          return (
            <div key={c.id} className="flex gap-2.5">
              <div
                className="flex size-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white mt-0.5"
                style={{ background: avatarColor(name) }}
              >
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-[13px] font-semibold" style={{ color: '#1B2840' }}>{name}</span>
                  <span className="text-[12px]" style={{ color: '#94A0B5' }}>{timeAgo(c.date_created)}</span>
                </div>
                <p className="mt-0.5 text-[13px] leading-relaxed" style={{ color: '#5A6883' }}>{c.comment}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Composer */}
      <div className="shrink-0 px-6 py-4" style={{ borderTop: '1px solid #EAEEF5' }}>
        <div className="relative">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) submit() }}
            placeholder="Write a comment… (⌘↵ to send)"
            rows={3}
            className="w-full resize-none rounded-xl border px-4 py-3 pr-10 text-[13.5px] outline-none transition-colors placeholder:text-[#94A0B5]"
            style={{ borderColor: '#EAEEF5', color: '#1B2840', background: '#fff' }}
            onFocus={(e) => { (e.currentTarget as HTMLElement).style.borderColor = '#0094FF' }}
            onBlur={(e) => { (e.currentTarget as HTMLElement).style.borderColor = '#EAEEF5' }}
          />
          <button
            onClick={submit}
            disabled={!draft.trim() || submitting}
            className="absolute bottom-3 right-3 flex items-center justify-center rounded-lg p-1.5 transition-colors disabled:opacity-30"
            style={{ background: draft.trim() ? '#0094FF' : 'transparent', color: draft.trim() ? '#fff' : '#94A0B5' }}
          >
            <Send className="size-3.5" />
          </button>
        </div>
      </div>
    </>
  )
}

// ─── Helper ──────────────────────────────────────────────────────────────────

function ModalField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-1 text-[12px] font-medium" style={{ color: '#0094FF' }}>{label}</div>
      <div>{children}</div>
    </div>
  )
}
