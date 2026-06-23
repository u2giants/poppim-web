import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { signInWithMicrosoft, supabase } from '@/lib/supabase'
import type { AppUser } from '@/lib/types'

interface AuthState {
  user: AppUser | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  loginWithMicrosoft: () => Promise<void>
  logout: () => Promise<void>
  refresh: () => Promise<void>
}

const AuthContext = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<{ user: AppUser | null; loading: boolean }>({ user: null, loading: true })

  function fallbackUser(id: string, email: string | null): AppUser {
    return {
      id,
      first_name: null,
      last_name: null,
      email,
      avatar: null,
      role: null,
    }
  }

  async function fetchMe(): Promise<AppUser | null> {
    const { data: sessionData } = await supabase.auth.getSession()
    const session = sessionData.session
    if (!session) return null
    try {
      const { data, error } = await supabase.schema('api').rpc('current_user_profile')
      if (error) throw error
      const profile = data as {
        id?: string | null
        email?: string | null
        display_name?: string | null
        avatar_url?: string | null
        roles?: string[] | null
      } | null
      if (!profile?.id) return fallbackUser(session.user.id, session.user.email ?? null)
      const parts = (profile.display_name ?? '').trim().split(/\s+/).filter(Boolean)
      const primaryRole = profile.roles?.[0] ?? null
      return {
        id: profile.id,
        first_name: parts[0] ?? null,
        last_name: parts.length > 1 ? parts.slice(1).join(' ') : null,
        email: profile.email ?? session.user.email ?? null,
        avatar: profile.avatar_url ?? null,
        role: primaryRole ? { id: primaryRole, name: primaryRole } : null,
      }
    } catch {
      return fallbackUser(session.user.id, session.user.email ?? null)
    }
  }

  useEffect(() => {
    let active = true
    fetchMe().then((user) => {
      if (active) setState({ user, loading: false })
    })
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        void refresh()
      }
    })
    return () => {
      active = false
      sub.subscription.unsubscribe()
    }
  }, [])

  async function refresh() {
    const user = await fetchMe()
    setState((prev) => ({ ...prev, user }))
  }

  async function login(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    const user = await fetchMe()
    setState({ user, loading: false })
  }

  async function loginWithMicrosoft() {
    const { error } = await signInWithMicrosoft()
    if (error) throw error
  }

  async function logout() {
    try {
      await supabase.auth.signOut()
    } finally {
      setState({ user: null, loading: false })
    }
  }

  return (
    <AuthContext.Provider value={{ user: state.user, loading: state.loading, login, loginWithMicrosoft, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
