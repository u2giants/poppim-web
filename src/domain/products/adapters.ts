import type {
  Buyer,
  Design,
  DesignCollection,
  DirectusUser,
  Factory,
  Licensor,
  Product,
  ProductType,
  Project,
  Property,
  Retailer,
  Stage,
} from '@/lib/types'
import type { BusinessUnit, PersonSummary, Priority, ProductCategory, ProductSummary } from './types'

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

function relationId(value: unknown): string | null {
  if (!value) return null
  if (typeof value === 'string') return value
  if (typeof value === 'object' && 'id' in value && typeof value.id === 'string') return value.id
  return null
}

function relationName<T extends { name?: string | null; title?: string | null }>(value: string | T | null | undefined): string | null {
  if (!value || typeof value === 'string') return null
  return value.name ?? value.title ?? null
}

function normaliseBusinessUnit(raw: string | null | undefined): BusinessUnit {
  const v = (raw ?? '').trim().toLowerCase()
  if (v === 'licensed' || v === 'pop' || v === 'pop creations') return 'Licensed'
  if (v === 'generic' || v === 'spruce' || v === 'spruce line') return 'Generic'
  if (v === 'software') return 'Software'
  return 'Unknown'
}

// Maps a ClickUp space name to its Poppim department. The three live spaces are
// POP Creations (Licensed), Spruce Line (Generic), and designflow (Software).
export function spaceToBusinessUnit(spaceName: string | null | undefined): BusinessUnit {
  const v = (spaceName ?? '').trim().toLowerCase()
  if (v === 'pop creations' || v === 'pop' || v === 'licensed') return 'Licensed'
  if (v === 'spruce line' || v === 'spruce' || v === 'generic') return 'Generic'
  if (v === 'designflow' || v === 'software') return 'Software'
  return 'Unknown'
}

function normaliseLicensor(raw: string | null | undefined): string | null {
  if (!raw) return null
  const key = raw.trim().toLowerCase()
  return LICENSOR_DISPLAY[key] ?? raw.trim().replace(/\b\w/g, (c) => c.toUpperCase())
}

const CATEGORY_KEYWORDS: Array<[RegExp, ProductCategory]> = [
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

function inferCategory(product: Product, title: string): ProductCategory {
  const productType = relationName(product.product_type as string | ProductType | null)
  const source = [productType, title].filter(Boolean).join(' ')
  for (const [re, cat] of CATEGORY_KEYWORDS) {
    if (re.test(source)) return cat
  }
  return productType ? 'unknown' : 'unknown'
}

function cleanName(raw: string | null, code: string | null): string {
  if (!raw) return code ?? 'Untitled product'
  const tabIdx = raw.indexOf('\t')
  return tabIdx !== -1 ? raw.slice(tabIdx + 1).trim() : raw.trim()
}

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

function piStatusPill(pi: string | null): string | null {
  if (!pi) return null
  if (pi === 'Required') return 'PI Req'
  if (pi.toLowerCase().includes('pending')) return 'PI Pending'
  return null
}

function normalisePriority(priority: string | null): Priority {
  const p = (priority ?? '').toLowerCase()
  if (p.includes('urgent')) return 'urgent'
  if (p.includes('high')) return 'high'
  if (p.includes('low')) return 'low'
  return 'normal'
}

function userName(u: DirectusUser | string | null | undefined) {
  if (!u || typeof u === 'string') return 'Unknown'
  return [u.first_name, u.last_name].filter(Boolean).join(' ') || u.email || 'Unknown'
}

function roleName(value: unknown): string | null {
  if (!value || typeof value === 'string') return null
  if (typeof value === 'object' && 'name' in value && typeof value.name === 'string') return value.name
  return null
}

export function userInitials(name: string) {
  return name.split(' ').filter(Boolean).slice(0, 2).map((s) => s[0]?.toUpperCase()).join('') || '?'
}

export function directusUserToPerson(u: DirectusUser | string | null | undefined): PersonSummary | null {
  if (!u || typeof u === 'string') return null
  const name = userName(u)
  return { id: u.id, name, initials: userInitials(name), email: u.email }
}

const SPACES_COVERS = 'https://poppim.nyc3.digitaloceanspaces.com/covers/'
function thumbUrl(coverUrl: string | null, id: string): string | undefined {
  if (!coverUrl) return undefined
  if (coverUrl.startsWith(SPACES_COVERS)) return `${SPACES_COVERS}${id}_thumb.webp`
  return coverUrl
}

export function productToSummary(product: Product): ProductSummary {
  const stage = product.stage as string | Stage | null
  const licensor = product.licensor as string | Licensor | null
  const project = product.project as string | Project | null
  const projectObject = typeof project === 'object' && project !== null ? project : null
  const title = cleanName(product.name, product.code)
  const dueSource = product.pps_requested_date ?? product.clickup_due_at ?? product.on_shelf_date
  const { due, dueOver } = formatDue(dueSource ?? null)
  const licensorName = normaliseLicensor(relationName(licensor))
  const nextOwnerName = directusUserToPerson(product.next_owner_user)?.name ?? null
  const nextOwnerRoleName = roleName(product.next_owner_role)
  const businessUnit = normaliseBusinessUnit(product.business_unit)
  const productTypeName = relationName(product.product_type as string | ProductType | null)
  const projectId = relationId(project)
  const retailerName = relationName(product.retailer as string | Retailer | null) ?? relationName(projectObject?.retailer as string | Retailer | null)
  const buyerName = relationName(product.buyer as string | Buyer | null) ?? relationName(projectObject?.buyer as string | Buyer | null)
  const evidenceGaps = [
    !product.next_action ? 'Next action' : null,
    !nextOwnerName && !nextOwnerRoleName && !product.waiting_on ? 'Owner / waiting-on' : null,
    !productTypeName ? 'Product type' : null,
    businessUnit !== 'Software' && !projectId ? 'Project' : null,
    businessUnit === 'Licensed' && !licensorName ? 'Licensor' : null,
    businessUnit === 'Generic' && !retailerName && !buyerName ? 'Account context' : null,
  ].filter((value): value is string => Boolean(value))

  return {
    raw: product,
    id: product.id,
    code: product.code,
    title,
    description: product.description ?? undefined,
    businessUnit,
    lifecycleState: product.lifecycle_state ?? null,
    nextAction: product.next_action ?? null,
    nextOwnerName,
    nextOwnerRoleName,
    waitingOn: product.waiting_on ?? null,
    blockerReason: product.blocker_reason ?? null,
    riskLevel: product.risk_level ?? null,
    evidenceGaps,
    stageId: relationId(stage),
    stageName: relationName(stage) ?? (typeof stage === 'string' ? stage : 'Unknown'),
    licensorId: relationId(licensor),
    licensorName,
    propertyName: relationName(product.property as string | Property | null),
    productTypeName,
    retailerId: relationId(product.retailer as string | Retailer | null) ?? relationId(projectObject?.retailer as string | Retailer | null),
    retailerName,
    buyerId: relationId(product.buyer as string | Buyer | null) ?? relationId(projectObject?.buyer as string | Buyer | null),
    buyerName,
    projectId,
    projectTitle: relationName(project),
    designName: relationName(product.design as string | Design | null),
    designCollectionName: relationName(product.design_collection as string | DesignCollection | null),
    factoryName: relationName(product.factory as string | Factory | null),
    category: inferCategory(product, title),
    priority: normalisePriority(product.priority),
    clickupSpaceName: product.clickup_space_name ?? null,
    clickupFolderName: product.clickup_folder_name ?? null,
    clickupListName: product.clickup_list_name ?? null,
    clickupCreatorName: product.clickup_creator_name ?? null,
    clickupTimeEstimateMs: product.clickup_time_estimate_ms != null ? Number(product.clickup_time_estimate_ms) : null,
    // Stored as a 32-decimal string; Number() is enough precision for ordering.
    clickupOrderindex: product.clickup_orderindex != null ? Number(product.clickup_orderindex) : null,
    due,
    dueOver,
    onShelfDate: product.on_shelf_date ?? null,
    ppsRequestedDate: product.pps_requested_date ?? null,
    piStatus: product.pi_status,
    brandAssuranceNumber: product.brand_assurance_number ?? null,
    closureReason: product.closure_reason ?? null,
    pill: piStatusPill(product.pi_status),
    assignees: [],
    checklist: { done: 0, total: 0 },
    comments: 0,
    files: 0,
    coverUrl: product.cover_url ?? undefined,
    coverThumbUrl: thumbUrl(product.cover_url, product.id),
    legacy: {
      clickupUrl: product.clickup_url ?? undefined,
      clickupListName: product.clickup_list_name ?? undefined,
      clickupCreatedAt: product.clickup_created_at ?? undefined,
      clickupUpdatedAt: product.clickup_updated_at ?? undefined,
      clickupClosedAt: product.clickup_closed_at ?? undefined,
      clickupStartAt: product.clickup_start_at ?? undefined,
      clickupDueAt: product.clickup_due_at ?? undefined,
    },
  }
}

export function orderedStageNames(stages: Stage[], businessUnit?: BusinessUnit): string[] {
  const filtered = businessUnit
    ? stages.filter((s) => normaliseBusinessUnit(s.business_unit) === businessUnit || normaliseBusinessUnit(s.business_unit) === 'Unknown')
    : stages
  const sorted = [...filtered].sort((a, b) => (a.stage_order ?? 0) - (b.stage_order ?? 0))
  const seen = new Set<string>()
  return sorted.map((s) => s.name).filter((n) => (seen.has(n) ? false : (seen.add(n), true)))
}
