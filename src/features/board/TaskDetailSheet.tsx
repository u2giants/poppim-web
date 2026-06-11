import type { Product, Stage } from '@/lib/types'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { AssigneeSection, ChecklistSection, SubtaskSection, CommentSection } from './Collaboration'

function stageName(p: Product): string | null {
  if (!p.stage) return null
  return typeof p.stage === 'string' ? null : p.stage.name
}
function retailerName(p: Product): string | null {
  if (!p.retailer) return null
  return typeof p.retailer === 'string' ? null : p.retailer.name
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid grid-cols-3 gap-2 py-1.5 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="col-span-2">{value ?? <span className="text-muted-foreground">—</span>}</span>
    </div>
  )
}

export function TaskDetailSheet({
  product,
  stages,
  onClose,
}: {
  product: Product | null
  stages: Stage[]
  onClose: () => void
}) {
  void stages
  return (
    <Sheet open={!!product} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="flex w-full flex-col gap-0 p-0 sm:max-w-[720px]">
        {product && (
          <>
            {/* Header */}
            <SheetHeader className="shrink-0 gap-2 border-b p-4">
              {stageName(product) && (
                <Badge variant="secondary" className="w-fit">{stageName(product)}</Badge>
              )}
              <SheetTitle className="pr-8 text-base leading-snug">
                {product.name || product.code || 'Untitled'}
              </SheetTitle>
              <AssigneeSection productId={product.id} />
            </SheetHeader>

            {/* Two-column body */}
            <div className="flex min-h-0 flex-1 flex-col sm:flex-row">
              {/* Left: fields + checklist + subtasks */}
              <div className="space-y-6 overflow-y-auto border-b p-4 sm:w-[340px] sm:shrink-0 sm:border-b-0 sm:border-r">
                <section>
                  <Field label="Code" value={product.code} />
                  <Field label="Retailer" value={retailerName(product)} />
                  <Field label="Business unit" value={product.business_unit} />
                  <Field label="On-shelf" value={product.on_shelf_date} />
                  <Field label="PI status" value={product.pi_status} />
                </section>
                <ChecklistSection productId={product.id} />
                <SubtaskSection productId={product.id} />
              </div>
              {/* Right: activity feed + composer */}
              <div className="flex min-h-0 min-w-0 flex-1 flex-col">
                <CommentSection productId={product.id} />
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
