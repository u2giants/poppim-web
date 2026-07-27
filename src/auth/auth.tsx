import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { signInWithMicrosoft, supabase } from '@/lib/supabase'
import type { AppUser } from '@/lib/types'
import { createAuthRequestGuard } from './authRequestGuard'

export type AuthStatus = 'loading' | 'signed_out' | 'authenticated' | 'profile_missing' | 'profile_error'

interface AuthState {
  user: AppUser | null
  status: AuthStatus
  loading: boolean
  profileError: string | null
  login: (email: string, password: string) => Promise<void>
  loginWithMicrosoft: () => Promise<void>
  logout: () => Promise<void>
  refresh: () => Promise<void>
}

const AuthContext = createContext<AuthState | null>(null)

type ProfileRow = {
  id?: string | null
  email?: string | null
  display_name?: string | null
  avatar_url?: string | null
  roles?: string[] | null
}

function toAppUser(profile: ProfileRow, sessionEmail: string | null): AppUser {
  const parts = (profile.display_name ?? '').trim().split(/\s+/).filter(Boolean)
  const primaryRole = profile.roles?.[0] ?? null
  return {
    id: profile.id!,
    first_name: parts[0] ?? null,
    last_name: parts.length > 1 ? parts.slice(1).join(' ') : null,
    email: profile.email ?? sessionEmail,
    avatar: profile.avatar_url ?? null,
    role: primaryRole ? { id: primaryRole, name: primaryRole } : null,
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<{ user: AppUser | null; status: AuthStatus; profileError: string | null }>({
    user: null,
    status: 'loading',
    profileError: null,
  })
  const requestGuard = useRef(createAuthRequestGuard())

  const resolveProfile = useCallback(async () => {
    const currentRequest = requestGuard.current.begin()
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
    if (!requestGuard.current.isCurrent(currentRequest)) return
    if (sessionError) {
      setState({ user: null, status: 'profile_error', profileError: sessionError.message })
      return
    }
    const session = sessionData.session
    if (!session) {
      setState({ user: null, status: 'signed_out', profileError: null })
      return
    }
    const { data, error } = await supabase.schema('api').rpc('current_user_profile')
    if (!requestGuard.current.isCurrent(currentRequest)) return
    if (error) {
      setState({ user: null, status: 'profile_error', profileError: error.message })
      return
    }
    const profile = data as ProfileRow | null
    if (!profile?.id) {
      setState({ user: null, status: 'profile_missing', profileError: null })
      return
    }
    setState({
      user: toAppUser(profile, session.user.email ?? null),
      status: 'authenticated',
      profileError: null,
    })
  }, [])

  useEffect(() => {
    const guard = requestGuard.current
    queueMicrotask(() => void resolveProfile())
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        void resolveProfile()
      }
    })
    return () => {
      guard.unmount()
      sub.subscription.unsubscribe()
    }
  }, [resolveProfile])

  const refresh = useCallback(async () => {
    const request = requestGuard.current.begin()
    if (requestGuard.current.isCurrent(request)) setState((previous) => ({ ...previous, status: 'loading', profileError: null }))
    await resolveProfile()
  }, [resolveProfile])

  const login = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    await resolveProfile()
  }, [resolveProfile])

  const loginWithMicrosoft = useCallback(async () => {
    const { error } = await signInWithMicrosoft()
    if (error) throw error
  }, [])

  const logout = useCallback(async () => {
    try {
      await supabase.auth.signOut()
    } finally {
      const request = requestGuard.current.begin()
      if (requestGuard.current.isCurrent(request)) setState({ user: null, status: 'signed_out', profileError: null })
    }
  }, [])

  return (
    <AuthContext.Provider value={{
      user: state.user,
      status: state.status,
      loading: state.status === 'loading',
      profileError: state.profileError,
      login,
      loginWithMicrosoft,
      logout,
      refresh,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
