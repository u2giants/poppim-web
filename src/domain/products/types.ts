import type { Product } from '@/lib/types'

export type BusinessUnit = 'Licensed' | 'Generic' | 'Software' | 'Unknown'
export type Priority = 'urgent' | 'high' | 'normal' | 'low'
export type ProductCategory =
  | 'textiles'
  | 'frames'
  | 'kitchen'
  | 'lighting'
  | 'plush'
  | 'candle'
  | 'storage'
  | 'seasonal'
  | 'bath'
  | 'unknown'

export interface PersonSummary {
  id: string
  name: string
  initials: string
  email?: string | null
}

export interface CountSummary {
  done: number
  total: number
}

export interface ProductLegacySource {
  clickupUrl?: string
  clickupListName?: string
  clickupCreatedAt?: string
  clickupUpdatedAt?: string
  clickupClosedAt?: string
  clickupStartAt?: string
  clickupDueAt?: string
}

export interface ProductSummary {
  raw: Product
  id: string
  code: string | null
  title: string
  description?: string
  businessUnit: BusinessUnit
  lifecycleState: string | null
  nextAction: string | null
  waitingOn: string | null
  blockerReason: string | null
  riskLevel: string | null
  stageId: string | null
  stageName: string
  licensorId: string | null
  licensorName: string | null
  propertyName: string | null
  productTypeName: string | null
  retailerName: string | null
  buyerName: string | null
  projectId: string | null
  projectTitle: string | null
  designName: string | null
  designCollectionName: string | null
  factoryName: string | null
  category: ProductCategory
  priority: Priority
  clickupSpaceName: string | null
  clickupFolderName: string | null
  clickupListName: string | null
  clickupCreatorName: string | null
  due: string | null
  dueOver: boolean
  onShelfDate: string | null
  ppsRequestedDate: string | null
  piStatus: string | null
  brandAssuranceNumber: string | null
  closureReason: string | null
  pill: string | null
  assignees: PersonSummary[]
  checklist: CountSummary
  comments: number
  files: number
  coverUrl?: string
  coverThumbUrl?: string
  legacy: ProductLegacySource
}
