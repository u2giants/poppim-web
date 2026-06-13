// Converts real Directus Product + Stage data to the display shape PimTaskCard expects.

import type { Product, Stage } from '@/lib/types'
import type { MockTask, Category } from '@/lib/mockData'

// ─── Licensor normalisation ──────────────────────────────────────────────────

export const LICENSOR_DISPLAY: Record<string, string> = {
  disney: 'Disney',
  marvel: 'Marvel',
  'star wars': 'Star Wars',
  wb: 'WB',
  nbcu: 'NBCU',
  nick: 'Nickelodeon',
  nickelodeon: 'Nickelodeon',
  sanrio: 'Sanrio',
  peanuts: 'Peanuts',
  sega: 'Sega',
  wwe: 'WWE',
  'care bears': 'Care Bears',
  'coca cola': 'Coca-Cola',
  'one piece': 'One Piece',
  'sesame street': 'Sesame Street',
  'strawberry shortcake': 'Strawberry SC',
  lucasfilm: 'Lucasfilm',
  seasonal: 'Seasonal',
}

function normaliseLicensor(raw: string | null | undefined): string {
  if (!raw) return 'Unknown'
  const key = raw.trim().toLowerCase()
  return LICENSOR_DISPLAY[key] ?? raw.trim().replace(/\b\w/g, (c) => c.toUpperCase())
}

// ─── Category inference ──────────────────────────────────────────────────────

const CATEGORY_KEYWORDS: Array<[RegExp, Category]> = [
  [/canvas|frame|art|print|poster|picture|sign|decal/i, 'frames'],
  [/plush|stuffed|plushie/i, 'plush'],
  [/candle/i, 'candle'],
  [/lamp|light|luminara|lantern|night\s*light/i, 'lighting'],
  [/mug|cup|apron|plate|bowl|kitchen|utensil|towel(?=.*kitchen)|trivet/i, 'kitchen'],
  [/bath|shower|mat(?=.*bath)|loofa/i, 'bath'],
  [/pillow|throw|blanket|tapestry|textile|quilt|bedding|towel(?!.*kitchen)/i, 'textiles'],
  [/ornament|holiday|christmas|seasonal|wreath/i, 'seasonal'],
  [/storage|bin|basket|box|bag|organizer/i, 'storage'],
]

function inferCategory(name: string): Category {
  for (const [re, cat] of CATEGORY_KEYWORDS) {
    if (re.test(name)) return cat
  }
  return 'storage'
}

// ─── Stage colour hashing ────────────────────────────────────────────────────
// Assigns one of 8 deterministic palette slots by hashing the stage name.

const STAGE_PALETTE: Array<{ bg: string; dot: string }> = [
  { bg: '#ECE2F8', dot: '#8B5CF6' }, // violet
  { bg: '#DEEBFB', dot: '#3B82F6' }, // blue
  { bg: '#D8EFF5', dot: '#0891B2' }, // cyan
  { bg: '#D8EFE7', dot: '#10B981' }, // emerald
  { bg: '#FBEBD3', dot: '#F59E0B' }, // amber
  { bg: '#FBE2D8', dot: '#EF4444' }, // red
  { bg: '#F7E5EC', dot: '#DB2777' }, // pink
  { bg: '#DEF0DB', dot: '#22C55E' }, // green
]

function hashStr(s: string) {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return h
}

export function stageColor(stageName: string): { bg: string; dot: string } {
  return STAGE_PALETTE[hashStr(stageName) % STAGE_PALETTE.length]
}

// ─── Name cleanup ────────────────────────────────────────────────────────────
// ClickUp-imported names may have a catalog code + tab prepended: "MTP78\tReal name"

function cleanName(raw: string | null, code: string | null): string {
  if (!raw) return code ?? 'Untitled'
  const tabIdx = raw.indexOf('\t')
  return tabIdx !== -1 ? raw.slice(tabIdx + 1).trim() : raw.trim()
}

// ─── Due date formatting ─────────────────────────────────────────────────────

function formatDue(iso: string | null): { due: string | null; dueOver: boolean } {
  if (!iso) return { due: null, dueOver: false }
  const delta = Math.ceil((new Date(iso).getTime() - Date.now()) / 86_400_000)
  if (delta < 0) return { due: 'Overdue', dueOver: true }
  if (delta === 0) return { due: 'Today', dueOver: false }
  if (delta === 1) return { due: '1d left', dueOver: false }
  if (delta < 30) return { due: `${delta}d left`, dueOver: false }
  return {
    due: new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    dueOver: false,
  }
}

// ─── Pill mapping ────────────────────────────────────────────────────────────

function piStatusPill(pi: string | null): string | null {
  if (!pi) return null
  if (pi === 'Required') return 'PI Req'
  if (pi === 'Completed') return null
  return null
}

function normalisePriority(priority: string | null): MockTask['priority'] {
  const p = (priority ?? '').toLowerCase()
  if (p.includes('urgent')) return 'urgent'
  if (p.includes('high')) return 'high'
  if (p.includes('low')) return 'low'
  return 'normal'
}

// ─── Main converter ──────────────────────────────────────────────────────────

export function productToTask(product: Product): MockTask {
  const licensorRaw =
    typeof product.licensor === 'object' && product.licensor !== null
      ? product.licensor.name
      : null
  const licensor = normaliseLicensor(licensorRaw)
  const stageRaw =
    typeof product.stage === 'object' && product.stage !== null
      ? product.stage.name
      : typeof product.stage === 'string'
        ? product.stage
        : 'Unknown'
  const title = cleanName(product.name, product.code)
  const { due, dueOver } = formatDue(product.clickup_due_at ?? product.on_shelf_date)

  return {
    id: product.id,
    stage: stageRaw,
    title,
    licensor,
    category: inferCategory(title),
    priority: normalisePriority(product.priority),
    time: '',
    due,
    dueOver,
    checklist: { done: 0, total: 0 },
    comments: 0,
    attach: 0,
    pill: piStatusPill(product.pi_status),
    assignees: [],
    coverUrl: product.cover_url ?? undefined,
    coverThumbUrl: thumbUrl(product.cover_url, product.id),
    description: product.description ?? undefined,
    clickupUrl: product.clickup_url ?? undefined,
    clickupListName: product.clickup_list_name ?? undefined,
    clickupCreatedAt: product.clickup_created_at ?? undefined,
    clickupUpdatedAt: product.clickup_updated_at ?? undefined,
    clickupClosedAt: product.clickup_closed_at ?? undefined,
    clickupStartAt: product.clickup_start_at ?? undefined,
    clickupDueAt: product.clickup_due_at ?? undefined,
  }
}

// Covers stored on DigitalOcean Spaces have a companion thumbnail at
// covers/<id>_thumb.webp (board cards use the thumb; the opened card uses the
// full original). For covers still on ClickUp's CDN (mid-migration) there is no
// thumb, so the card falls back to the full URL.
const SPACES_COVERS = 'https://poppim.nyc3.digitaloceanspaces.com/covers/'
function thumbUrl(coverUrl: string | null, id: string): string | undefined {
  if (!coverUrl) return undefined
  if (coverUrl.startsWith(SPACES_COVERS)) return `${SPACES_COVERS}${id}_thumb.webp`
  return coverUrl
}

// ─── Stage list ordering ─────────────────────────────────────────────────────
// Builds the ordered list of stage names from fetched Stage objects.

export function orderedStageNames(stages: Stage[]): string[] {
  const sorted = [...stages].sort((a, b) => (a.stage_order ?? 0) - (b.stage_order ?? 0))
  const seen = new Set<string>()
  return sorted.map((s) => s.name).filter((n) => (seen.has(n) ? false : (seen.add(n), true)))
}
