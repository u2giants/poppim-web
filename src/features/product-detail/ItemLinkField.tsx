import { useEffect, useState } from 'react'
import { useAuth } from '@/auth/auth'
import { itemLabel, readProductItemLink, saveProductItemLink, searchCanonicalItems, type CanonicalItem, type ItemLink } from './itemLink'

export function ItemLinkField({ productId }: { productId: string }) {
  const { status } = useAuth()
  const [link, setLink] = useState<ItemLink>({ itemId: null, item: null })
  const [loaded, setLoaded] = useState(false)
  const [editing, setEditing] = useState(false)
  const [search, setSearch] = useState('')
  const [items, setItems] = useState<CanonicalItem[]>([])
  const [searched, setSearched] = useState(false)
  const [next, setNext] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    readProductItemLink(productId).then((saved) => {
      if (active) { setLink(saved); setLoaded(true) }
    }).catch(() => { if (active) setError('The item link could not be loaded. Reopen this product to retry.') })
    return () => { active = false }
  }, [productId])

  async function find(after?: string) {
    setBusy(true); setError(null)
    try {
      const page = await searchCanonicalItems(search, after)
      setItems((previous) => after ? [...previous, ...page.items] : page.items)
      setNext(page.next)
      setSearched(true)
    } catch { setError('Items could not be loaded. Try again.'); setNext(null) }
    finally { setBusy(false) }
  }

  async function save(itemId: string | null) {
    setBusy(true); setError(null)
    try {
      setLink(await saveProductItemLink(productId, itemId))
      setEditing(false)
    } catch {
      setError('The item link could not be confirmed. Check your access and reopen the product before retrying.')
      setLoaded(false)
    } finally { setBusy(false) }
  }

  const summary = !loaded ? 'Item link unavailable'
    : link.item ? itemLabel(link.item)
    : link.itemId ? 'Linked item is no longer available. Choose another item or clear the link.'
    : 'Not linked'

  return <div className="space-y-2 text-sm">
    <p>{summary}</p>
    {link.item?.description && <p className="text-muted-foreground">{link.item.description}</p>}
    {error && <p role="alert" className="text-red-700">{error}</p>}
    {status === 'authenticated' && loaded && !editing && <button type="button" className="text-blue-700 underline" onClick={() => { setEditing(true); setSearched(false); void find() }}>Choose item</button>}
    {editing && <div className="space-y-2 rounded border p-2">
      <form onSubmit={(event) => { event.preventDefault(); void find() }} className="flex gap-2">
        <input aria-label="Search canonical item number" className="min-w-0 flex-1 rounded border px-2 py-1" value={search} disabled={busy} onChange={(event) => { setSearch(event.target.value); setNext(null); setItems([]); setSearched(false) }} placeholder="Item number" />
        <button type="submit" disabled={busy}>Search</button>
      </form>
      <ul className="max-h-52 space-y-1 overflow-auto">{items.map((item) => <li key={item.item_id}>
        <button type="button" disabled={busy || !loaded} className="w-full rounded p-2 text-left hover:bg-muted" onClick={() => void save(item.item_id)}>
          <span className="block">{itemLabel(item)}</span>
          <span className="block text-xs text-muted-foreground">{item.description}</span>
          <span className="block text-xs text-muted-foreground">{item.source_system}: {item.source_id}</span>
        </button>
      </li>)}</ul>
      {busy && <p role="status">Loading…</p>}
      {searched && !busy && !error && items.length === 0 && <p>No matching items.</p>}
      {next && <button type="button" disabled={busy} onClick={() => void find(next)}>Load more</button>}
      <div className="flex gap-3">
        {link.itemId && <button type="button" disabled={busy || !loaded} onClick={() => void save(null)}>Clear link</button>}
        <button type="button" disabled={busy} onClick={() => setEditing(false)}>Cancel</button>
      </div>
    </div>}
  </div>
}
