import type { Product } from '@/lib/types'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

function retailerName(p: Product) {
  if (!p.retailer) return null
  return typeof p.retailer === 'string' ? null : p.retailer.name
}

export function TaskCard({ product, onOpen }: { product: Product; onOpen: (p: Product) => void }) {
  const retailer = retailerName(product)
  return (
    <Card
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('text/product', product.id)
        e.dataTransfer.effectAllowed = 'move'
      }}
      onClick={() => onOpen(product)}
      className="cursor-pointer gap-2 rounded-md border-border/70 p-3 shadow-xs transition-all hover:border-primary/40 hover:shadow-sm active:cursor-grabbing"
    >
      <p className="line-clamp-3 text-sm font-medium leading-snug">
        {product.name || product.code || 'Untitled'}
      </p>
      {(product.code || retailer || product.pi_status) && (
        <div className="flex flex-wrap items-center gap-1.5">
          {product.code && (
            <span className="font-mono text-[11px] text-muted-foreground">{product.code}</span>
          )}
          {retailer && <Badge variant="secondary" className="text-[11px]">{retailer}</Badge>}
          {product.pi_status && <Badge variant="outline" className="text-[11px]">{product.pi_status}</Badge>}
        </div>
      )}
    </Card>
  )
}
