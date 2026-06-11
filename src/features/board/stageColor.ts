// Deterministically map a stage (by id/name) to one of Design's stage palette
// colors. Class strings are literal so Tailwind's JIT generates the utilities.
const ACCENT_BG: Record<string, string> = {
  concept: 'bg-stage-concept',
  dev: 'bg-stage-dev',
  review: 'bg-stage-review',
  approved: 'bg-stage-approved',
  production: 'bg-stage-production',
  shipped: 'bg-stage-shipped',
  onhold: 'bg-stage-onhold',
}
const KEYS = Object.keys(ACCENT_BG)

function hash(s: string) {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return h
}

export function stageAccentBg(key: string | null | undefined) {
  if (!key) return 'bg-muted-foreground/30'
  return ACCENT_BG[KEYS[hash(key) % KEYS.length]]
}
