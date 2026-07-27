import { useState } from 'react'
import type { ProductSummary } from '@/domain/products/types'
import { updateProduct } from '@/features/board/collab'
import { runUiMutation } from '@/lib/uiMutation'

export interface ProductFieldOverrides {
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
}

export function useProductFieldMutation(task: ProductSummary) {
  const [local, setLocal] = useState<ProductFieldOverrides>({})

  function applyLocal(overrides: ProductFieldOverrides, patch: Record<string, unknown>) {
    const previous = { ...local }
    const raw = task.raw as unknown as Record<string, unknown>
    const expectedUpdatedAt = typeof raw.updated_at === 'string' ? raw.updated_at : null
    void runUiMutation({
      operation: 'productDetail.updateProduct',
      optimistic: () => setLocal((current) => ({ ...current, ...overrides })),
      execute: () => updateProduct(task.id, patch, expectedUpdatedAt),
      rollback: () => setLocal(previous),
      failureMessage: 'The product change could not be saved. The previous value was restored.',
    })
  }

  return { local, applyLocal }
}
