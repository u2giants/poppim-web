import { useCallback, useEffect, useState } from 'react'
import { fetchLinkQueue, itemLabel, saveProductItemLink, type LinkQueueRow } from './itemLink'

export function ItemLinkQueuePage() {
  const [rows, setRows] = useState<LinkQueueRow[]>([])
  const [next, setNext] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async (after?: string) => {
    setLoading(true); setError(null)
    try {
      const page = await fetchLinkQueue(after)
      setRows((previous) => after ? [...previous, ...page.rows] : page.rows)
      setNext(page.next)
    } catch { setError('Suggestions could not be loaded. Try again.') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { queueMicrotask(() => void load()) }, [load])

  async function link(productId: string, itemId: string) {
    setSaving(productId); setError(null)
    try {
      await saveProductItemLink(productId, itemId)
      setRows((previous) => previous.filter((row) => row.id !== productId))
    } catch { setError('That link could not be saved. Check your access and try again.') }
    finally { setSaving(null) }
  }

  return <div className="h-full overflow-y-auto bg-white">
    <div className="mx-auto flex max-w-[1000px] flex-col gap-4 px-7 py-6">
      <div>
        <h1 className="text-[22px] font-extrabold" style={{ color: '#1B2840' }}>Link items</h1>
        <p className="mt-1 text-[13.5px]" style={{ color: '#5A6883' }}>Products whose name starts with an item number. Confirm the right item, or skip it. Nothing links until you click.</p>
      </div>
      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
      <ul className="divide-y rounded border">
        {rows.map((row) => <li key={row.id} className="space-y-2 p-3 text-sm">
          <div className="flex items-start justify-between gap-3">
            <p className="font-medium">{row.name}</p>
            <button type="button" className="shrink-0 text-muted-foreground underline" onClick={() => setRows((previous) => previous.filter((other) => other.id !== row.id))}>Skip</button>
          </div>
          {row.suggestions.length > 1 && <p className="text-xs text-amber-700">Several items share this number. Choose carefully.</p>}
          {row.suggestions.map((item) => <button key={item.item_id} type="button" disabled={saving === row.id} className="block w-full rounded border p-2 text-left hover:bg-muted" onClick={() => void link(row.id, item.item_id)}>
            <span className="block text-blue-700">Link {itemLabel(item)}</span>
            {item.description && <span className="block text-xs text-muted-foreground">{item.description}</span>}
          </button>)}
        </li>)}
      </ul>
      {loading && <p role="status" className="text-sm">Loading…</p>}
      {!loading && rows.length === 0 && !next && !error && <p className="text-sm">Nothing left to link here.</p>}
      {next && !loading && <button type="button" className="self-start rounded border px-3 py-1 text-sm" onClick={() => void load(next)}>Load more</button>}
    </div>
  </div>
}
