import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import type { Product } from '@/lib/types'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

function retailerName(p: Product) {
  if (!p.retailer) return null
  return typeof p.retailer === 'string' ? null : p.retailer.name
}

export function TaskCard({ product, onOpen }: { product: Product; onOpen: (p: Product) => void }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: product.id, data: { product } })
  const retailer = retailerName(product)
  return (
    <Card
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), opacity: isDragging ? 0.4 : 1 }}
      {...listeners}
      {...attributes}
      onClick={() => !isDragging && onOpen(product)}
      className="shrink-0 cursor-pointer touch-none gap-0 overflow-hidden rounded-md border-border/70 p-0 shadow-xs transition-shadow hover:shadow-sm"
    >
      {product.cover_url && (
        <img src={product.cover_url} loading="lazy" alt="" className="h-28 w-full bg-muted object-cover" />
      )}
      <div className="flex flex-col gap-1.5 p-2.5">
        <p className="line-clamp-2 text-[13px] font-medium leading-snug">
          {product.name || product.code || 'Untitled'}
        </p>
        {(product.code || retailer || product.pi_status) && (
          <div className="flex flex-wrap items-center gap-1.5">
            {product.code && <span className="font-mono text-[10px] text-muted-foreground">{product.code}</span>}
            {retailer && <Badge variant="secondary" className="px-1.5 py-0 text-[10px]">{retailer}</Badge>}
            {product.pi_status && <Badge variant="outline" className="px-1.5 py-0 text-[10px]">{product.pi_status}</Badge>}
          </div>
        )}
      </div>
    </Card>
  )
}
