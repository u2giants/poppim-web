import { createDirectus, rest, authentication } from '@directus/sdk'
import type { Schema } from './types'

// The shared Directus backend (see the `directus` repo). Override per-env with VITE_DIRECTUS_URL.
export const DIRECTUS_URL = import.meta.env.VITE_DIRECTUS_URL ?? 'https://data.designflow.app'

// Session/cookie auth: the backend sets an httpOnly session cookie scoped to
// .designflow.app, so the same login works across the app subdomains (pm-dev →
// data) and lets Microsoft SSO return into the SPA. Requests must send credentials.
export const directus = createDirectus<Schema>(DIRECTUS_URL)
  .with(authentication('session', { credentials: 'include', autoRefresh: true }))
  .with(rest({ credentials: 'include' }))

// Microsoft SSO: hand off to the backend, which completes OIDC and redirects back.
// (Requires the frontend origin in the backend's CORS + SSO redirect allow-list.)
export function microsoftLoginUrl(returnTo = window.location.origin + '/') {
  return `${DIRECTUS_URL}/auth/login/microsoft?redirect=${encodeURIComponent(returnTo)}`
}

export function assetUrl(id: string | null | undefined) {
  return id ? `${DIRECTUS_URL}/assets/${id}` : undefined
}
