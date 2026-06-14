import { useEffect, useRef, useState } from 'react'
import type { ProductSummary } from '@/domain/products/types'
import { CATEGORY_ICONS, LICENSOR_META, STAGE_COLORS, stageColor } from '@/domain/products/presentation'
import { ClipboardCheck, ExternalLink, FilePenLine, FileText, FlaskConical, History, MessageSquare, Paperclip, Send, Tags, X } from 'lucide-react'
import type {
  Comment,
  Product,
  ProductActivity,
  ProductAssignee,
  ProductField,
  ProductFile,
  ProductLink,
  Subtask,
  ProductTag,
  ProductTimeEntry,
  ProductUpdate,
} from '@/lib/types'
import {
  listComments,
  addComment,
  listAssignees,
  listChecklist,
  listSubtasks,
  setChecklistDone,
  setSubtaskDone,
  userName,
  userInitials,
  listProductActivity,
  listProductFields,
  listProductFiles,
  listProductLinks,
  listProductTags,
  listProductTimeEntries,
  listProductUpdates,
} from '@/features/board/collab'
import {
  createRevisionForProduct,
  createSampleForProduct,
  createSubmissionForProduct,
} from '@/features/workflow/api'

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

function formatDate(iso?: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function fileSize(bytes: number | null): string {
  if (!bytes) return ''
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function productLabel(product: Product | string | null): string | null {
  if (!product || typeof product === 'string') return null
  return [product.code, product.name].filter(Boolean).join(' · ')
}

// ─── Props ───────────────────────────────────────────────────────────────────

interface Props {
  task: ProductSummary | null
  onClose: () => void
}

// ─── Modal ───────────────────────────────────────────────────────────────────

export function TaskDetailModal({ task, onClose }: Props) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const [coverFailedFor, setCoverFailedFor] = useState<string | null>(null)
  const [tab, setTab] = useState<'updates' | 'files' | 'fields' | 'activity'>('updates')
  const [actionBusy, setActionBusy] = useState<string | null>(null)
  const [actionMessage, setActionMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!task) return
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [task, onClose])

  if (!task) return null

  const licMeta = task.licensorName ? LICENSOR_META[task.licensorName] : null
  const resolvedStageColors = STAGE_COLORS[task.stageName] ?? stageColor(task.stageName)
  const product = task.raw

  async function runWorkflowAction(kind: 'submission' | 'sample' | 'revision') {
    if (actionBusy) return
    setActionBusy(kind)
    setActionMessage(null)
    try {
      if (kind === 'submission') {
        await createSubmissionForProduct(product)
        setActionMessage('Submission record created.')
      } else if (kind === 'sample') {
        await createSampleForProduct(product)
        setActionMessage('Sample request created.')
      } else {
        await createRevisionForProduct(product)
        setActionMessage('Revision request created.')
      }
    } catch (error) {
      console.error(error)
      setActionMessage('Action could not be saved.')
    } finally {
      setActionBusy(null)
    }
  }

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
              {[task.businessUnit, task.retailerName, task.buyerName].filter(Boolean).join(' / ') || 'Product'}
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
              <span>{CATEGORY_ICONS[task.category] ?? 'PRD'}</span>
              {task.businessUnit === 'Generic' ? 'Style-numbered product' : 'Product / SKU'}
            </span>
          </div>

          {/* Title */}
          <h2
            className="px-6 pt-3 font-extrabold leading-tight"
            style={{ fontSize: 25, color: '#1B2840', letterSpacing: '-0.02em' }}
          >
            {task.title}
          </h2>

          <div className="px-6 pt-4">
            <div className="flex flex-wrap items-center gap-2">
              <WorkflowActionButton
                icon={<ClipboardCheck className="size-3.5" />}
                label="Create submission"
                loading={actionBusy === 'submission'}
                disabled={Boolean(actionBusy)}
                onClick={() => runWorkflowAction('submission')}
              />
              <WorkflowActionButton
                icon={<FlaskConical className="size-3.5" />}
                label="Request sample"
                loading={actionBusy === 'sample'}
                disabled={Boolean(actionBusy)}
                onClick={() => runWorkflowAction('sample')}
              />
              <WorkflowActionButton
                icon={<FilePenLine className="size-3.5" />}
                label="Add revision"
                loading={actionBusy === 'revision'}
                disabled={Boolean(actionBusy)}
                onClick={() => runWorkflowAction('revision')}
              />
            </div>
            {actionMessage && (
              <p className="mt-2 text-[12.5px] font-semibold" style={{ color: actionMessage.includes('could not') ? '#D2502B' : '#14745D' }}>
                {actionMessage}
              </p>
            )}
          </div>

          <AttachmentGallery productId={task.id} fallbackCoverUrl={coverFailedFor === task.id ? undefined : task.coverUrl} onCoverError={() => setCoverFailedFor(task.id)} />

          {/* Fields grid */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-4 px-6 pt-5">
            <ModalField label="Status">
              <span
                className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[12.5px] font-semibold capitalize"
                style={{ background: resolvedStageColors.bg, color: '#1B2840' }}
              >
                <span className="size-2 rounded-full shrink-0" style={{ background: resolvedStageColors.dot }} />
                {task.stageName}
              </span>
            </ModalField>

            <ModalField label="Licensor">
              {licMeta ? (
                <div
                  className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[12.5px] font-bold text-white"
                  style={{ background: licMeta.gradient }}
                >
                  {licMeta.letter} {task.licensorName}
                </div>
              ) : (
                <span className="text-[13.5px] font-semibold" style={{ color: '#1B2840' }}>{task.licensorName ?? '—'}</span>
              )}
            </ModalField>

            <ModalField label="Due">
              <span className="text-[13.5px] font-semibold" style={{ color: task.dueOver ? '#D2502B' : '#1B2840' }}>
                {task.due ?? '—'}
              </span>
            </ModalField>

            <ModalField label="Product type">
              <span className="text-[13.5px] font-semibold capitalize" style={{ color: '#1B2840' }}>
                {task.productTypeName ?? task.category}
              </span>
            </ModalField>
          </div>

          <div className="grid grid-cols-2 gap-x-6 gap-y-4 px-6 pt-5">
            <ModalField label="Lifecycle">
              <span className="text-[13.5px] font-semibold capitalize" style={{ color: '#1B2840' }}>
                {task.lifecycleState ?? '—'}
              </span>
            </ModalField>
            <ModalField label="Next action">
              <span className="text-[13.5px] font-semibold" style={{ color: '#1B2840' }}>
                {task.nextAction ?? '—'}
              </span>
            </ModalField>
            <ModalField label="Waiting on">
              <span className="text-[13.5px] font-semibold" style={{ color: '#1B2840' }}>
                {task.waitingOn ?? '—'}
              </span>
            </ModalField>
            <ModalField label="Risk">
              <span className="text-[13.5px] font-semibold capitalize" style={{ color: task.riskLevel ? '#D2502B' : '#1B2840' }}>
                {task.riskLevel ?? '—'}
              </span>
            </ModalField>
          </div>

          <div className="grid grid-cols-2 gap-x-6 gap-y-4 px-6 pt-5">
            <ModalField label="Project / offer">
              <span className="text-[13.5px] font-semibold" style={{ color: '#1B2840' }}>{task.projectTitle ?? '—'}</span>
            </ModalField>
            <ModalField label="Retailer / buyer">
              <span className="text-[13.5px] font-semibold" style={{ color: '#1B2840' }}>
                {[task.retailerName, task.buyerName].filter(Boolean).join(' / ') || '—'}
              </span>
            </ModalField>
            <ModalField label="Property">
              <span className="text-[13.5px] font-semibold" style={{ color: '#1B2840' }}>{task.propertyName ?? '—'}</span>
            </ModalField>
            <ModalField label="Factory">
              <span className="text-[13.5px] font-semibold" style={{ color: '#1B2840' }}>{task.factoryName ?? '—'}</span>
            </ModalField>
            <ModalField label="Design source">
              <span className="text-[13.5px] font-semibold" style={{ color: '#1B2840' }}>
                {[task.designName, task.designCollectionName].filter(Boolean).join(' / ') || '—'}
              </span>
            </ModalField>
            <ModalField label="Brand Assurance / PI">
              <span className="text-[13.5px] font-semibold" style={{ color: '#1B2840' }}>
                {[task.brandAssuranceNumber ? `BA ${task.brandAssuranceNumber}` : null, task.piStatus ? `PI ${task.piStatus}` : null].filter(Boolean).join(' · ') || '—'}
              </span>
            </ModalField>
          </div>

          {/* Assignees (loaded from API) */}
          <div className="px-6 pt-5">
            <AssigneesField productId={task.id} />
          </div>

          <div className="px-6 pt-5">
            <ChecklistPanel productId={task.id} />
          </div>

          <div className="px-6 pt-5">
            <SubtasksPanel productId={task.id} />
          </div>

          {task.description && (
            <div className="px-6 pt-5">
              <div className="mb-2 text-[12px] font-medium" style={{ color: '#0094FF' }}>Description</div>
              <RichDescription text={task.description} />
            </div>
          )}

          <div className="px-6 pt-5">
            <ProductTags productId={task.id} />
          </div>

          <details className="mx-6 mt-5 rounded-xl border px-4 py-3" style={{ borderColor: '#EAEEF5' }}>
            <summary className="cursor-pointer text-[12px] font-bold uppercase" style={{ color: '#5A6883' }}>
              Legacy source
            </summary>
            <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-4">
              <ModalField label="ClickUp list">
                <span className="text-[13.5px] font-semibold" style={{ color: '#1B2840' }}>{task.legacy.clickupListName ?? '—'}</span>
              </ModalField>
              <ModalField label="Created in ClickUp">
                <span className="text-[13.5px] font-semibold" style={{ color: '#1B2840' }}>{formatDate(task.legacy.clickupCreatedAt)}</span>
              </ModalField>
              <ModalField label="Updated in ClickUp">
                <span className="text-[13.5px] font-semibold" style={{ color: '#1B2840' }}>{formatDate(task.legacy.clickupUpdatedAt)}</span>
              </ModalField>
              <ModalField label="ClickUp due">
                <span className="text-[13.5px] font-semibold" style={{ color: task.dueOver ? '#D2502B' : '#1B2840' }}>{formatDate(task.legacy.clickupDueAt)}</span>
              </ModalField>
            </div>
            {task.legacy.clickupUrl && (
              <div className="mt-3">
              <a
                href={task.legacy.clickupUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-[13px] font-semibold transition-colors hover:bg-[#F6F8FC]"
                style={{ borderColor: '#EAEEF5', color: '#1B2840' }}
              >
                <ExternalLink className="size-3.5" />
                Open original ClickUp task
              </a>
              </div>
            )}
          </details>

          {/* Spacer */}
          <div className="flex-1 px-6 pb-6" />
        </div>

        {/* ── Right pane: Work data ── */}
        <div className="flex w-[374px] shrink-0 flex-col" style={{ borderLeft: '1px solid #EAEEF5' }}>
          <div className="shrink-0 px-6 py-4" style={{ borderBottom: '1px solid #EAEEF5' }}>
            <h3 className="text-[15px] font-bold" style={{ color: '#1B2840' }}>Work</h3>
            <div className="mt-3 grid grid-cols-4 gap-1 rounded-lg p-1" style={{ background: '#F6F8FC' }}>
              <PaneTab active={tab === 'updates'} icon={<MessageSquare className="size-3.5" />} onClick={() => setTab('updates')} />
              <PaneTab active={tab === 'files'} icon={<Paperclip className="size-3.5" />} onClick={() => setTab('files')} />
              <PaneTab active={tab === 'fields'} icon={<FileText className="size-3.5" />} onClick={() => setTab('fields')} />
              <PaneTab active={tab === 'activity'} icon={<History className="size-3.5" />} onClick={() => setTab('activity')} />
            </div>
          </div>
          {tab === 'updates' && <ActivityFeed productId={task.id} />}
          {tab === 'files' && <FilesPane productId={task.id} />}
          {tab === 'fields' && <FieldsPane productId={task.id} />}
          {tab === 'activity' && <ActivityPane productId={task.id} />}
        </div>
      </div>
    </div>
  )
}

function PaneTab({ active, icon, onClick }: { active: boolean; icon: React.ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-8 items-center justify-center rounded-md transition-colors"
      style={{ background: active ? '#fff' : 'transparent', color: active ? '#1B2840' : '#5A6883', boxShadow: active ? '0 1px 2px rgba(20,40,80,0.08)' : 'none' }}
    >
      {icon}
    </button>
  )
}

function WorkflowActionButton({
  icon,
  label,
  loading,
  disabled,
  onClick,
}: {
  icon: React.ReactNode
  label: string
  loading: boolean
  disabled: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex h-9 items-center gap-1.5 rounded-lg border px-3 text-[12.5px] font-bold transition-colors hover:bg-[#F6F8FC] disabled:cursor-not-allowed disabled:opacity-50"
      style={{ borderColor: '#EAEEF5', color: '#1B2840' }}
    >
      {icon}
      {loading ? 'Saving...' : label}
    </button>
  )
}

function fileHref(file: ProductFile): string | null {
  return file.stored_url || file.source_url || null
}

function filePreviewUrl(file: ProductFile): string | null {
  if (file.thumbnail_url?.includes('digitaloceanspaces.com')) return file.thumbnail_url
  if (file.mime_type?.startsWith('image/') && file.stored_url) return file.stored_url
  if (file.thumbnail_url) return file.thumbnail_url
  if (file.mime_type?.startsWith('image/')) return fileHref(file)
  return null
}

function AttachmentGallery({
  productId,
  fallbackCoverUrl,
  onCoverError,
}: {
  productId: string
  fallbackCoverUrl?: string
  onCoverError: () => void
}) {
  const [files, setFiles] = useState<ProductFile[]>([])

  useEffect(() => {
    listProductFiles(productId).then(setFiles).catch(() => setFiles([]))
  }, [productId])

  const previewFiles = files.filter(filePreviewUrl)

  if (previewFiles.length === 0 && !fallbackCoverUrl) return null

  return (
    <div className="grid grid-cols-2 gap-3 px-6 pt-5">
      {previewFiles.length > 0 ? previewFiles.map((file) => {
        const href = fileHref(file)
        const preview = filePreviewUrl(file)
        return (
          <a key={file.id} href={href || undefined} target="_blank" rel="noreferrer" className="group overflow-hidden rounded-xl border" style={{ borderColor: '#EAEEF5', background: '#F6F8FC' }}>
            <img src={preview || ''} alt="" className="h-48 w-full object-contain transition-transform group-hover:scale-[1.02]" />
            <div className="border-t px-3 py-2" style={{ borderColor: '#EAEEF5', background: '#fff' }}>
              <div className="truncate text-[12.5px] font-semibold" style={{ color: '#1B2840' }}>{file.title || 'Untitled file'}</div>
            </div>
          </a>
        )
      }) : (
        <img
          src={fallbackCoverUrl}
          alt=""
          className="col-span-2 max-h-[420px] w-full rounded-xl object-contain"
          style={{ background: '#F6F8FC' }}
          onError={onCoverError}
        />
      )}
    </div>
  )
}

function RichDescription({ text }: { text: string }) {
  const lines = text.replace(/\r\n/g, '\n').split('\n')
  const rendered = lines.map((raw, index) => {
    const line = raw.trim()
    if (!line) return <div key={index} className="h-3" />

    const bullet = /^[-*•]\s+/.test(line)
    const checked = /^[☑✓]\s+/.test(line)
    const struck = /^~~.*~~$/.test(line)
    const heading = /:$/.test(line) && line.length < 80
    const important = /\b(please|need|top priority|asap|urgent|must|done)\b/i.test(line)
    const clean = line
      .replace(/^[-*•]\s+/, '')
      .replace(/^[☑✓]\s+/, '')
      .replace(/^~~|~~$/g, '')

    if (heading) {
      return (
        <div key={index} className="mt-3 text-[13px] font-bold uppercase" style={{ color: '#1B2840' }}>
          {clean}
        </div>
      )
    }

    return (
      <div key={index} className="flex gap-2 text-[13.5px] leading-relaxed" style={{ color: struck || checked ? '#94A0B5' : '#5A6883' }}>
        <span className="mt-[0.65em] size-1.5 shrink-0 rounded-full" style={{ background: bullet || important ? '#1B2840' : 'transparent' }} />
        <span
          className={important ? 'rounded px-1 font-semibold' : undefined}
          style={{
            background: important ? '#FFCB32' : 'transparent',
            color: important ? '#1B2840' : undefined,
            textDecoration: struck || checked ? 'line-through' : 'none',
          }}
        >
          {clean}
        </span>
      </div>
    )
  })

  return <div>{rendered}</div>
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

function ChecklistPanel({ productId }: { productId: string }) {
  const [items, setItems] = useState<Awaited<ReturnType<typeof listChecklist>>>([])

  useEffect(() => {
    listChecklist(productId).then(setItems).catch(() => setItems([]))
  }, [productId])

  if (items.length === 0) return null

  async function toggle(id: string, done: boolean) {
    setItems((prev) => prev.map((item) => item.id === id ? { ...item, done } : item))
    try { await setChecklistDone(id, done) }
    catch { setItems((prev) => prev.map((item) => item.id === id ? { ...item, done: !done } : item)) }
  }

  return (
    <div>
      <div className="mb-2 text-[12px] font-medium" style={{ color: '#0094FF' }}>Checklist</div>
      <div className="space-y-2">
        {items.map((item) => (
          <label key={item.id} className="flex items-start gap-2 rounded-lg border px-3 py-2" style={{ borderColor: '#EAEEF5' }}>
            <input
              type="checkbox"
              checked={item.done}
              onChange={(e) => toggle(item.id, e.target.checked)}
              className="mt-0.5 size-4"
            />
            <span className="min-w-0 flex-1 text-[13px] leading-relaxed" style={{ color: item.done ? '#94A0B5' : '#1B2840', textDecoration: item.done ? 'line-through' : 'none' }}>
              {item.group_name ? `${item.group_name}: ` : ''}{item.label}
            </span>
          </label>
        ))}
      </div>
    </div>
  )
}

function SubtasksPanel({ productId }: { productId: string }) {
  const [items, setItems] = useState<Subtask[]>([])

  useEffect(() => {
    listSubtasks(productId).then(setItems).catch(() => setItems([]))
  }, [productId])

  if (items.length === 0) return null

  async function toggle(id: string, done: boolean) {
    setItems((prev) => prev.map((item) => item.id === id ? { ...item, done } : item))
    try { await setSubtaskDone(id, done) }
    catch { setItems((prev) => prev.map((item) => item.id === id ? { ...item, done: !done } : item)) }
  }

  return (
    <div>
      <div className="mb-2 text-[12px] font-medium" style={{ color: '#0094FF' }}>Subtasks</div>
      <div className="space-y-2">
        {items.map((item) => (
          <label key={item.id} className="flex items-start gap-2 rounded-lg border px-3 py-2" style={{ borderColor: '#EAEEF5' }}>
            <input
              type="checkbox"
              checked={item.done}
              onChange={(e) => toggle(item.id, e.target.checked)}
              className="mt-0.5 size-4"
            />
            <span className="min-w-0 flex-1">
              <span className="block text-[13px] leading-relaxed" style={{ color: item.done ? '#94A0B5' : '#1B2840', textDecoration: item.done ? 'line-through' : 'none' }}>
                {item.title}
              </span>
              {(item.assignee || item.due_date) && (
                <span className="mt-0.5 block text-[12px]" style={{ color: '#94A0B5' }}>
                  {[userName(item.assignee), formatDate(item.due_date)].filter((value) => value && value !== 'Unknown' && value !== '—').join(' · ')}
                </span>
              )}
            </span>
          </label>
        ))}
      </div>
    </div>
  )
}

// ─── ClickUp-work panes ──────────────────────────────────────────────────────

function ProductTags({ productId }: { productId: string }) {
  const [tags, setTags] = useState<ProductTag[]>([])

  useEffect(() => {
    listProductTags(productId).then(setTags).catch(() => setTags([]))
  }, [productId])

  if (tags.length === 0) return null

  return (
    <div>
      <div className="mb-2 flex items-center gap-1.5 text-[12px] font-medium" style={{ color: '#0094FF' }}>
        <Tags className="size-3.5" />
        Tags
      </div>
      <div className="flex flex-wrap gap-1.5">
        {tags.map((tag) => (
          <span
            key={tag.id}
            className="rounded-md px-2 py-1 text-[12px] font-semibold"
            style={{ background: '#F6F8FC', color: tag.color || '#5A6883' }}
          >
            {tag.name}
          </span>
        ))}
      </div>
    </div>
  )
}

function FilesPane({ productId }: { productId: string }) {
  const [files, setFiles] = useState<ProductFile[]>([])

  useEffect(() => {
    listProductFiles(productId).then(setFiles).catch(() => setFiles([]))
  }, [productId])

  return (
    <div className="flex-1 overflow-y-auto px-6 py-4">
      {files.length === 0 && <p className="text-[13px]" style={{ color: '#94A0B5' }}>No files yet.</p>}
      <div className="space-y-2">
        {files.map((file) => {
          const href = fileHref(file)
          const preview = filePreviewUrl(file)
          return (
            <a
              key={file.id}
              href={href || undefined}
              target="_blank"
              rel="noreferrer"
              className="flex min-h-14 items-center gap-3 rounded-lg border px-3 py-2 transition-colors hover:bg-[#F6F8FC]"
              style={{ borderColor: '#EAEEF5' }}
            >
              {preview ? (
                <img src={preview} alt="" className="size-14 shrink-0 rounded-lg object-cover" style={{ background: '#F6F8FC' }} />
              ) : (
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg" style={{ background: '#F6F8FC', color: '#5A6883' }}>
                  <Paperclip className="size-4" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="truncate text-[13px] font-semibold" style={{ color: '#1B2840' }}>{file.title || 'Untitled file'}</div>
                <div className="mt-0.5 text-[12px]" style={{ color: '#94A0B5' }}>
                  {[file.file_type?.toUpperCase(), fileSize(file.size), formatDate(file.uploaded_at)].filter(Boolean).join(' · ')}
                </div>
              </div>
            </a>
          )
        })}
      </div>
    </div>
  )
}

function FieldsPane({ productId }: { productId: string }) {
  const [fields, setFields] = useState<ProductField[]>([])

  useEffect(() => {
    listProductFields(productId).then(setFields).catch(() => setFields([]))
  }, [productId])

  return (
    <div className="flex-1 overflow-y-auto px-6 py-4">
      {fields.length === 0 && <p className="text-[13px]" style={{ color: '#94A0B5' }}>No imported fields yet.</p>}
      <div className="space-y-3">
        {fields.map((field) => (
          <div key={field.id} className="rounded-lg border p-3" style={{ borderColor: '#EAEEF5' }}>
            <div className="text-[12px] font-semibold" style={{ color: '#0094FF' }}>{field.name || 'Field'}</div>
            <div className="mt-1 whitespace-pre-wrap break-words text-[13px]" style={{ color: '#1B2840' }}>
              {field.value_text || JSON.stringify(field.value_json ?? '') || '—'}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ActivityPane({ productId }: { productId: string }) {
  const [items, setItems] = useState<ProductActivity[]>([])
  const [links, setLinks] = useState<ProductLink[]>([])
  const [timeEntries, setTimeEntries] = useState<ProductTimeEntry[]>([])

  useEffect(() => {
    Promise.all([listProductActivity(productId), listProductLinks(productId), listProductTimeEntries(productId)])
      .then(([freshItems, freshLinks, freshTimeEntries]) => {
        setItems(freshItems)
        setLinks(freshLinks)
        setTimeEntries(freshTimeEntries)
      })
      .catch(() => {
        setItems([])
        setLinks([])
        setTimeEntries([])
      })
  }, [productId])

  return (
    <div className="flex-1 overflow-y-auto px-6 py-4">
      {items.length === 0 && links.length === 0 && timeEntries.length === 0 && (
        <p className="text-[13px]" style={{ color: '#94A0B5' }}>No imported activity yet.</p>
      )}
      {links.length > 0 && (
        <div className="mb-5">
          <PaneHeading>Links</PaneHeading>
          <div className="space-y-2">
            {links.map((link) => (
              <div key={link.id} className="rounded-lg border p-3" style={{ borderColor: '#EAEEF5' }}>
                <div className="text-[12px] font-semibold uppercase" style={{ color: '#0094FF' }}>
                  {[link.relation_type, link.direction].filter(Boolean).join(' · ') || 'Linked task'}
                </div>
                <div className="mt-1 text-[13px] font-semibold" style={{ color: '#1B2840' }}>
                  {productLabel(link.linked_product) || link.linked_title || link.linked_external_id || 'Linked item'}
                </div>
                <div className="mt-1 text-[12px]" style={{ color: '#94A0B5' }}>
                  {[link.created_by, formatDate(link.created_at)].filter(Boolean).join(' · ')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {timeEntries.length > 0 && (
        <div className="mb-5">
          <PaneHeading>Time</PaneHeading>
          <div className="space-y-2">
            {timeEntries.map((entry) => (
              <div key={entry.id} className="rounded-lg border p-3" style={{ borderColor: '#EAEEF5' }}>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[13px] font-semibold" style={{ color: '#1B2840' }}>
                    {entry.user_name || entry.user_email || 'Unknown'}
                  </span>
                  <span className="text-[12px] font-bold" style={{ color: '#0094FF' }}>
                    {entry.duration_hours ? `${entry.duration_hours}h` : '—'}
                  </span>
                </div>
                {entry.description && <p className="mt-1 text-[13px]" style={{ color: '#5A6883' }}>{entry.description}</p>}
                <div className="mt-1 text-[12px]" style={{ color: '#94A0B5' }}>
                  {[formatDate(entry.started_at), entry.billable ? 'Billable' : null, entry.tags].filter(Boolean).join(' · ')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className="flex gap-2.5">
            <div className="mt-1 size-2 shrink-0 rounded-full" style={{ background: '#0094FF' }} />
            <div className="min-w-0 flex-1">
              <div className="text-[13px] font-semibold" style={{ color: '#1B2840' }}>{item.action || 'Activity'}</div>
              {item.detail && <p className="mt-0.5 text-[13px] leading-relaxed" style={{ color: '#5A6883' }}>{item.detail}</p>}
              <div className="mt-1 text-[12px]" style={{ color: '#94A0B5' }}>
                {[item.actor_name, formatDate(item.happened_at)].filter(Boolean).join(' · ')}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function PaneHeading({ children }: { children: React.ReactNode }) {
  return <div className="mb-2 text-[12px] font-bold uppercase" style={{ color: '#5A6883' }}>{children}</div>
}

// ─── Activity feed ───────────────────────────────────────────────────────────

function ActivityFeed({ productId }: { productId: string }) {
  const [comments, setComments] = useState<Comment[]>([])
  const [updates, setUpdates] = useState<ProductUpdate[]>([])
  const [draft, setDraft] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const feedRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    Promise.all([listComments(productId), listProductUpdates(productId)])
      .then(([freshComments, freshUpdates]) => {
        setComments(freshComments)
        setUpdates(freshUpdates)
      })
      .catch(() => {
        setComments([])
        setUpdates([])
      })
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
        {comments.length === 0 && updates.length === 0 && (
          <p className="text-[13px]" style={{ color: '#94A0B5' }}>No activity yet.</p>
        )}
        {updates.map((update) => {
          const name = update.author_name || update.author_email || 'ClickUp'
          return (
            <div key={update.id} className="flex gap-2.5">
              <div
                className="flex size-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white mt-0.5"
                style={{ background: avatarColor(name) }}
              >
                {name.split(' ').filter(Boolean).slice(0, 2).map((s) => s[0]?.toUpperCase()).join('') || 'CU'}
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
