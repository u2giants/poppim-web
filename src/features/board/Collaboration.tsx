import { useEffect, useState } from 'react'
import type { ChecklistItem, Subtask, ProductAssignee, Comment, DirectusUser } from '@/lib/types'
import * as collab from './collab'
import { userName, userInitials } from './collab'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Plus, X, Trash2 } from 'lucide-react'

function SectionTitle({ children, count }: { children: React.ReactNode; count?: string }) {
  return (
    <div className="flex items-center gap-2">
      <h3 className="text-sm font-semibold">{children}</h3>
      {count && <span className="text-xs text-muted-foreground">{count}</span>}
    </div>
  )
}

// ---------- Assignees ----------
export function AssigneeSection({ productId }: { productId: string }) {
  const [rows, setRows] = useState<ProductAssignee[]>([])
  const [users, setUsers] = useState<DirectusUser[]>([])

  const load = () => collab.listAssignees(productId).then(setRows)
  useEffect(() => {
    load()
    collab.listUsers().then(setUsers).catch(() => setUsers([]))
  }, [productId])

  const assignedIds = new Set(rows.map((r) => (typeof r.directus_user === 'string' ? r.directus_user : r.directus_user.id)))
  const available = users.filter((u) => !assignedIds.has(u.id))

  return (
    <section className="space-y-2">
      <SectionTitle>Assignees</SectionTitle>
      <div className="flex flex-wrap items-center gap-2">
        {rows.map((r) => (
          <span key={r.id} className="group flex items-center gap-1 rounded-full bg-muted py-0.5 pl-0.5 pr-2 text-xs">
            <Avatar className="size-5"><AvatarFallback className="text-[9px]">{userInitials(r.directus_user)}</AvatarFallback></Avatar>
            {userName(r.directus_user)}
            <button onClick={() => collab.removeAssignee(r.id).then(load)} className="text-muted-foreground hover:text-destructive">
              <X className="size-3" />
            </button>
          </span>
        ))}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-7 gap-1 rounded-full text-xs">
              <Plus className="size-3" /> Assign
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="max-h-64 overflow-y-auto">
            {available.length === 0 && <div className="px-2 py-1.5 text-xs text-muted-foreground">No one to add</div>}
            {available.map((u) => (
              <DropdownMenuItem key={u.id} onClick={() => collab.addAssignee(productId, u.id).then(load)}>
                <Avatar className="size-5"><AvatarFallback className="text-[9px]">{userInitials(u)}</AvatarFallback></Avatar>
                {userName(u)}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </section>
  )
}

// ---------- Checklist ----------
export function ChecklistSection({ productId }: { productId: string }) {
  const [items, setItems] = useState<ChecklistItem[]>([])
  const [draft, setDraft] = useState('')
  const load = () => collab.listChecklist(productId).then(setItems)
  useEffect(() => { load() }, [productId])

  const add = async () => {
    if (!draft.trim()) return
    await collab.addChecklist(productId, draft.trim())
    setDraft('')
    load()
  }
  const done = items.filter((i) => i.done).length

  return (
    <section className="space-y-2">
      <SectionTitle count={items.length ? `${done}/${items.length}` : undefined}>Checklist</SectionTitle>
      <ul className="space-y-1">
        {items.map((i) => (
          <li key={i.id} className="group flex items-center gap-2 text-sm">
            <Checkbox checked={i.done} onCheckedChange={(v) => collab.setChecklistDone(i.id, !!v).then(load)} />
            <span className={i.done ? 'flex-1 text-muted-foreground line-through' : 'flex-1'}>{i.label}</span>
            <button onClick={() => collab.removeChecklist(i.id).then(load)} className="text-muted-foreground opacity-0 hover:text-destructive group-hover:opacity-100">
              <Trash2 className="size-3.5" />
            </button>
          </li>
        ))}
      </ul>
      <div className="flex gap-2">
        <Input value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && add()} placeholder="Add an item…" className="h-8" />
        <Button size="sm" variant="secondary" onClick={add}>Add</Button>
      </div>
    </section>
  )
}

// ---------- Subtasks ----------
export function SubtaskSection({ productId }: { productId: string }) {
  const [items, setItems] = useState<Subtask[]>([])
  const [draft, setDraft] = useState('')
  const load = () => collab.listSubtasks(productId).then(setItems)
  useEffect(() => { load() }, [productId])

  const add = async () => {
    if (!draft.trim()) return
    await collab.addSubtask(productId, draft.trim())
    setDraft('')
    load()
  }

  return (
    <section className="space-y-2">
      <SectionTitle count={items.length ? String(items.length) : undefined}>Subtasks</SectionTitle>
      <ul className="space-y-1">
        {items.map((s) => (
          <li key={s.id} className="flex items-center gap-2 text-sm">
            <Checkbox checked={s.done} onCheckedChange={(v) => collab.setSubtaskDone(s.id, !!v).then(load)} />
            <span className={s.done ? 'flex-1 text-muted-foreground line-through' : 'flex-1'}>{s.title}</span>
            {s.assignee && typeof s.assignee !== 'string' && (
              <Avatar className="size-5"><AvatarFallback className="text-[9px]">{userInitials(s.assignee)}</AvatarFallback></Avatar>
            )}
          </li>
        ))}
      </ul>
      <div className="flex gap-2">
        <Input value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && add()} placeholder="Add a subtask…" className="h-8" />
        <Button size="sm" variant="secondary" onClick={add}>Add</Button>
      </div>
    </section>
  )
}

// ---------- Comments ----------
function timeAgo(iso: string) {
  const d = new Date(iso)
  return isNaN(d.getTime()) ? '' : d.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export function CommentSection({ productId }: { productId: string }) {
  const [comments, setComments] = useState<Comment[]>([])
  const [draft, setDraft] = useState('')
  const [busy, setBusy] = useState(false)
  const load = () => collab.listComments(productId).then(setComments).catch(() => setComments([]))
  useEffect(() => { load() }, [productId])

  const post = async () => {
    if (!draft.trim()) return
    setBusy(true)
    try {
      await collab.addComment(productId, draft.trim())
      setDraft('')
      await load()
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="border-b px-4 py-3">
        <SectionTitle count={comments.length ? String(comments.length) : undefined}>Activity</SectionTitle>
      </div>
      <div className="flex-1 space-y-4 overflow-y-auto px-4 py-3">
        {comments.map((c) => (
          <div key={c.id} className="flex gap-2.5">
            <Avatar className="size-7 shrink-0"><AvatarFallback className="text-[10px]">{userInitials(c.user_created)}</AvatarFallback></Avatar>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline gap-2">
                <span className="text-sm font-medium">{userName(c.user_created)}</span>
                <span className="text-xs text-muted-foreground">{timeAgo(c.date_created)}</span>
              </div>
              <p className="whitespace-pre-wrap text-sm">{c.comment}</p>
            </div>
          </div>
        ))}
        {comments.length === 0 && <p className="text-xs text-muted-foreground">No activity yet. Start the conversation below.</p>}
      </div>
      <div className="shrink-0 space-y-2 border-t p-3">
        <Textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) post() }}
          placeholder="Add a comment…"
          rows={2}
        />
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">⌘↵ to send</span>
          <Button size="sm" onClick={post} disabled={busy || !draft.trim()}>{busy ? 'Posting…' : 'Comment'}</Button>
        </div>
      </div>
    </div>
  )
}
