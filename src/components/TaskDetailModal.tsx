import { ProductDetailModal, type ProductDetailModalProps } from '@/features/product-detail/ProductDetailModal'

/**
 * Stable shell import retained for callers while product-detail behavior lives
 * in its explicit feature domain.
 */
export function TaskDetailModal(props: ProductDetailModalProps) {
  return <ProductDetailModal {...props} />
}
