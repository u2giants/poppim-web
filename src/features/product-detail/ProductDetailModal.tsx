import { useEffect, useRef, useState } from 'react'
import { reportOptionalDataError } from '@/lib/uiError'
import type { ProductSummary } from '@/domain/products/types'
import { CATEGORY_ICONS, LICENSOR_META, STAGE_COLORS, stageColor } from '@/domain/products/presentation'
import { ClipboardCheck, ExternalLink, FilePenLine, FileText, FlaskConical, GitBranch, History, MessageSquare, Paperclip, X } from 'lucide-react'
import type {
  Buyer,
  Licensor,
  ProductType,
  Retailer,
  Stage,
} from '@/lib/types'
import {
  fetchLicensors,
  fetchProductTypes,
  fetchCustomers,
  fetchBuyers,
} from '@/features/board/collab'
import { fetchStages } from '@/features/board/api'
import {
  createRevisionForProduct,
  createSampleForProduct,
  createSubmissionForProduct,
} from '@/features/workflow/api'
import { useProductFieldMutation } from './useProductFieldMutation'
import { ModalField, PaneTab, WorkflowActionButton } from './ProductDetailPrimitives'
import { formatDate, formatDuration } from './formatters'
import { ActivityFeed } from './ActivityFeed'
import { EditDate, EditSelect, EditText } from './InlineEditors'
import { AttachmentGallery, FilesPane } from './FilesPane'
import { AssigneesField, ChecklistPanel, FieldsPane, ProductTags, SubtasksPanel } from './CollaborationPanels'
import { ActivityPane } from './ActivityPane'
import { OperatingPane } from './OperatingPane'

// ─── Helpers ────────────────────────────────────────────────────────────────

// ─── Props ───────────────────────────────────────────────────────────────────

export interface ProductDetailModalProps {
  task: ProductSummary | null
  onClose: () => void
}

// ─── Modal ───────────────────────────────────────────────────────────────────

export function ProductDetailModal({ task, onClose }: ProductDetailModalProps) {
  if (!task) return null
  return <ProductDetailContent key={task.id} task={task} onClose={onClose} />
}

function ProductDetailContent({ task, onClose }: { task: ProductSummary; onClose: () => void }) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const [coverFailedFor, setCoverFailedFor] = useState<string | null>(null)
  const [tab, setTab] = useState<'updates' | 'files' | 'fields' | 'activity' | 'ops'>('updates')
  const [actionBusy, setActionBusy] = useState<string | null>(null)
  const [actionMessage, setActionMessage] = useState<string | null>(null)
  const { local, applyLocal } = useProductFieldMutation(task)
  const [stages, setStages] = useState<Stage[]>([])
  const [licensors, setLicensors] = useState<Licensor[]>([])
  const [productTypes, setProductTypes] = useState<ProductType[]>([])
  const [retailers, setRetailers] = useState<Retailer[]>([])
  const [retailersError, setRetailersError] = useState<string | null>(null)
  const [buyers, setBuyers] = useState<Buyer[]>([])
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null)
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; coverUrl: string | null; previewUrl: string | null } | null>(null)

  useEffect(() => {
    fetchStages().then(setStages).catch((error) => reportOptionalDataError('productDetail.loadStages', 'Stages', error))
    fetchLicensors().then(setLicensors).catch((error) => reportOptionalDataError('productDetail.loadLicensors', 'Licensors', error))
    fetchProductTypes().then(setProductTypes).catch((error) => reportOptionalDataError('productDetail.loadProductTypes', 'Product types', error))
    fetchCustomers()
      .then((rows) => {
        setRetailers(rows)
        setRetailersError(null)
      })
      .catch((err: unknown) => {
        setRetailers([])
        const message = err instanceof Error ? err.message : 'Failed to load retailers'
        setRetailersError(message)
        reportOptionalDataError('productDetail.loadRetailers', 'Retailers', err)
      })
    // Pre-load buyers for the current retailer if set
    const currentRetailerId = task.retailerId
    if (currentRetailerId) {
      fetchBuyers(currentRetailerId).then(setBuyers).catch((error) => reportOptionalDataError('productDetail.loadBuyers', 'Buyers', error))
    }
  }, [task])

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
                    if (id) fetchBuyers(id).then(setBuyers).catch((error) => reportOptionalDataError('productDetail.loadBuyers', 'Buyers', error))
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
