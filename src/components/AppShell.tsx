import type { ReactNode } from 'react'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div
      className="h-svh overflow-hidden"
      style={{ display: 'grid', gridTemplateColumns: '236px 1fr', gridTemplateRows: '72px 1fr' }}
    >
      {/* Sidebar spans both rows */}
      <div style={{ gridRow: '1 / 3', gridColumn: '1' }}>
        <Sidebar />
      </div>
      {/* Topbar */}
      <div style={{ gridRow: '1', gridColumn: '2' }}>
        <Topbar />
      </div>
      {/* Main view area */}
      <main
        className="min-h-0 overflow-hidden"
        style={{ gridRow: '2', gridColumn: '2', background: '#fff' }}
      >
        {children}
      </main>
    </div>
  )
}
