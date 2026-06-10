import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { readMe } from '@directus/sdk'
import { directus } from '@/lib/directus'
import type { DirectusUser } from '@/lib/types'

interface AuthState {
  user: DirectusUser | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  refresh: () => Promise<void>
}

const AuthContext = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<DirectusUser | null>(null)
  const [loading, setLoading] = useState(true)

  async function refresh() {
    try {
      const me = await directus.request(
        readMe({ fields: ['id', 'first_name', 'last_name', 'email', 'avatar', { role: ['id', 'name'] }] }),
      )
      setUser(me as unknown as DirectusUser)
    } catch {
      setUser(null)
    }
  }

  useEffect(() => {
    refresh().finally(() => setLoading(false))
  }, [])

  async function login(email: string, password: string) {
    await directus.login(email, password)
    await refresh()
  }

  async function logout() {
    try {
      await directus.logout()
    } finally {
      setUser(null)
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
