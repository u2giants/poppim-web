import playwright from '/opt/ai-tools/playwright/node_modules/playwright/index.js'
import { writeFile } from 'node:fs/promises'

const { chromium } = playwright

const baseUrl = process.env.POPPIM_TEST_URL
const email = process.env.POPPIM_TEST_EMAIL
const password = process.env.POPPIM_TEST_PASSWORD
const supabaseUrl = process.env.POPPIM_SUPABASE_URL
const anonKey = process.env.POPPIM_ANON_KEY
const evidenceDir = '/worksp/poppim-web/.ai/evidence'

if (!baseUrl || !email || !password || !supabaseUrl || !anonKey) {
  throw new Error('Missing preview browser-matrix environment')
}

const result = {
  startedAt: new Date().toISOString(),
  pages: [],
  api: [],
  consoleErrors: [],
  failedResponses: [],
}

const browser = await chromium.launch({
  headless: true,
  executablePath: '/usr/bin/google-chrome',
  args: ['--no-sandbox'],
})
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } })
const page = await context.newPage()

page.on('console', (message) => {
  if (message.type() === 'error') result.consoleErrors.push(message.text())
})
page.on('response', (response) => {
  if (response.status() >= 400) {
    result.failedResponses.push({
      status: response.status(),
      path: new URL(response.url()).pathname,
    })
  }
})

async function api(path, init = {}) {
  const sessionRaw = await page.evaluate(() => {
    const key = Object.keys(localStorage).find((candidate) => candidate.startsWith('sb-') && candidate.endsWith('-auth-token'))
    return key ? localStorage.getItem(key) : null
  })
  if (!sessionRaw) throw new Error('Authenticated session not found')
  const accessToken = JSON.parse(sessionRaw).access_token
  const response = await fetch(`${supabaseUrl}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: anonKey,
      authorization: `Bearer ${accessToken}`,
      'content-type': 'application/json',
      'accept-profile': 'api',
      'content-profile': 'api',
      ...(init.headers ?? {}),
    },
  })
  const text = await response.text()
  let body
  try { body = text ? JSON.parse(text) : null } catch { body = text }
  return { response, body }
}

async function assertRpc(name, args, verify = () => true) {
  const { response, body } = await api(`rpc/${name}`, {
    method: 'POST',
    body: JSON.stringify(args),
  })
  if (!response.ok || !verify(body)) {
    throw new Error(`${name} failed (${response.status}): ${JSON.stringify(body)}`)
  }
  result.api.push({ name, status: response.status, rows: Array.isArray(body) ? body.length : 1 })
  return body
}

async function visit(label) {
  await page.getByText(label, { exact: true }).first().click()
  await page.waitForTimeout(900)
  const body = await page.locator('body').innerText()
  if (/could not load|failed to load|something went wrong/i.test(body)) {
    throw new Error(`${label} rendered a load failure`)
  }
  result.pages.push(label)
}

await page.goto(baseUrl, { waitUntil: 'networkidle' })
await page.getByPlaceholder('Email').fill(email)
await page.getByPlaceholder('Password').fill(password)
await page.getByRole('button', { name: 'Sign in', exact: true }).click()
await page.getByText('Control room', { exact: true }).first().waitFor({ timeout: 20_000 })
await page.screenshot({ path: `${evidenceDir}/phase5-preview-control-room-desktop-20260727.png`, fullPage: true })

for (const department of ['Licensed', 'Generic', 'Software']) {
  const pageRows = await assertRpc('pm_pipeline_page', { p_business_unit: department, p_limit: 51 }, Array.isArray)
  await assertRpc('pm_pipeline_count', { p_business_unit: department }, (value) => typeof value === 'number')
  await assertRpc('pm_pipeline_list_facets', { p_business_unit: department }, Array.isArray)
  result.api.push({ name: `pipeline_${department}`, rows: pageRows.length })
}

const invalid = await api('rpc/pm_pipeline_page', {
  method: 'POST',
  body: JSON.stringify({ p_business_unit: 'All', p_limit: 10 }),
})
if (invalid.response.ok) throw new Error('Invalid mixed department was accepted')
result.api.push({ name: 'pipeline_invalid_department_rejected', status: invalid.response.status })

await visit('Product pipeline')
await page.screenshot({ path: `${evidenceDir}/phase5-preview-pipeline-desktop-20260727.png`, fullPage: true })
for (const department of ['Generic', 'Software', 'Licensed']) {
  await page.getByRole('button', { name: department, exact: true }).click()
  await page.waitForTimeout(750)
}

const nav = [
  'Projects / offers', 'Design library', 'Design collections', 'Submissions',
  'Samples / factory', 'Reviews / revisions', 'Orders', 'Accounts', 'Reports',
  'My work', 'Schedule', 'Notes', 'People', 'Control room',
]
for (const label of nav) await visit(label)

await visit('Reports')
await page.screenshot({ path: `${evidenceDir}/phase5-preview-reports-desktop-20260727.png`, fullPage: true })
await page.setViewportSize({ width: 390, height: 844 })
await page.screenshot({ path: `${evidenceDir}/phase5-preview-reports-mobile-20260727.png`, fullPage: true })

await assertRpc('pm_department_report', { p_business_unit: 'Licensed' })
await assertRpc('pm_department_handoffs', { p_business_unit: 'Licensed', p_limit: 20 }, Array.isArray)
await assertRpc('pm_project_page', { p_business_unit: 'Licensed', p_limit: 51 }, Array.isArray)
await assertRpc('pm_people_workload_page', { p_business_unit: 'Licensed', p_limit: 26 }, Array.isArray)
await assertRpc('pm_notes_page', { p_business_unit: 'Licensed', p_limit: 51 }, Array.isArray)
await assertRpc('pm_schedule_page', {
  p_business_unit: 'Licensed',
  p_start: new Date().toISOString().slice(0, 10),
  p_end: new Date(Date.now() + 31 * 86400000).toISOString().slice(0, 10),
  p_limit: 101,
}, Array.isArray)
await assertRpc('pm_account_page', { p_business_unit: 'Licensed', p_limit: 51 }, Array.isArray)
await assertRpc('pm_design_page', { p_business_unit: 'Licensed', p_limit: 51 }, Array.isArray)
await assertRpc('pm_design_collection_page', { p_business_unit: 'Licensed', p_limit: 51 }, Array.isArray)
await assertRpc('pm_order_page', { p_business_unit: 'Licensed', p_limit: 51 }, Array.isArray)
await assertRpc('pm_my_work_page', { p_business_unit: 'Licensed', p_limit: 51 }, Array.isArray)
await assertRpc('pm_my_revision_page', { p_business_unit: 'Licensed', p_limit: 100 }, Array.isArray)
await assertRpc('pm_my_reminder_page', { p_business_unit: 'Licensed', p_limit: 100 }, Array.isArray)

await browser.close()
result.finishedAt = new Date().toISOString()
await writeFile(`${evidenceDir}/phase5-preview-browser-matrix-20260727.json`, `${JSON.stringify(result, null, 2)}\n`)

if (result.consoleErrors.length || result.failedResponses.some(({ status }) => status >= 500)) {
  throw new Error(`Browser matrix found ${result.consoleErrors.length} console errors and ${result.failedResponses.length} failed responses`)
}

console.log(JSON.stringify({
  pages: result.pages.length,
  apiChecks: result.api.length,
  consoleErrors: result.consoleErrors.length,
  failedResponses: result.failedResponses.length,
}))
