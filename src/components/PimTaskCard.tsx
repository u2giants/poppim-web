import { useState } from 'react'
import type { ColorBy } from '@/lib/appState'
import { CheckSquare, MessageSquare, Paperclip, Flag } from 'lucide-react'
import type { ProductSummary } from '@/domain/products/types'
import { CATEGORY_COLORS, CATEGORY_ICONS, LICENSOR_META, PRIORITY_COLORS, STAGE_COLORS } from '@/domain/products/presentation'

function cardBg(product: ProductSummary, colorBy: ColorBy): string {
  switch (colorBy) {
    case 'category': return CATEGORY_COLORS[product.category]?.bg ?? '#fff'
    case 'licensor': {
      const meta = product.licensorName ? LICENSOR_META[product.licensorName] : null
      if (meta) {
        // derive a pastel tint from the first stop of the gradient
        const match = meta.gradient.match(/#[0-9A-Fa-f]{6}/)
        if (match) {
          const hex = match[0].slice(1)
          const r = parseInt(hex.slice(0, 2), 16)
          const g = parseInt(hex.slice(2, 4), 16)
          const b = parseInt(hex.slice(4, 6), 16)
          return `rgba(${r},${g},${b},0.12)`
        }
      }
      return '#F6F8FC'
    }
    case 'stage': return STAGE_COLORS[product.stageName]?.bg ?? '#fff'
    case 'priority': {
      const map: Record<string, string> = {
        urgent: '#FBD9D9', high: '#FBE8D2', normal: '#DEEBFB', low: '#EEF1F6',
      }
      return map[product.priority] ?? '#fff'
    }
    default: return '#fff'
  }
}

const PILL_STYLES: Record<string, { bg: string; color: string }> = {
  blocked:   { bg: '#F6CDBC', color: '#9E3B1C' },
  Feedback:  { bg: '#C7E3FB', color: '#1C6BAA' },
  ASAP:      { bg: '#F4BBA4', color: '#8E3315' },
  'PI Req':  { bg: '#FBEBD3', color: '#9A6400' },
  'PI Pending': { bg: '#FBEBD3', color: '#9A6400' },
}

function avatarColor(seed: string): string {
  const colors = ['#4F9DF7', '#6B54C9', '#3F9A50', '#D24B83', '#DB6645', '#2589AB', '#239281', '#C8942A']
  let h = 0
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0
  return colors[h % colors.length]
}

export function PimTaskCard({
  task: product,
  colorBy = 'category',
  onOpen,
  dragging = false,
}: {
  task: ProductSummary
  colorBy?: ColorBy
  onOpen: (t: ProductSummary) => void
  dragging?: boolean
}) {
  const catColors = CATEGORY_COLORS[product.category]
  const licMeta = product.licensorName ? LICENSOR_META[product.licensorName] : null
  const pill = product.pill ? PILL_STYLES[product.pill] : null
  const priorityColor = PRIORITY_COLORS[product.priority]
  const bg = cardBg(product, colorBy)
  const [imgOk, setImgOk] = useState(true)

  return (
    <div
      onClick={() => !dragging && onOpen(product)}
      className="cursor-pointer select-none overflow-hidden rounded-xl transition-all"
      style={{
        background: colorBy === 'none' ? '#fff' : bg,
        border: colorBy === 'none' ? '1px solid #EAEEF5' : `1px solid ${bg}`,
        opacity: dragging ? 0.4 : 1,
        boxShadow: '0 1px 3px rgba(20,40,80,0.06)',
      }}
      onMouseEnter={e => {
        ;(e.currentTarget as HTMLElement).style.boxShadow = '0 10px 22px -10px rgba(20,40,80,0.28)'
        ;(e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'
      }}
      onMouseLeave={e => {
        ;(e.currentTarget as HTMLElement).style.boxShadow = '0 1px 3px rgba(20,40,80,0.06)'
        ;(e.currentTarget as HTMLElement).style.transform = 'translateY(0)'
      }}
    >
      {(product.coverThumbUrl ?? product.coverUrl) && imgOk && (
        <img
          src={product.coverThumbUrl ?? product.coverUrl}
          alt=""
          loading="lazy"
          className="h-28 w-full object-cover"
          onError={(e) => {
            // If the thumbnail 404s but a full original exists, fall back to it once.
            const img = e.currentTarget
            if (product.coverUrl && img.src !== product.coverUrl) img.src = product.coverUrl
            else setImgOk(false)
          }}
        />
      )}
      <div className="p-[13px_14px]">
      <div className="mb-2 flex items-center gap-1.5">
        <span
          className="rounded px-1.5 py-0.5 text-[10px] font-bold uppercase"
          style={{ background: product.businessUnit === 'Licensed' ? '#E4F1FF' : product.businessUnit === 'Generic' ? '#EAF8EF' : '#F3E8FF', color: '#1B2840' }}
        >
          {product.businessUnit}
        </span>
        {product.clickupListName && (
          <span className="truncate text-[10.5px] font-semibold" style={{ color: '#5A6883' }} title={[product.clickupFolderName, product.clickupListName].filter(Boolean).join(' / ')}>
            {product.clickupListName}
          </span>
        )}
      </div>
      {/* Title row: category tile + title */}
      <div className="flex items-start gap-2.5">
        <div
          className="flex size-[30px] shrink-0 items-center justify-center rounded-lg"
          style={{ background: catColors?.bg ?? '#F6F8FC' }}
        >
          <span className="text-[8.5px] font-black" style={{ color: catColors?.accent ?? '#5A6883' }}>
            {CATEGORY_ICONS[product.category] ?? 'PRD'}
          </span>
        </div>
        <p
          className="line-clamp-2 flex-1 font-semibold leading-[1.32]"
          style={{ fontSize: 13.5, color: '#1B2840', letterSpacing: '-0.01em' }}
        >
          {product.title}
        </p>
      </div>

      {/* Tags row: licensor badge + optional status pill */}
      <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
        {licMeta && (
          <div
            className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold text-white"
            style={{ background: licMeta.gradient, fontSize: 11 }}
          >
            <span>{licMeta.letter}</span>
            <span className="font-semibold opacity-90" style={{ fontSize: 10.5 }}>{product.licensorName}</span>
          </div>
        )}
        {product.productTypeName && (
          <span className="rounded-full px-2 py-0.5 text-[10.5px] font-bold" style={{ background: '#EEF1F6', color: '#5A6883' }}>
            {product.productTypeName}
          </span>
        )}
        {pill && (
          <span
            className="rounded-full px-2 py-0.5 text-[10.5px] font-bold"
            style={{ background: pill.bg, color: pill.color }}
          >
            {product.pill}
          </span>
        )}
      </div>

      {(product.projectTitle || product.retailerName || product.buyerName) && (
        <p className="mt-2 line-clamp-1 text-[11.5px]" style={{ color: '#5A6883' }}>
          {[product.retailerName, product.buyerName, product.projectTitle].filter(Boolean).join(' · ')}
        </p>
      )}

      {(product.lifecycleState || product.nextAction || product.waitingOn) && (
        <p className="mt-1.5 line-clamp-2 text-[11.5px] leading-snug" style={{ color: '#1B2840' }}>
          {[product.lifecycleState, product.nextAction, product.waitingOn ? `Waiting on ${product.waitingOn}` : null].filter(Boolean).join(' · ')}
        </p>
      )}

      {/* Meta row */}
      <div className="mt-2.5 flex items-center justify-between">
        {/* Left: time + due */}
        <div className="flex items-center gap-2 text-[11.5px]" style={{ color: '#94A0B5' }}>
          {product.due && (
            <span style={{ color: product.dueOver ? '#D2502B' : '#94A0B5' }}>{product.due}</span>
          )}
          {product.priority !== 'normal' && (
            <Flag className="size-3 ml-0.5" style={{ color: priorityColor }} />
          )}
        </div>

        {/* Right: checklist / comments / attachments + avatars */}
        <div className="flex items-center gap-2">
          {product.checklist.total > 0 && (
            <span className="flex items-center gap-0.5 text-[10.5px] font-medium" style={{ color: '#3FA85C' }}>
              <CheckSquare className="size-3" />
              {product.checklist.done}/{product.checklist.total}
            </span>
          )}
          {product.comments > 0 && (
            <span className="flex items-center gap-0.5 text-[10.5px] font-medium" style={{ color: '#2C8FE0' }}>
              <MessageSquare className="size-3" />
              {product.comments}
            </span>
          )}
          {product.files > 0 && (
            <span className="flex items-center gap-0.5 text-[10.5px] font-medium" style={{ color: '#D29A2E' }}>
              <Paperclip className="size-3" />
              {product.files}
            </span>
          )}
          {/* Assignee avatars */}
          <div className="flex">
            {product.assignees.slice(0, 3).map((p, i) => (
              <div
                key={p.id}
                className="flex size-[22px] shrink-0 items-center justify-center rounded-full border-2 border-white text-[8px] font-bold text-white"
                style={{
                  background: avatarColor(p.name),
                  marginLeft: i === 0 ? 0 : -6,
                  position: 'relative',
                  zIndex: 3 - i,
                }}
                title={p.name}
              >
                {p.initials}
              </div>
            ))}
          </div>
        </div>
      </div>
      </div> {/* end p-[13px_14px] */}
    </div>
  )
}
