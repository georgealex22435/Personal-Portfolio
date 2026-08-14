/**
 * Screenshot harness for visual verification.
 *
 * Per the agreed workflow, passing assertions are not sufficient evidence — a suite can
 * go green on a blank page. These images get read back directly.
 *
 * Usage: node scripts/shoot.mjs <outDir> <base> <spec>...
 *   spec = "<name>:<path>:<width>x<height>"
 */
import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'
import { resolve } from 'node:path'

const [outDir, base, ...specs] = process.argv.slice(2)
if (!outDir || !base || specs.length === 0) {
  console.error('usage: node scripts/shoot.mjs <outDir> <base> <name:path:WxH>...')
  process.exit(1)
}

mkdirSync(outDir, { recursive: true })

const browser = await chromium.launch()
const failures = []

for (const spec of specs) {
  const [name, path, size] = spec.split(':')
  const [width, height] = (size ?? '1440x900').split('x').map(Number)

  const context = await browser.newContext({
    viewport: { width, height },
    deviceScaleFactor: 2,
  })
  const page = await context.newPage()

  const consoleErrors = []
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text())
  })
  page.on('pageerror', (err) => consoleErrors.push(`pageerror: ${err.message}`))

  const url = `${base}${path}`
  const response = await page.goto(url, { waitUntil: 'networkidle' })
  const status = response?.status() ?? 0

  // Let the one permitted animation (stat-line count-up, 500ms + stagger) settle so the
  // screenshot shows final values rather than a mid-count frame.
  await page.waitForTimeout(900)

  const file = resolve(outDir, `${name}.png`)
  await page.screenshot({ path: file, fullPage: true })

  // Horizontal overflow is a §4 acceptance criterion at every width.
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  )

  const flags = []
  if (status !== 200) flags.push(`HTTP ${status}`)
  if (overflow) flags.push('H-SCROLL')
  if (consoleErrors.length) flags.push(`console:${consoleErrors.length}`)
  if (flags.length) failures.push(`${name}: ${flags.join(', ')}`)

  console.log(
    `${flags.length ? 'FAIL' : ' ok '} ${name.padEnd(18)} ${String(width).padStart(4)}px  HTTP ${status}  hscroll=${overflow}  consoleErrors=${consoleErrors.length}`,
  )
  for (const e of consoleErrors.slice(0, 3)) console.log(`        ! ${e}`)

  await context.close()
}

await browser.close()

if (failures.length) {
  console.log(`\n${failures.length} issue(s):`)
  for (const f of failures) console.log(`  - ${f}`)
  process.exitCode = 1
} else {
  console.log('\nall clean')
}
