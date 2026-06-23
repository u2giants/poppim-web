import { useEffect, useState } from 'react'
import { Save, View, Workflow } from 'lucide-react'
import { useAuth } from '@/auth/auth'
import { useAppState } from '@/lib/appState'
import type { PmSavedView, PmWorkflowTemplate } from '@/lib/types'
import { fetchSavedViews, saveCurrentView } from './api'
import { createWorkflowTemplate, fetchWorkflowTemplates } from '@/features/operating/api'

const ADMIN_AREAS = [
  'Retailers and buyers',
  'Licensors and properties',
  'Factories and sourcing constraints',
  'Product types and stage SLA targets',
  'Seasons and saved views',
]

export function SettingsPage() {
  const { user } = useAuth()
  const appState = useAppState()
  const [views, setViews] = useState<PmSavedView[]>([])
  const [templates, setTemplates] = useState<PmWorkflowTemplate[]>([])
  const [saving, setSaving] = useState(false)
  const [savingTemplate, setSavingTemplate] = useState(false)
  const [loadedUserId, setLoadedUserId] = useState<string | null>(null)

  useEffect(() => {
    if (!user?.id) return
    let active = true
    fetchSavedViews(user.id)
      .then((rows) => {
        if (!active) return
        setViews(rows)
        setLoadedUserId(user.id)
      })
      .catch(() => {
        if (!active) return
        setViews([])
        setLoadedUserId(user.id)
      })
    return () => { active = false }
  }, [user?.id])

  useEffect(() => {
    let active = true
    fetchWorkflowTemplates()
      .then((rows) => { if (active) setTemplates(rows) })
      .catch(() => { if (active) setTemplates([]) })
    return () => { active = false }
  }, [])

  async function onSaveView() {
    if (!user?.id) return
    const name = `${appState.screen} · ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
    setSaving(true)
    try {
      const saved = await saveCurrentView({
        userId: user.id,
        roleId: user.role?.id ?? null,
        name,
        screen: appState.screen,
        businessUnit: appState.businessUnit,
        filters: {
          searchQuery: appState.searchQuery,
          licensorIds: [...appState.filterLicensorIds],
          pipelineView: appState.pipelineView,
          groupBy: appState.groupBy,
          colorBy: appState.colorBy,
        },
      })
      setViews((prev) => [...prev, saved])
    } finally {
      setSaving(false)
    }
  }

  async function onCreateTemplate() {
    const name = window.prompt('Template name')
    if (!name?.trim()) return
    const description = window.prompt('Description') ?? ''
    const businessUnit = appState.businessUnit === 'Licensed'
      ? 'POP Creations'
      : appState.businessUnit === 'Generic'
        ? 'Spruce Line'
        : appState.businessUnit === 'Software'
          ? 'Software'
          : 'All'
    setSavingTemplate(true)
    try {
      const template = await createWorkflowTemplate({
        name: name.trim(),
        businessUnit,
        description: description.trim() || null,
      })
      setTemplates((prev) => [...prev, template])
    } finally {
      setSavingTemplate(false)
    }
  }

  return (
    <div className="h-full overflow-y-auto px-8 py-7">
      <div className="mb-7">
        <h2 className="font-extrabold" style={{ fontSize: 21, color: '#1B2840', letterSpacing: '-0.02em' }}>
          Settings
        </h2>
        <p className="mt-1 max-w-3xl text-[13.5px] leading-relaxed" style={{ color: '#5A6883' }}>
          Reference-data editing is intentionally not exposed in this frontend yet. These records live in Supabase and need role-aware forms before they become safe production workflows here.
        </p>
      </div>

      <section className="mb-7 rounded-xl border p-4" style={{ borderColor: '#EAEEF5', background: '#fff' }}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="flex items-center gap-2 text-[15px] font-bold" style={{ color: '#1B2840' }}>
              <View className="size-4" style={{ color: '#0094FF' }} />
              Saved views
            </h3>
            <p className="mt-1 text-[12.5px]" style={{ color: '#5A6883' }}>
              Save the current screen, business unit, search, filters, grouping, and card coloring.
            </p>
          </div>
          <button
            type="button"
            disabled={!user?.id || saving}
            onClick={onSaveView}
            className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-[13px] font-semibold text-white disabled:opacity-50"
            style={{ background: '#0094FF' }}
          >
            <Save className="size-4" />
            {saving ? 'Saving...' : 'Save current view'}
          </button>
        </div>

        <div className="mt-4 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
          {user?.id !== loadedUserId && (
            <div className="text-[13px]" style={{ color: '#94A0B5' }}>Loading saved views...</div>
          )}
          {user?.id === loadedUserId && views.length === 0 && (
            <div className="text-[13px]" style={{ color: '#94A0B5' }}>No saved views yet.</div>
          )}
          {views.map((view) => (
            <div key={view.id} className="rounded-lg px-3 py-2" style={{ background: '#F6F8FC' }}>
              <div className="truncate text-[13px] font-semibold" style={{ color: '#1B2840' }}>{view.name ?? 'Saved view'}</div>
              <div className="mt-0.5 text-[12px]" style={{ color: '#5A6883' }}>
                {[view.screen, view.business_unit].filter(Boolean).join(' · ')}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-7 rounded-xl border p-4" style={{ borderColor: '#EAEEF5', background: '#fff' }}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="flex items-center gap-2 text-[15px] font-bold" style={{ color: '#1B2840' }}>
              <Workflow className="size-4" style={{ color: '#0094FF' }} />
              Workflow templates
            </h3>
            <p className="mt-1 text-[12.5px]" style={{ color: '#5A6883' }}>
              Reusable checklist, evidence, and stage-gate patterns for product work.
            </p>
          </div>
          <button
            type="button"
            disabled={savingTemplate}
            onClick={onCreateTemplate}
            className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-[13px] font-semibold text-white disabled:opacity-50"
            style={{ background: '#0094FF' }}
          >
            <Workflow className="size-4" />
            {savingTemplate ? 'Saving...' : 'New template'}
          </button>
        </div>

        <div className="mt-4 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
          {templates.length === 0 && (
            <div className="text-[13px]" style={{ color: '#94A0B5' }}>No templates yet.</div>
          )}
          {templates.map((template) => (
            <div key={template.id} className="rounded-lg px-3 py-2" style={{ background: '#F6F8FC' }}>
              <div className="truncate text-[13px] font-semibold" style={{ color: '#1B2840' }}>{template.name ?? 'Workflow template'}</div>
              <div className="mt-0.5 text-[12px] capitalize" style={{ color: '#5A6883' }}>
                {[template.business_unit, template.object_type, template.template_type].filter(Boolean).join(' · ').replace(/_/g, ' ')}
              </div>
              {template.description && (
                <div className="mt-1 line-clamp-2 text-[12px]" style={{ color: '#94A0B5' }}>{template.description}</div>
              )}
            </div>
          ))}
        </div>
      </section>

      <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>
        {ADMIN_AREAS.map((area) => (
          <div key={area} className="rounded-xl border p-4" style={{ borderColor: '#EAEEF5', background: '#fff' }}>
            <div className="text-[14px] font-bold" style={{ color: '#1B2840' }}>{area}</div>
            <div className="mt-1 text-[12.5px]" style={{ color: '#94A0B5' }}>
              Planned Supabase-backed admin surface
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
