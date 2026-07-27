import { useCallback, useEffect, useState } from 'react'
import { Bell, GitBranch, Scale } from 'lucide-react'
import { reportOptionalDataError } from '@/lib/uiError'
import type { PmDecision, PmDependency, PmReminder } from '@/lib/types'
import { createDecision, createDependency, createReminder, listDecisions, listDependencies, listReminders, updateDependencyStatus, updateReminderStatus } from '@/features/operating/api'
import { userName } from '@/features/board/collab'
import { PaneHeading } from './ProductDetailPrimitives'
import { formatDate } from './formatters'

export function OperatingPane({ productId }: { productId: string }) {
  const [dependencies, setDependencies] = useState<PmDependency[]>([])
  const [decisions, setDecisions] = useState<PmDecision[]>([])
  const [reminders, setReminders] = useState<PmReminder[]>([])
  const [busy, setBusy] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    try {
      const [freshDependencies, freshDecisions, freshReminders] = await Promise.all([
        listDependencies(productId),
        listDecisions(productId),
        listReminders(productId),
      ])
      setDependencies(freshDependencies)
      setDecisions(freshDecisions)
      setReminders(freshReminders)
    } catch (error) {
      reportOptionalDataError('productDetail.loadOperations', 'Dependencies, decisions, and reminders', error)
    }
  }, [productId])

  useEffect(() => {
    queueMicrotask(() => void refresh())
  }, [refresh])

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
