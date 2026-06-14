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
  const [state, setState] = useState<{ user: DirectusUser | null; loading: boolean }>({ user: null, loading: true })

  async function fetchMe(): Promise<DirectusUser | null> {
    try {
      const me = await directus.request(
        readMe({ fields: ['id', 'first_name', 'last_name', 'email', 'avatar', { role: ['id', 'name'] }] }),
      )
      return me as unknown as DirectusUser
    } catch {
      return null
    }
  }

  useEffect(() => {
    let active = true
    fetchMe().then((user) => {
      if (active) setState({ user, loading: false })
    })
    return () => { active = false }
  }, [])

  async function refresh() {
    const user = await fetchMe()
    setState((prev) => ({ ...prev, user }))
  }

  async function login(email: string, password: string) {
    await directus.login(email, password)
    const user = await fetchMe()
    setState({ user, loading: false })
  }

  async function logout() {
    try {
      await directus.logout()
    } finally {
      setState({ user: null, loading: false })
    }
  }

  return (
    <AuthContext.Provider value={{ user: state.user, loading: state.loading, login, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
