import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'

describe('board stage mutation characterization', () => {
  it('stage mutation uses one transactional RPC instead of separate update and history writes', () => {
    const source = readFileSync(new URL('./api.ts', import.meta.url), 'utf8')

    expect(source).toMatch(/\.rpc\(\s*['"][^'"]*stage[^'"]*['"]/)
    expect(source).not.toMatch(/from\(['"]stage_history['"]\)\.insert/)
  })
})
