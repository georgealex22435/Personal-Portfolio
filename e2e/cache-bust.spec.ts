import { test, expect } from '@playwright/test'
import { execSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

/**
 * The redeploy test.
 *
 * This is the one that matters most. §3's PWA acceptance criterion — "a redeploy reaches
 * a previously-visited browser without a hard refresh" — and the standing versioning
 * rule are the same requirement: a precached service-worker shell must never shadow a
 * fresh build. Configuring headers and *claiming* it works is not evidence, so this
 * test actually rebuilds the site mid-run and reloads a browser that already has the
 * old version installed.
 *
 * Runs against the static server, not wrangler dev, because wrangler snapshots its asset
 * manifest at startup and cannot see a rebuild.
 */

const PKG = resolve(process.cwd(), 'package.json')

function readVersion(): string {
  return JSON.parse(readFileSync(PKG, 'utf8')).version
}

function writeVersion(version: string): void {
  const pkg = JSON.parse(readFileSync(PKG, 'utf8'))
  pkg.version = version
  writeFileSync(PKG, `${JSON.stringify(pkg, null, 2)}\n`)
}

function rebuild(): void {
  execSync('npm run build', { stdio: 'pipe', cwd: process.cwd() })
}

test.describe('cache busting', () => {
  test.describe.configure({ timeout: 300_000 })

  test('a rebuild reaches an already-loaded browser without a hard refresh', async ({ page }) => {
    const original = readVersion()
    const bumped = `${original}-cachetest`

    try {
      // 1. Load the site and let the service worker install and precache the old build.
      await page.goto('/en/', { waitUntil: 'networkidle' })
      await expect(page.getByTestId('version-badge')).toHaveText(`Version ${original}`)

      // Confirm the SW really installed and precached — otherwise the rest of this
      // test proves nothing about shadowing, because there is no cache to shadow with.
      await page.evaluate(() => navigator.serviceWorker.ready)
      const registered = await page.evaluate(
        async () => (await navigator.serviceWorker.getRegistration()) !== undefined,
      )
      expect(registered, 'service worker must be registered for this test to mean anything').toBe(
        true,
      )

      // 2. Ship a new build while that browser sits on the old one.
      writeVersion(bumped)
      rebuild()

      // 3. version.json is served no-store, so the running page sees the new build.
      const seen = await page.evaluate(async () => {
        const r = await fetch('/version.json', { cache: 'no-store' })
        return (await r.json()).version
      })
      expect(seen).toBe(bumped)

      // 4. The update prompt appears without any reload — the app noticed by itself.
      await expect(page.getByTestId('update-prompt')).toBeVisible({ timeout: 90_000 })

      // 5. A plain reload — not a hard refresh, no cache clearing — lands on the new
      //    build. This is the §3 acceptance criterion.
      await page.reload({ waitUntil: 'networkidle' })
      await expect(page.getByTestId('version-badge')).toHaveText(`Version ${bumped}`)
      await expect(page.getByTestId('update-prompt')).toHaveCount(0)
    } finally {
      // Always restore the real version, even if an assertion above failed.
      writeVersion(original)
      rebuild()
    }
  })

  test('hashed assets are immutable but HTML never is', async ({ request }) => {
    const html = await request.get('/en/')
    expect(html.headers()['cache-control']).toContain('no-cache')

    const body = await html.text()
    const asset = body.match(/\/assets\/[A-Za-z0-9._-]+\.js/)?.[0]
    expect(asset, 'expected a content-hashed JS asset in the HTML').toBeTruthy()

    const js = await request.get(asset!)
    expect(js.headers()['cache-control']).toContain('immutable')

    const version = await request.get('/version.json')
    expect(version.headers()['cache-control']).toContain('no-store')
  })
})

test.describe('offline', () => {
  test('a visited route still renders with the network cut', async ({ page, context }) => {
    await page.goto('/en/', { waitUntil: 'networkidle' })
    await page.evaluate(() => navigator.serviceWorker.ready)
    await page.goto('/en/projects/', { waitUntil: 'networkidle' })

    // Give the precache time to settle before pulling the network away.
    await page.waitForTimeout(2000)

    await context.setOffline(true)
    await page.goto('/en/projects/', { waitUntil: 'domcontentloaded' })

    // §3 acceptance: navigates between visited routes with the network Offline.
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Projects')
    await expect(page.getByText('Three branches, four projects.')).toBeVisible()

    await context.setOffline(false)
  })

  test('an uncached route falls back to the offline page in the right locale', async ({
    page,
    context,
  }) => {
    await page.goto('/fr/', { waitUntil: 'networkidle' })
    await page.evaluate(() => navigator.serviceWorker.ready)
    await page.waitForTimeout(2000)

    await context.setOffline(true)
    await page.goto('/fr/projets/une-page-qui-nexiste-pas/', { waitUntil: 'domcontentloaded' })

    // The SW redirects to the offline page so the URL and the content agree — without
    // that, React Router hydrates against the original address and renders its own 404.
    await expect(page).toHaveURL(/\/fr\/offline\/$/)

    // A French visitor must not land on an English error page.
    await expect(page.locator('html')).toHaveAttribute('lang', 'fr')
    await expect(page.getByRole('heading', { level: 1 })).toContainText('hors ligne')
    await expect(page.getByText('alexsaliba2@gmail.com')).toBeVisible()

    await context.setOffline(false)
  })
})
