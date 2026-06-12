import { useState, useRef } from 'react'
import { LICENSORS, LICENSOR_META, LICENSOR_PRODUCTS } from '@/lib/mockData'
import { UserPlus, X } from 'lucide-react'

type Tab = 'licensors' | 'customers'

const CUSTOMERS = [
  { name: 'Target', orders: 15 },
  { name: 'Walmart', orders: 12 },
  { name: 'Amazon', orders: 8 },
  { name: 'HomeGoods', orders: 5 },
  { name: 'Hobby Lobby', orders: 3 },
]

export function SettingsPage() {
  const [tab, setTab] = useState<Tab>('licensors')
  const [logos, setLogos] = useState<Record<string, string>>({})

  function handleLogoUpload(name: string, file: File) {
    const reader = new FileReader()
    reader.onload = (e) => {
      const url = e.target?.result as string
      setLogos((prev) => ({ ...prev, [name]: url }))
    }
    reader.readAsDataURL(file)
  }

  function removeLogo(name: string) {
    setLogos((prev) => {
      const next = { ...prev }
      delete next[name]
      return next
    })
  }

  return (
    <div className="h-full overflow-y-auto px-8 py-7">
      {/* Header */}
      <div className="mb-7 flex items-start justify-between">
        <div>
          <h2
            className="font-extrabold"
            style={{ fontSize: 21, color: '#1B2840', letterSpacing: '-0.02em' }}
          >
            {tab === 'licensors' ? 'Licensors' : 'Customers'}
          </h2>
          <p className="mt-1 text-[13.5px]" style={{ color: '#5A6883' }}>
            Manage {tab === 'licensors' ? 'licensor' : 'customer'} records. Click a tile or drag an image onto it to upload artwork — it appears on every card automatically.
          </p>
        </div>

        <button
          className="flex items-center gap-2 rounded-[10px] px-4 py-2.5 text-[13px] font-semibold text-white"
          style={{ background: '#0094FF', boxShadow: '0 4px 12px -4px rgba(0,148,255,0.5)' }}
        >
          <UserPlus className="size-4" />
          Invite people
        </button>
      </div>

      {/* Tabs */}
      <div className="mb-5 flex gap-1">
        {(['licensors', 'customers'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="rounded-lg px-4 py-2 text-[13.5px] font-semibold transition-colors"
            style={
              tab === t
                ? { background: '#0094FF', color: '#fff' }
                : { background: '#F6F8FC', color: '#5A6883' }
            }
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl" style={{ border: '1px solid #EAEEF5' }}>
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: '1px solid #EAEEF5', background: '#F6F8FC' }}>
              <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-[0.04em]" style={{ color: '#94A0B5' }}>
                Logo
              </th>
              <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-[0.04em]" style={{ color: '#94A0B5' }}>
                Name
              </th>
              <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-[0.04em]" style={{ color: '#94A0B5' }}>
                {tab === 'licensors' ? 'Active products' : 'Open orders'}
              </th>
              <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-[0.04em]" style={{ color: '#94A0B5' }}>
                Logo file
              </th>
            </tr>
          </thead>
          <tbody>
            {tab === 'licensors'
              ? LICENSORS.map((name) => (
                <LicensorRow
                  key={name}
                  name={name}
                  logo={logos[name]}
                  onUpload={(f) => handleLogoUpload(name, f)}
                  onRemove={() => removeLogo(name)}
                />
              ))
              : CUSTOMERS.map((c) => (
                <CustomerRow key={c.name} name={c.name} orders={c.orders} />
              ))
            }
          </tbody>
        </table>
      </div>
    </div>
  )
}

function LicensorRow({
  name,
  logo,
  onUpload,
  onRemove,
}: {
  name: string
  logo?: string
  onUpload: (f: File) => void
  onRemove: () => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const licMeta = LICENSOR_META[name]
  const [dragging, setDragging] = useState(false)

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) onUpload(file)
  }

  return (
    <tr style={{ borderBottom: '1px solid #EAEEF5' }}>
      {/* Logo tile */}
      <td className="px-5 py-3">
        <div
          className="relative flex size-[48px] cursor-pointer items-center justify-center overflow-hidden rounded-xl transition-all"
          style={{
            background: logo ? 'transparent' : (licMeta?.gradient ?? '#F6F8FC'),
            border: dragging ? '2px dashed #0094FF' : '2px solid transparent',
          }}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
        >
          {logo ? (
            <img src={logo} alt={name} className="h-full w-full object-contain" />
          ) : (
            <span className="text-[20px] font-black text-white">{licMeta?.letter ?? name[0]}</span>
          )}
          {/* Upload badge */}
          <div
            className="absolute bottom-0.5 right-0.5 flex size-5 items-center justify-center rounded-full bg-white text-[10px] font-bold"
            style={{ color: '#0094FF', boxShadow: '0 1px 4px rgba(0,0,0,0.12)' }}
          >
            +
          </div>
          {logo && (
            <button
              className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-red-500 text-white"
              onClick={(e) => { e.stopPropagation(); onRemove() }}
            >
              <X className="size-3" />
            </button>
          )}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) onUpload(file)
          }}
        />
      </td>

      {/* Name */}
      <td className="px-5 py-3">
        <span className="text-[14px] font-semibold" style={{ color: '#1B2840' }}>{name}</span>
      </td>

      {/* Active products */}
      <td className="px-5 py-3">
        <span className="text-[14px]" style={{ color: '#5A6883' }}>{LICENSOR_PRODUCTS[name] ?? 0}</span>
      </td>

      {/* Logo file hint */}
      <td className="px-5 py-3">
        <span className="text-[13px]" style={{ color: '#94A0B5' }}>
          {logo ? 'Logo uploaded' : 'Click or drag PNG / SVG'}
        </span>
      </td>
    </tr>
  )
}

function CustomerRow({ name, orders }: { name: string; orders: number }) {
  return (
    <tr style={{ borderBottom: '1px solid #EAEEF5' }}>
      <td className="px-5 py-3">
        <div
          className="flex size-[48px] items-center justify-center rounded-xl text-[18px] font-black text-white"
          style={{ background: 'linear-gradient(135deg,#5A6883,#3A4860)' }}
        >
          {name[0]}
        </div>
      </td>
      <td className="px-5 py-3">
        <span className="text-[14px] font-semibold" style={{ color: '#1B2840' }}>{name}</span>
      </td>
      <td className="px-5 py-3">
        <span className="text-[14px]" style={{ color: '#5A6883' }}>{orders}</span>
      </td>
      <td className="px-5 py-3">
        <span className="text-[13px]" style={{ color: '#94A0B5' }}>Click or drag PNG / SVG</span>
      </td>
    </tr>
  )
}
