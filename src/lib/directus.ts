import { createDirectus, rest, authentication } from '@directus/sdk'
import type { Schema } from './types'

// The shared Directus backend (see the `directus` repo). Override per-env with VITE_DIRECTUS_URL.
export const DIRECTUS_URL = import.meta.env.VITE_DIRECTUS_URL ?? 'https://data.designflow.app'

// Persist auth tokens across reloads (the SDK's default storage is in-memory).
const storage = {
  get() {
    const raw = localStorage.getItem('directus_auth')
    return raw ? JSON.parse(raw) : null
  },
  set(value: unknown) {
    if (value) localStorage.setItem('directus_auth', JSON.stringify(value))
    else localStorage.removeItem('directus_auth')
  },
}

export const directus = createDirectus<Schema>(DIRECTUS_URL)
  .with(authentication('json', { storage, autoRefresh: true }))
  .with(rest())

// Microsoft SSO: hand off to the backend, which completes OIDC and redirects back.
// (Requires the frontend origin in the backend's CORS + SSO redirect allow-list.)
export function microsoftLoginUrl(returnTo = window.location.origin + '/') {
  return `${DIRECTUS_URL}/auth/login/microsoft?redirect=${encodeURIComponent(returnTo)}`
}

export function assetUrl(id: string | null | undefined) {
  return id ? `${DIRECTUS_URL}/assets/${id}` : undefined
}
