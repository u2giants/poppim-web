import type { Product, Stage } from '@/lib/types'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

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

// Placeholder for a slice section not built yet (assignees / checklist / subtasks / comments).
function PendingSection({ title }: { title: string }) {
  return (
    <section className="space-y-2">
      <h3 className="text-sm font-semibold">{title}</h3>
      <p className="rounded-md border border-dashed p-3 text-xs text-muted-foreground">
        Coming in this slice — design spec from Claude Design pending.
      </p>
    </section>
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
      <SheetContent className="w-full gap-0 overflow-y-auto sm:max-w-lg">
        {product && (
          <>
            <SheetHeader>
              <SheetTitle className="pr-6 text-base leading-snug">
                {product.name || product.code || 'Untitled'}
              </SheetTitle>
              {stageName(product) && (
                <Badge variant="secondary" className="w-fit">{stageName(product)}</Badge>
              )}
            </SheetHeader>

            <div className="space-y-6 px-4 pb-8">
              <section>
                <Field label="Code" value={product.code} />
                <Field label="Business unit" value={product.business_unit} />
                <Field label="Retailer" value={retailerName(product)} />
                <Field label="On-shelf date" value={product.on_shelf_date} />
                <Field label="PI status" value={product.pi_status} />
              </section>
              <Separator />
              <PendingSection title="Assignees" />
              <PendingSection title="Checklist" />
              <PendingSection title="Subtasks" />
              <PendingSection title="Comments" />
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
