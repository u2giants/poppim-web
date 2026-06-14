import { useEffect, useMemo, useState } from 'react'
import { Building2, Mail, PackageCheck, Search, ShoppingCart, UserRoundCheck } from 'lucide-react'
import { useAppState } from '@/lib/appState'
import type { AccountRow } from './api'
import { fetchAccountRows } from './api'

export function AccountsPage() {
  const { searchQuery } = useAppState()
  const [rows, setRows] = useState<AccountRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    fetchAccountRows(searchQuery)
      .then((next) => { if (active) setRows(next) })
      .catch((error) => {
        console.error(error)
        if (active) setRows([])
      })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [searchQuery])

  const totals = useMemo(() => ({
    buyers: rows.reduce((sum, row) => sum + row.buyers.length, 0),
    projects: rows.reduce((sum, row) => sum + row.counts.projects, 0),
    orders: rows.reduce((sum, row) => sum + row.counts.orders, 0),
  }), [rows])

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center text-sm" style={{ color: '#94A0B5' }}>
        Loading accounts...
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto bg-white">
      <div className="mx-auto flex max-w-[1480px] flex-col gap-5 px-7 py-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-[22px] font-extrabold leading-tight" style={{ color: '#1B2840' }}>
              Accounts
            </h1>
            <p className="mt-1 text-[13.5px]" style={{ color: '#5A6883' }}>
              Retailers, buyers, sample rules, project load, and order history context
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-lg border px-3 py-2 text-[12.5px]" style={{ borderColor: '#EAEEF5', color: '#5A6883' }}>
            <Search className="size-4" />
            <span>{searchQuery.trim() ? `Searching "${searchQuery.trim()}"` : 'Use sidebar search'}</span>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <Metric label="Retailers" value={rows.length.toLocaleString()} icon={Building2} color="#0094FF" />
          <Metric label="Buyers" value={totals.buyers.toLocaleString()} icon={UserRoundCheck} color="#10B981" />
          <Metric label="Orders" value={totals.orders.toLocaleString()} icon={ShoppingCart} color="#F2A23C" />
        </div>

        {rows.length === 0 ? (
          <div className="rounded-lg border px-5 py-10 text-center text-[13.5px]" style={{ borderColor: '#EAEEF5', color: '#94A0B5' }}>
            No accounts match this search.
          </div>
        ) : (
          <div className="grid gap-3 xl:grid-cols-2">
            {rows.map((row) => <AccountCard key={row.retailer.id} row={row} />)}
          </div>
        )}
      </div>
    </div>
  )
}

function Metric({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string
  value: string
  icon: typeof Building2
  color: string
}) {
  return (
    <div className="rounded-lg border px-4 py-3" style={{ borderColor: '#EAEEF5' }}>
      <div className="flex items-center justify-between gap-3">
        <span className="text-[12px] font-semibold uppercase tracking-[0.04em]" style={{ color: '#94A0B5' }}>{label}</span>
        <span className="flex size-8 items-center justify-center rounded-lg" style={{ background: `${color}18` }}>
          <Icon className="size-4" style={{ color }} />
        </span>
      </div>
      <div className="mt-2 text-[25px] font-extrabold leading-none" style={{ color: '#1B2840' }}>{value}</div>
    </div>
  )
}

function AccountCard({ row }: { row: AccountRow }) {
  return (
    <article className="rounded-lg border" style={{ borderColor: '#EAEEF5' }}>
      <div className="flex items-start justify-between gap-4 px-4 py-3" style={{ borderBottom: '1px solid #EAEEF5' }}>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Building2 className="size-4 shrink-0" style={{ color: '#0094FF' }} />
            <h2 className="truncate text-[14px] font-bold" style={{ color: '#1B2840' }}>{row.retailer.name}</h2>
          </div>
          {row.retailer.notes && (
            <p className="mt-1 line-clamp-2 text-[12.5px]" style={{ color: '#5A6883' }}>{row.retailer.notes}</p>
          )}
        </div>
        {row.retailer.resale_restriction && (
          <span className="shrink-0 rounded-md px-2 py-0.5 text-[11px] font-bold" style={{ background: '#FBE2D8', color: '#9E3B1C' }}>
            Resale restricted
          </span>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2 px-4 py-3">
        <Fact icon={UserRoundCheck} label="Buyers" value={row.buyers.length.toLocaleString()} />
        <Fact icon={PackageCheck} label="Projects" value={row.counts.projects.toLocaleString()} />
        <Fact icon={ShoppingCart} label="Orders" value={row.counts.orders.toLocaleString()} />
      </div>

      <div className="px-4 pb-4">
        {row.buyers.length === 0 ? (
          <p className="rounded-md px-3 py-2 text-[12.5px]" style={{ background: '#F6F8FC', color: '#94A0B5' }}>
            No named buyers linked yet.
          </p>
        ) : (
          <div className="space-y-2">
            {row.buyers.slice(0, 5).map((buyer) => (
              <div key={buyer.id} className="flex items-center justify-between gap-3 rounded-md px-3 py-2" style={{ background: '#F6F8FC' }}>
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-semibold" style={{ color: '#1B2840' }}>{buyer.name ?? 'Unnamed buyer'}</p>
                  {buyer.email && (
                    <p className="mt-0.5 flex items-center gap-1 truncate text-[12px]" style={{ color: '#5A6883' }}>
                      <Mail className="size-3.5 shrink-0" />
                      {buyer.email}
                    </p>
                  )}
                </div>
                {buyer.samples_required && (
                  <span className="shrink-0 rounded px-1.5 py-0.5 text-[10.5px] font-bold" style={{ background: '#FBEBD3', color: '#9A6400' }}>
                    Samples
                  </span>
                )}
              </div>
            ))}
            {row.buyers.length > 5 && (
              <p className="text-[12px]" style={{ color: '#94A0B5' }}>
                +{row.buyers.length - 5} more buyer{row.buyers.length - 5 === 1 ? '' : 's'}
              </p>
            )}
          </div>
        )}
      </div>
    </article>
  )
}

function Fact({ icon: Icon, label, value }: { icon: typeof Building2; label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-md px-2 py-1.5" style={{ background: '#F6F8FC' }}>
      <div className="flex items-center gap-1 text-[10.5px] font-bold uppercase tracking-[0.04em]" style={{ color: '#94A0B5' }}>
        <Icon className="size-3.5" />
        {label}
      </div>
      <div className="mt-0.5 truncate text-[13px] font-semibold" style={{ color: '#1B2840' }}>
        {value}
      </div>
    </div>
  )
}
