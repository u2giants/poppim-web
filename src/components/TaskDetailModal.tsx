import { useEffect, useMemo, useRef, useState } from 'react'
import type { ProductSummary } from '@/domain/products/types'
import { CATEGORY_ICONS, LICENSOR_META, STAGE_COLORS, stageColor } from '@/domain/products/presentation'
import { Bell, ClipboardCheck, ExternalLink, FilePenLine, FileText, FlaskConical, GitBranch, History, MessageSquare, Paperclip, Scale, Send, Tags, X } from 'lucide-react'
import type {
  Buyer,
  Comment,
  Licensor,
  Product,
  ProductActivity,
  ProductAssignee,
  ProductField,
  ProductFile,
  ProductLink,
  PmDecision,
  PmDependency,
  PmReminder,
  ProductType,
  Retailer,
  Stage,
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
  updateProduct,
  fetchLicensors,
  fetchProductTypes,
  fetchCustomers,
  fetchBuyers,
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
import { fetchStages } from '@/features/board/api'
import {
  createRevisionForProduct,
  createSampleForProduct,
  createSubmissionForProduct,
} from '@/features/workflow/api'
import {
  createDecision,
  createDependency,
  createReminder,
  listDecisions,
  listDependencies,
  listReminders,
  updateDependencyStatus,
  updateReminderStatus,
} from '@/features/operating/api'

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

function formatDuration(ms: number | null): string {
  if (!ms || ms <= 0) return '—'
  const totalMinutes = Math.round(ms / 60000)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  if (hours === 0) return `${minutes}m`
  if (minutes === 0) return `${hours}h`
  return `${hours}h ${minutes}m`
}

function productLabel(product: Product | string | null): string | null {
  if (!product || typeof product === 'string') return null
  return product.name ?? null
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
  const [tab, setTab] = useState<'updates' | 'files' | 'fields' | 'activity' | 'ops'>('updates')
  const [actionBusy, setActionBusy] = useState<string | null>(null)
  const [actionMessage, setActionMessage] = useState<string | null>(null)

  // Local edits layered on top of the task prop (optimistic updates)
  const [local, setLocal] = useState<{
    name?: string
    lifecycle_state?: string | null
    next_action?: string | null
    waiting_on?: string | null
    risk_level?: string | null
    stage?: string | null
    stageName?: string
    licensor?: string | null
    licensorName?: string | null
    product_type?: string | null
    productTypeName?: string | null
    pps_requested_date?: string | null
    retailer?: string | null
    retailerName?: string | null
    buyer?: string | null
    buyerName?: string | null
  }>({})
  const [stages, setStages] = useState<Stage[]>([])
  const [licensors, setLicensors] = useState<Licensor[]>([])
  const [productTypes, setProductTypes] = useState<ProductType[]>([])
  const [retailers, setRetailers] = useState<Retailer[]>([])
  const [retailersError, setRetailersError] = useState<string | null>(null)
  const [buyers, setBuyers] = useState<Buyer[]>([])
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null)
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; coverUrl: string | null; previewUrl: string | null } | null>(null)

  useEffect(() => {
    if (!task) return
    setLocal({})
    setBuyers([])
    setRetailersError(null)
    setLightboxUrl(null)
    setContextMenu(null)
    fetchStages().then(setStages).catch(() => {})
    fetchLicensors().then(setLicensors).catch(() => {})
    fetchProductTypes().then(setProductTypes).catch(() => {})
    fetchCustomers()
      .then((rows) => {
        setRetailers(rows)
        setRetailersError(null)
      })
      .catch((err: unknown) => {
        setRetailers([])
        const message = err instanceof Error ? err.message : 'Failed to load retailers'
        setRetailersError(message)
        console.error('TaskDetailModal: fetchCustomers failed', err)
      })
    // Pre-load buyers for the current retailer if set
    const currentRetailerId = task.retailerId
    if (currentRetailerId) {
      fetchBuyers(currentRetailerId).then(setBuyers).catch(() => {})
    }
  }, [task?.id])

  useEffect(() => {
    if (!task) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        if (lightboxUrl) { setLightboxUrl(null); return }
        if (contextMenu) { setContextMenu(null); return }
        onClose()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [task, onClose, lightboxUrl, contextMenu])

  useEffect(() => {
    if (!contextMenu) return
    function dismiss() { setContextMenu(null) }
    document.addEventListener('click', dismiss)
    return () => document.removeEventListener('click', dismiss)
  }, [contextMenu])

  if (!task) return null

  function applyLocal(overrides: typeof local, patch: Record<string, unknown>) {
    setLocal(prev => ({ ...prev, ...overrides }))
    updateProduct(task!.id, patch).catch(() => {
      setLocal(prev => {
        const next = { ...prev }
        for (const key of Object.keys(overrides)) delete next[key as keyof typeof local]
        return next
      })
    })
  }

  const displayTitle = 'name' in local ? (local.name ?? task.title) : task.title
  const displayLifecycle = 'lifecycle_state' in local ? local.lifecycle_state : task.lifecycleState
  const displayNextAction = 'next_action' in local ? local.next_action : task.nextAction
  const displayWaitingOn = 'waiting_on' in local ? local.waiting_on : task.waitingOn
  const displayRisk = 'risk_level' in local ? local.risk_level : task.riskLevel
  const displayStageName = local.stageName ?? task.stageName
  const displayStageId = 'stage' in local ? local.stage : task.stageId
  const displayLicensorId = 'licensor' in local ? local.licensor : task.licensorId
  const displayLicensorName = 'licensorName' in local ? local.licensorName : task.licensorName
  const displayProductTypeId = 'product_type' in local ? local.product_type : (typeof task.raw.product_type === 'object' ? task.raw.product_type?.id : task.raw.product_type as string | null | undefined)
  const displayProductTypeName = 'productTypeName' in local ? local.productTypeName : task.productTypeName
  const editableDueDate = 'pps_requested_date' in local ? (local.pps_requested_date ?? '') : (task.ppsRequestedDate ?? task.raw.on_shelf_date ?? '')
  const displayRetailerId = 'retailer' in local ? local.retailer : task.retailerId
  const displayRetailerName = 'retailerName' in local ? local.retailerName : task.retailerName
  const displayBuyerId = 'buyer' in local ? local.buyer : task.buyerId
  const displayBuyerName = 'buyerName' in local ? local.buyerName : task.buyerName

  const licMeta = displayLicensorName ? LICENSOR_META[displayLicensorName] : null
  const resolvedStageColors = STAGE_COLORS[displayStageName] ?? stageColor(displayStageName)
  const product = task.raw
  void displayStageId
  void displayLicensorId

  function openContextMenu(e: React.MouseEvent, coverUrl: string | null, previewUrl: string | null) {
    e.preventDefault()
    e.stopPropagation()
    setContextMenu({ x: e.clientX, y: e.clientY, coverUrl, previewUrl })
  }

  function setCoverFromUrl(url: string) {
    applyLocal({}, { cover_url: url })
  }

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
    <>
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
            <span className="truncate text-[13px]" style={{ color: '#5A6883' }}>
              {[task.clickupSpaceName ?? task.businessUnit, task.clickupFolderName, task.clickupListName, task.retailerName, task.buyerName].filter(Boolean).join(' / ') || 'Product'}
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
          <div className="px-6 pt-3">
            <EditText
              value={displayTitle}
              onSave={(v) => applyLocal({ name: v }, { name: v })}
              multiline
              textStyle={{ fontSize: 25, color: '#1B2840', letterSpacing: '-0.02em', fontWeight: 800, lineHeight: 1.25 }}
            />
          </div>

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

          <AttachmentGallery
            productId={task.id}
            fallbackCoverUrl={coverFailedFor === task.id ? undefined : task.coverUrl}
            onCoverError={() => setCoverFailedFor(task.id)}
            onLightbox={setLightboxUrl}
            onContextMenu={openContextMenu}
          />

          {/* Fields grid */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-4 px-6 pt-5">
            <ModalField label="Status">
              {stages.length > 0 ? (
                <EditSelect
                  value={displayStageName}
                  options={stages.map(s => ({ value: s.name, label: s.name }))}
                  onSave={(name) => {
                    const s = stages.find(st => st.name === name)
                    if (s) applyLocal({ stage: s.id, stageName: s.name }, { stage: s.id })
                  }}
                  renderValue={(v) => (
                    <span className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[12.5px] font-semibold capitalize" style={{ background: resolvedStageColors.bg, color: '#1B2840' }}>
                      <span className="size-2 rounded-full shrink-0" style={{ background: resolvedStageColors.dot }} />
                      {v}
                    </span>
                  )}
                />
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[12.5px] font-semibold capitalize" style={{ background: resolvedStageColors.bg, color: '#1B2840' }}>
                  <span className="size-2 rounded-full shrink-0" style={{ background: resolvedStageColors.dot }} />
                  {displayStageName}
                </span>
              )}
            </ModalField>

            <ModalField label="Licensor">
              {licensors.length > 0 ? (
                <EditSelect
                  value={displayLicensorId ?? ''}
                  options={[{ value: '', label: '—' }, ...licensors.map(l => ({ value: l.id, label: l.name }))]}
                  onSave={(id) => {
                    const l = id ? licensors.find(x => x.id === id) : null
                    applyLocal({ licensor: id || null, licensorName: l?.name ?? null }, { licensor: id || null })
                  }}
                  renderValue={() => licMeta ? (
                    <div className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[12.5px] font-bold text-white" style={{ background: licMeta.gradient }}>
                      {licMeta.letter} {displayLicensorName}
                    </div>
                  ) : (
                    <span className="text-[13.5px] font-semibold" style={{ color: '#1B2840' }}>{displayLicensorName ?? '—'}</span>
                  )}
                />
              ) : (
                licMeta ? (
                  <div className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[12.5px] font-bold text-white" style={{ background: licMeta.gradient }}>
                    {licMeta.letter} {displayLicensorName}
                  </div>
                ) : (
                  <span className="text-[13.5px] font-semibold" style={{ color: '#1B2840' }}>{displayLicensorName ?? '—'}</span>
                )
              )}
            </ModalField>

            <ModalField label="Due">
              <EditDate
                value={editableDueDate}
                onSave={(v) => applyLocal({ pps_requested_date: v || null }, { pps_requested_date: v || null })}
                displayValue={task.due ?? '—'}
                overdue={task.dueOver}
              />
            </ModalField>

            <ModalField label="Product type">
              {productTypes.length > 0 ? (
                <EditSelect
                  value={displayProductTypeId ?? ''}
                  options={[{ value: '', label: '—' }, ...productTypes.map(t => ({ value: t.id, label: t.name ?? '' }))]}
                  onSave={(id) => {
                    const t = id ? productTypes.find(x => x.id === id) : null
                    applyLocal({ product_type: id || null, productTypeName: t?.name ?? null }, { product_type: id || null })
                  }}
                  renderValue={() => (
                    <span className="text-[13.5px] font-semibold capitalize" style={{ color: '#1B2840' }}>
                      {displayProductTypeName ?? task.category}
                    </span>
                  )}
                />
              ) : (
                <span className="text-[13.5px] font-semibold capitalize" style={{ color: '#1B2840' }}>
                  {displayProductTypeName ?? task.category}
                </span>
              )}
            </ModalField>
          </div>

          <div className="grid grid-cols-2 gap-x-6 gap-y-4 px-6 pt-5">
            <ModalField label="Lifecycle">
              <EditText
                value={displayLifecycle}
                onSave={(v) => applyLocal({ lifecycle_state: v || null }, { lifecycle_state: v || null })}
                placeholder="—"
              />
            </ModalField>
            <ModalField label="Next action">
              <EditText
                value={displayNextAction}
                onSave={(v) => applyLocal({ next_action: v || null }, { next_action: v || null })}
                placeholder="—"
              />
            </ModalField>
            <ModalField label="Waiting on">
              <EditText
                value={displayWaitingOn}
                onSave={(v) => applyLocal({ waiting_on: v || null }, { waiting_on: v || null })}
                placeholder="—"
              />
            </ModalField>
            <ModalField label="Risk">
              <EditSelect
                value={displayRisk ?? ''}
                options={[
                  { value: '', label: '—' },
                  { value: 'low', label: 'Low' },
                  { value: 'medium', label: 'Medium' },
                  { value: 'high', label: 'High' },
                  { value: 'critical', label: 'Critical' },
                ]}
                onSave={(v) => applyLocal({ risk_level: v || null }, { risk_level: v || null })}
                renderValue={(v) => (
                  <span className="text-[13.5px] font-semibold capitalize" style={{ color: v ? '#D2502B' : '#1B2840' }}>
                    {v || '—'}
                  </span>
                )}
              />
            </ModalField>
          </div>

          <div className="grid grid-cols-2 gap-x-6 gap-y-4 px-6 pt-5">
            <ModalField label="Project / offer">
              <span className="text-[13.5px] font-semibold" style={{ color: '#1B2840' }}>{task.projectTitle ?? '—'}</span>
            </ModalField>
            <ModalField label="Retailer">
              {retailersError ? (
                <span className="text-[13px] font-medium text-red-700" role="alert">
                  Could not load retailers: {retailersError}
                </span>
              ) : retailers.length > 0 ? (
                <EditSelect
                  value={displayRetailerId ?? ''}
                  options={[{ value: '', label: '—' }, ...retailers.map(r => ({ value: r.id, label: r.name }))]}
                  onSave={(id) => {
                    const r = id ? retailers.find(x => x.id === id) : null
                    applyLocal(
                      { retailer: id || null, retailerName: r?.name ?? null, buyer: null, buyerName: null },
                      { retailer: id || null, buyer: null },
                    )
                    setBuyers([])
                    if (id) fetchBuyers(id).then(setBuyers).catch(() => {})
                  }}
                  renderValue={() => (
                    <span className="text-[13.5px] font-semibold" style={{ color: '#1B2840' }}>{displayRetailerName ?? '—'}</span>
                  )}
                />
              ) : (
                <span className="text-[13.5px] font-semibold" style={{ color: '#1B2840' }}>{displayRetailerName ?? '—'}</span>
              )}
            </ModalField>
            <ModalField label="Buyer">
              {displayRetailerId && buyers.length > 0 ? (
                <EditSelect
                  value={displayBuyerId ?? ''}
                  options={[{ value: '', label: '—' }, ...buyers.map(b => ({ value: b.id, label: b.name ?? '' }))]}
                  onSave={(id) => {
                    const b = id ? buyers.find(x => x.id === id) : null
                    applyLocal({ buyer: id || null, buyerName: b?.name ?? null }, { buyer: id || null })
                  }}
                  renderValue={() => (
                    <span className="text-[13.5px] font-semibold" style={{ color: '#1B2840' }}>{displayBuyerName ?? '—'}</span>
                  )}
                />
              ) : (
                <span className="text-[13.5px] font-semibold" style={{ color: displayRetailerId ? '#1B2840' : '#A0AEC0' }}>
                  {displayBuyerName ?? (displayRetailerId ? '—' : 'Select retailer first')}
                </span>
              )}
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
            {task.clickupTimeEstimateMs != null && (
              <ModalField label="Time estimate">
                <span className="text-[13.5px] font-semibold" style={{ color: '#1B2840' }}>
                  {formatDuration(task.clickupTimeEstimateMs)}
                </span>
              </ModalField>
            )}
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
              <ModalField label="ClickUp space">
                <span className="text-[13.5px] font-semibold" style={{ color: '#1B2840' }}>{task.clickupSpaceName ?? '—'}</span>
              </ModalField>
              <ModalField label="ClickUp folder">
                <span className="text-[13.5px] font-semibold" style={{ color: '#1B2840' }}>{task.clickupFolderName ?? '—'}</span>
              </ModalField>
              <ModalField label="ClickUp list">
                <span className="text-[13.5px] font-semibold" style={{ color: '#1B2840' }}>{task.clickupListName ?? '—'}</span>
              </ModalField>
              <ModalField label="Created by">
                <span className="text-[13.5px] font-semibold" style={{ color: '#1B2840' }}>{task.clickupCreatorName ?? '—'}</span>
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
            <div className="mt-3 grid grid-cols-5 gap-1 rounded-lg p-1" style={{ background: '#F6F8FC' }}>
              <PaneTab active={tab === 'updates'} icon={<MessageSquare className="size-3.5" />} onClick={() => setTab('updates')} />
              <PaneTab active={tab === 'files'} icon={<Paperclip className="size-3.5" />} onClick={() => setTab('files')} />
              <PaneTab active={tab === 'fields'} icon={<FileText className="size-3.5" />} onClick={() => setTab('fields')} />
              <PaneTab active={tab === 'activity'} icon={<History className="size-3.5" />} onClick={() => setTab('activity')} />
              <PaneTab active={tab === 'ops'} icon={<GitBranch className="size-3.5" />} onClick={() => setTab('ops')} />
            </div>
          </div>
          {tab === 'updates' && <ActivityFeed productId={task.id} />}
          {tab === 'files' && <FilesPane productId={task.id} onLightbox={setLightboxUrl} onContextMenu={openContextMenu} />}
          {tab === 'fields' && <FieldsPane productId={task.id} />}
          {tab === 'activity' && <ActivityPane productId={task.id} />}
          {tab === 'ops' && <OperatingPane productId={task.id} />}
        </div>
      </div>
    </div>

    {/* Lightbox */}
    {lightboxUrl && (
      <div
        className="fixed inset-0 z-[60] flex items-center justify-center"
        style={{ background: 'rgba(0,0,0,0.88)' }}
        onClick={() => setLightboxUrl(null)}
      >
        <button
          className="absolute right-5 top-5 flex size-9 items-center justify-center rounded-full text-white transition-colors hover:bg-white/10"
          onClick={() => setLightboxUrl(null)}
        >
          <X className="size-5" />
        </button>
        <img
          src={lightboxUrl}
          alt=""
          className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        />
      </div>
    )}

    {/* Context menu */}
    {contextMenu && (
      <div
        className="fixed z-[60] min-w-[180px] overflow-hidden rounded-xl border py-1 shadow-xl"
        style={{ left: contextMenu.x, top: contextMenu.y, background: '#fff', borderColor: '#EAEEF5' }}
        onClick={(e) => e.stopPropagation()}
      >
        {contextMenu.previewUrl && (
          <button
            className="flex w-full items-center gap-2 px-4 py-2 text-left text-[13px] font-medium transition-colors hover:bg-[#F6F8FC]"
            style={{ color: '#1B2840' }}
            onClick={() => { setLightboxUrl(contextMenu.previewUrl); setContextMenu(null) }}
          >
            View full size
          </button>
        )}
        {contextMenu.coverUrl && (
          <button
            className="flex w-full items-center gap-2 px-4 py-2 text-left text-[13px] font-medium transition-colors hover:bg-[#F6F8FC]"
            style={{ color: '#1B2840' }}
            onClick={() => { setCoverFromUrl(contextMenu.coverUrl!); setContextMenu(null) }}
          >
            Set as cover image
          </button>
        )}
      </div>
    )}
    </>
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
  onLightbox,
  onContextMenu,
}: {
  productId: string
  fallbackCoverUrl?: string
  onCoverError: () => void
  onLightbox: (url: string) => void
  onContextMenu: (e: React.MouseEvent, coverUrl: string | null, previewUrl: string | null) => void
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
          <div
            key={file.id}
            className="group cursor-pointer overflow-hidden rounded-xl border"
            style={{ borderColor: '#EAEEF5', background: '#F6F8FC' }}
            onClick={() => preview && onLightbox(preview)}
            onContextMenu={(e) => onContextMenu(e, href, preview)}
          >
            <img src={preview || ''} alt="" className="h-48 w-full object-contain transition-transform group-hover:scale-[1.02]" />
            <div className="border-t px-3 py-2" style={{ borderColor: '#EAEEF5', background: '#fff' }}>
              <div className="truncate text-[12.5px] font-semibold" style={{ color: '#1B2840' }}>{file.title || 'Untitled file'}</div>
            </div>
          </div>
        )
      }) : (
        <img
          src={fallbackCoverUrl}
          alt=""
          className="col-span-2 max-h-[420px] w-full cursor-pointer rounded-xl object-contain transition-transform hover:scale-[1.01]"
          style={{ background: '#F6F8FC' }}
          onError={onCoverError}
          onClick={() => fallbackCoverUrl && onLightbox(fallbackCoverUrl)}
          onContextMenu={(e) => onContextMenu(e, fallbackCoverUrl ?? null, fallbackCoverUrl ?? null)}
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
            const initials = userInitials(r.profile)
            const name = userName(r.profile)
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
          {rows.map((r) => userName(r.profile).split(' ')[0]).join(', ')}
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

function FilesPane({
  productId,
  onLightbox,
  onContextMenu,
}: {
  productId: string
  onLightbox: (url: string) => void
  onContextMenu: (e: React.MouseEvent, coverUrl: string | null, previewUrl: string | null) => void
}) {
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
          const isImage = Boolean(preview)
          const inner = (
            <>
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
            </>
          )
          if (isImage) {
            return (
              <div
                key={file.id}
                className="flex min-h-14 cursor-pointer items-center gap-3 rounded-lg border px-3 py-2 transition-colors hover:bg-[#F6F8FC]"
                style={{ borderColor: '#EAEEF5' }}
                onClick={() => preview && onLightbox(preview)}
                onContextMenu={(e) => onContextMenu(e, href, preview)}
              >
                {inner}
              </div>
            )
          }
          return (
            <a
              key={file.id}
              href={href || undefined}
              target="_blank"
              rel="noreferrer"
              className="flex min-h-14 items-center gap-3 rounded-lg border px-3 py-2 transition-colors hover:bg-[#F6F8FC]"
              style={{ borderColor: '#EAEEF5' }}
            >
              {inner}
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

function OperatingPane({ productId }: { productId: string }) {
  const [dependencies, setDependencies] = useState<PmDependency[]>([])
  const [decisions, setDecisions] = useState<PmDecision[]>([])
  const [reminders, setReminders] = useState<PmReminder[]>([])
  const [busy, setBusy] = useState<string | null>(null)

  async function refresh() {
    try {
      const [freshDependencies, freshDecisions, freshReminders] = await Promise.all([
        listDependencies(productId),
        listDecisions(productId),
        listReminders(productId),
      ])
      setDependencies(freshDependencies)
      setDecisions(freshDecisions)
      setReminders(freshReminders)
    } catch {
      setDependencies([])
      setDecisions([])
      setReminders([])
    }
  }

  useEffect(() => { void refresh() }, [productId])

  async function addDependency() {
    const title = window.prompt('Dependency title')
    if (!title?.trim()) return
    setBusy('dependency')
    try {
      await createDependency(productId, title.trim())
      await refresh()
    } finally {
      setBusy(null)
    }
  }

  async function addDecision() {
    const decisionType = window.prompt('Decision type', 'approved')
    if (!decisionType?.trim()) return
    const notes = window.prompt('Decision notes') ?? ''
    setBusy('decision')
    try {
      await createDecision(productId, decisionType.trim(), notes.trim())
      await refresh()
    } finally {
      setBusy(null)
    }
  }

  async function addReminder() {
    const title = window.prompt('Reminder title')
    if (!title?.trim()) return
    const due = window.prompt('Due date (YYYY-MM-DD, optional)')?.trim()
    setBusy('reminder')
    try {
      await createReminder(productId, title.trim(), due ? `${due}T12:00:00` : null)
      await refresh()
    } finally {
      setBusy(null)
    }
  }

  async function resolveDependency(id: string) {
    setBusy(id)
    try {
      await updateDependencyStatus(id, 'resolved')
      await refresh()
    } finally {
      setBusy(null)
    }
  }

  async function completeReminder(id: string) {
    setBusy(id)
    try {
      await updateReminderStatus(id, 'done')
      await refresh()
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="flex-1 overflow-y-auto px-6 py-4">
      <OperatingSection
        icon={<GitBranch className="size-3.5" />}
        title="Dependencies"
        actionLabel="Add"
        busy={busy === 'dependency'}
        onAction={addDependency}
      >
        {dependencies.length === 0 ? (
          <EmptyOperatingRow>No dependencies.</EmptyOperatingRow>
        ) : dependencies.map((item) => (
          <OperatingRow
            key={item.id}
            title={item.title || 'Dependency'}
            meta={[item.dependency_type, item.waiting_on, formatDate(item.due_at)].filter(Boolean).join(' · ')}
            status={item.status}
            action={item.status !== 'resolved' ? 'Resolve' : undefined}
            busy={busy === item.id}
            onAction={() => resolveDependency(item.id)}
          />
        ))}
      </OperatingSection>

      <OperatingSection
        icon={<Scale className="size-3.5" />}
        title="Decisions"
        actionLabel="Record"
        busy={busy === 'decision'}
        onAction={addDecision}
      >
        {decisions.length === 0 ? (
          <EmptyOperatingRow>No decisions recorded.</EmptyOperatingRow>
        ) : decisions.map((item) => (
          <OperatingRow
            key={item.id}
            title={item.decision_type || 'Decision'}
            meta={[item.reason || item.notes, formatDate(item.decided_at), userName(item.decided_by)].filter((value) => value && value !== 'Unknown' && value !== '—').join(' · ')}
            status={item.status}
            href={item.evidence_url || undefined}
          />
        ))}
      </OperatingSection>

      <OperatingSection
        icon={<Bell className="size-3.5" />}
        title="Reminders"
        actionLabel="Add"
        busy={busy === 'reminder'}
        onAction={addReminder}
      >
        {reminders.length === 0 ? (
          <EmptyOperatingRow>No reminders.</EmptyOperatingRow>
        ) : reminders.map((item) => (
          <OperatingRow
            key={item.id}
            title={item.title || 'Reminder'}
            meta={[item.reminder_type, formatDate(item.due_at), userName(item.assigned_to)].filter((value) => value && value !== 'Unknown' && value !== '—').join(' · ')}
            status={item.status}
            action={item.status !== 'done' ? 'Done' : undefined}
            busy={busy === item.id}
            onAction={() => completeReminder(item.id)}
          />
        ))}
      </OperatingSection>
    </div>
  )
}

function OperatingSection({
  icon,
  title,
  actionLabel,
  busy,
  onAction,
  children,
}: {
  icon: React.ReactNode
  title: string
  actionLabel: string
  busy: boolean
  onAction: () => void
  children: React.ReactNode
}) {
  return (
    <div className="mb-5">
      <div className="mb-2 flex items-center justify-between gap-3">
        <PaneHeading>
          <span className="inline-flex items-center gap-1.5">{icon}{title}</span>
        </PaneHeading>
        <button
          type="button"
          disabled={busy}
          onClick={onAction}
          className="rounded-md border px-2 py-1 text-[11.5px] font-bold transition-colors hover:bg-[#F6F8FC] disabled:opacity-50"
          style={{ borderColor: '#EAEEF5', color: '#1B2840' }}
        >
          {busy ? 'Saving...' : actionLabel}
        </button>
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  )
}

function OperatingRow({
  title,
  meta,
  status,
  action,
  busy,
  href,
  onAction,
}: {
  title: string
  meta: string
  status?: string | null
  action?: string
  busy?: boolean
  href?: string
  onAction?: () => void
}) {
  const content = (
    <>
      <div className="min-w-0 flex-1">
        <div className="truncate text-[13px] font-semibold capitalize" style={{ color: '#1B2840' }}>{title.replace(/_/g, ' ')}</div>
        {meta && <div className="mt-0.5 line-clamp-2 text-[12px]" style={{ color: '#5A6883' }}>{meta.replace(/_/g, ' ')}</div>}
      </div>
      {status && (
        <span className="shrink-0 rounded-md px-2 py-1 text-[11px] font-bold capitalize" style={{ background: '#F6F8FC', color: '#5A6883' }}>
          {status.replace(/_/g, ' ')}
        </span>
      )}
      {action && onAction && (
        <button
          type="button"
          disabled={busy}
          onClick={(e) => { e.preventDefault(); onAction() }}
          className="shrink-0 rounded-md px-2 py-1 text-[11px] font-bold text-white disabled:opacity-50"
          style={{ background: '#0094FF' }}
        >
          {busy ? '...' : action}
        </button>
      )}
    </>
  )

  if (href) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className="flex items-start gap-2 rounded-lg border px-3 py-2 hover:bg-[#F6F8FC]" style={{ borderColor: '#EAEEF5' }}>
        {content}
      </a>
    )
  }

  return (
    <div className="flex items-start gap-2 rounded-lg border px-3 py-2" style={{ borderColor: '#EAEEF5' }}>
      {content}
    </div>
  )
}

function EmptyOperatingRow({ children }: { children: React.ReactNode }) {
  return <div className="rounded-lg border px-3 py-2 text-[13px]" style={{ borderColor: '#EAEEF5', color: '#94A0B5' }}>{children}</div>
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

// ─── Editable field helpers ───────────────────────────────────────────────────

const EDIT_INPUT_STYLE = {
  fontSize: 13.5,
  color: '#1B2840',
  fontWeight: 600,
  background: '#F6F8FC',
  border: '1px solid #0094FF',
  borderRadius: 6,
  padding: '2px 6px',
  outline: 'none',
  width: '100%',
}

function EditText({
  value,
  onSave,
  placeholder = '—',
  multiline = false,
  textStyle,
}: {
  value: string | null | undefined
  onSave: (v: string) => void
  placeholder?: string
  multiline?: boolean
  textStyle?: React.CSSProperties
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value ?? '')
  const ref = useRef<HTMLInputElement & HTMLTextAreaElement>(null)

  useEffect(() => { if (editing) ref.current?.focus() }, [editing])
  // sync if external value changes while not editing
  useEffect(() => { if (!editing) setDraft(value ?? '') }, [value, editing])

  function commit() {
    setEditing(false)
    if (draft !== (value ?? '')) onSave(draft)
  }
  function cancel() { setEditing(false); setDraft(value ?? '') }

  if (editing) {
    const sharedProps = {
      value: draft,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setDraft(e.target.value),
      onBlur: commit,
      style: { ...EDIT_INPUT_STYLE, resize: 'none' as const },
    }
    if (multiline) {
      return (
        <textarea
          ref={ref}
          rows={3}
          onKeyDown={(e) => { if (e.key === 'Escape') cancel() }}
          {...sharedProps}
        />
      )
    }
    return (
      <input
        ref={ref}
        type="text"
        onKeyDown={(e) => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') cancel() }}
        {...sharedProps}
      />
    )
  }

  return (
    <span
      onClick={() => { setDraft(value ?? ''); setEditing(true) }}
      className="group cursor-text rounded px-1 -ml-1 hover:bg-[#F6F8FC] transition-colors inline-block"
      title="Click to edit"
      style={textStyle ?? { fontSize: 13.5, color: value ? '#1B2840' : '#94A0B5', fontWeight: 600 }}
    >
      {value || placeholder}
    </span>
  )
}

// Click-to-edit, type-to-search combobox. Filters options client-side as you type;
// arrow keys + Enter select, Escape / click-outside cancels.
function EditSelect({
  value,
  options,
  onSave,
  renderValue,
}: {
  value: string
  options: Array<{ value: string; label: string }>
  onSave: (v: string) => void
  renderValue: (v: string) => React.ReactNode
}) {
  const [editing, setEditing] = useState(false)
  const [query, setQuery] = useState('')
  const [highlight, setHighlight] = useState(0)
  const boxRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return q ? options.filter((o) => o.label.toLowerCase().includes(q)) : options
  }, [options, query])

  useEffect(() => { if (editing) inputRef.current?.focus() }, [editing])
  useEffect(() => {
    if (!editing) return
    function onDoc(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) close()
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [editing])

  function open() { setQuery(''); setHighlight(0); setEditing(true) }
  function close() { setEditing(false); setQuery('') }
  function commit(v: string) { close(); if (v !== value) onSave(v) }

  if (editing) {
    return (
      <div ref={boxRef} style={{ position: 'relative', width: '100%' }}>
        <input
          ref={inputRef}
          value={query}
          placeholder="Type to search…"
          onChange={(e) => { setQuery(e.target.value); setHighlight(0) }}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') { e.preventDefault(); setHighlight((h) => Math.min(h + 1, filtered.length - 1)) }
            else if (e.key === 'ArrowUp') { e.preventDefault(); setHighlight((h) => Math.max(h - 1, 0)) }
            else if (e.key === 'Enter') { e.preventDefault(); const o = filtered[highlight]; if (o) commit(o.value) }
            else if (e.key === 'Escape') { e.preventDefault(); close() }
          }}
          style={{ ...EDIT_INPUT_STYLE, fontWeight: 600 }}
        />
        <div style={{ position: 'absolute', zIndex: 60, top: '100%', left: 0, right: 0, marginTop: 3, maxHeight: 220, overflowY: 'auto', background: '#fff', border: '1px solid #E2E8F0', borderRadius: 6, boxShadow: '0 6px 20px rgba(15,40,80,0.14)' }}>
          {filtered.length === 0 ? (
            <div style={{ padding: '6px 10px', fontSize: 12.5, color: '#94A3B8' }}>No matches</div>
          ) : (
            filtered.map((o, i) => (
              <div
                key={o.value}
                onMouseDown={(e) => { e.preventDefault(); commit(o.value) }}
                onMouseEnter={() => setHighlight(i)}
                style={{ padding: '5px 10px', fontSize: 13, cursor: 'pointer', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', background: i === highlight ? '#EFF6FF' : o.value === value ? '#F6F8FC' : '#fff', color: '#1B2840', fontWeight: o.value === value ? 700 : 500 }}
              >
                {o.label || '—'}
              </div>
            ))
          )}
        </div>
      </div>
    )
  }

  return (
    <span
      onClick={open}
      className="cursor-pointer rounded px-1 -ml-1 hover:bg-[#F6F8FC] transition-colors inline-block"
      title="Click to edit"
    >
      {renderValue(value)}
    </span>
  )
}

function EditDate({
  value,
  onSave,
  displayValue,
  overdue,
}: {
  value: string
  onSave: (v: string) => void
  displayValue: string
  overdue?: boolean
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)
  const ref = useRef<HTMLInputElement>(null)

  useEffect(() => { if (editing) ref.current?.focus() }, [editing])
  useEffect(() => { if (!editing) setDraft(value) }, [value, editing])

  function commit() {
    setEditing(false)
    if (draft !== value) onSave(draft)
  }

  if (editing) {
    return (
      <input
        ref={ref}
        type="date"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') { setEditing(false); setDraft(value) } }}
        style={{ ...EDIT_INPUT_STYLE, width: 'auto' }}
      />
    )
  }

  return (
    <span
      onClick={() => { setDraft(value); setEditing(true) }}
      className="cursor-pointer rounded px-1 -ml-1 hover:bg-[#F6F8FC] transition-colors inline-block"
      title="Click to edit"
      style={{ fontSize: 13.5, color: overdue ? '#D2502B' : (displayValue === '—' ? '#94A0B5' : '#1B2840'), fontWeight: 600 }}
    >
      {displayValue}
    </span>
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
