import { readdir, stat } from 'node:fs/promises'
import { join } from 'node:path'

const assetsDir = new URL('../dist/assets/', import.meta.url)
const entries = await readdir(assetsDir)
const javascript = await Promise.all(
  entries.filter((name) => name.endsWith('.js')).map(async (name) => ({
    name,
    bytes: (await stat(join(assetsDir.pathname, name))).size,
  })),
)
const entry = javascript.find(({ name }) => name.startsWith('index-'))
if (!entry) throw new Error('Could not find the Vite entry chunk')

const maximumBytes = 500_000
if (entry.bytes >= maximumBytes) {
  throw new Error(`Entry chunk ${entry.name} is ${entry.bytes} bytes; budget is below ${maximumBytes} bytes`)
}
console.log(`Entry chunk ${entry.name}: ${entry.bytes} bytes (budget < ${maximumBytes})`)
