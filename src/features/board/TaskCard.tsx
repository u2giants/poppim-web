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
      onClick={() => onOpen(product)}
      className="cursor-pointer gap-2 p-3 transition-colors hover:border-primary/40 hover:bg-accent/40"
    >
      <p className="line-clamp-3 text-sm font-medium leading-snug">
        {product.name || product.code || 'Untitled'}
      </p>
      <div className="flex flex-wrap items-center gap-1.5">
        {product.code && (
          <span className="text-[11px] font-mono text-muted-foreground">{product.code}</span>
        )}
        {retailer && <Badge variant="secondary" className="text-[11px]">{retailer}</Badge>}
        {product.pi_status && <Badge variant="outline" className="text-[11px]">{product.pi_status}</Badge>}
      </div>
    </Card>
  )
}
