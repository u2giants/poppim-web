import { useEffect, useState } from 'react'
import { Tags } from 'lucide-react'
import { reportOptionalDataError, reportUiError } from '@/lib/uiError'
import type { ProductAssignee, ProductField, Subtask, ProductTag } from '@/lib/types'
import { listAssignees, listChecklist, listProductFields, listProductTags, listSubtasks, setChecklistDone, setSubtaskDone, userInitials, userName } from '@/features/board/collab'
import { ModalField } from './ProductDetailPrimitives'
import { avatarColor, formatDate } from './formatters'

export function AssigneesField({ productId }: { productId: string }) {
  const [rows, setRows] = useState<ProductAssignee[]>([])

  useEffect(() => {
    listAssignees(productId).then(setRows).catch((error) => reportOptionalDataError('productDetail.loadAssignees', 'Assignees', error))
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

export function ChecklistPanel({ productId }: { productId: string }) {
  const [items, setItems] = useState<Awaited<ReturnType<typeof listChecklist>>>([])

  useEffect(() => {
    listChecklist(productId).then(setItems).catch((error) => reportOptionalDataError('productDetail.loadChecklist', 'Checklist', error))
  }, [productId])

  if (items.length === 0) return null

  async function toggle(id: string, done: boolean) {
    setItems((prev) => prev.map((item) => item.id === id ? { ...item, done } : item))
    try { await setChecklistDone(id, done) }
    catch (error) {
      setItems((prev) => prev.map((item) => item.id === id ? { ...item, done: !done } : item))
      reportUiError('productDetail.toggleChecklist', 'The checklist change could not be saved. It was restored.', error)
    }
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

export function SubtasksPanel({ productId }: { productId: string }) {
  const [items, setItems] = useState<Subtask[]>([])

  useEffect(() => {
    listSubtasks(productId).then(setItems).catch((error) => reportOptionalDataError('productDetail.loadSubtasks', 'Subtasks', error))
  }, [productId])

  if (items.length === 0) return null

  async function toggle(id: string, done: boolean) {
    setItems((prev) => prev.map((item) => item.id === id ? { ...item, done } : item))
    try { await setSubtaskDone(id, done) }
    catch (error) {
      setItems((prev) => prev.map((item) => item.id === id ? { ...item, done: !done } : item))
      reportUiError('productDetail.toggleSubtask', 'The subtask change could not be saved. It was restored.', error)
    }
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

export function ProductTags({ productId }: { productId: string }) {
  const [tags, setTags] = useState<ProductTag[]>([])

  useEffect(() => {
    listProductTags(productId).then(setTags).catch((error) => reportOptionalDataError('productDetail.loadTags', 'Tags', error))
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

export function FieldsPane({ productId }: { productId: string }) {
  const [fields, setFields] = useState<ProductField[]>([])

  useEffect(() => {
    listProductFields(productId).then(setFields).catch((error) => reportOptionalDataError('productDetail.loadFields', 'Custom fields', error))
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
