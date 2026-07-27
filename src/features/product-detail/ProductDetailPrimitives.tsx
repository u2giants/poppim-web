import type { ReactNode } from 'react'

export function PaneTab({ active, icon, onClick }: { active: boolean; icon: ReactNode; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="flex h-8 items-center justify-center rounded-md transition-colors"
      style={{ background: active ? '#fff' : 'transparent', color: active ? '#1B2840' : '#5A6883', boxShadow: active ? '0 1px 2px rgba(20,40,80,0.08)' : 'none' }}>
      {icon}
    </button>
  )
}

export function WorkflowActionButton({ icon, label, loading, disabled, onClick }: {
  icon: ReactNode; label: string; loading: boolean; disabled: boolean; onClick: () => void
}) {
  return (
    <button type="button" onClick={onClick} disabled={disabled}
      className="inline-flex h-9 items-center gap-1.5 rounded-lg border px-3 text-[12.5px] font-bold transition-colors hover:bg-[#F6F8FC] disabled:cursor-not-allowed disabled:opacity-50"
      style={{ borderColor: '#EAEEF5', color: '#1B2840' }}>
      {icon}{loading ? 'Saving...' : label}
    </button>
  )
}

export function PaneHeading({ children }: { children: ReactNode }) {
  return <div className="mb-2 text-[12px] font-bold uppercase" style={{ color: '#5A6883' }}>{children}</div>
}

export function ModalField({ label, children }: { label: string; children: ReactNode }) {
  return <div><div className="mb-1 text-[12px] font-medium" style={{ color: '#0094FF' }}>{label}</div><div>{children}</div></div>
}
