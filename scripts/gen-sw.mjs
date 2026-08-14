/**
 * Builds the service worker — handover §3.
 *
 * This runs AFTER vite-react-ssg and after gen-seo, and that ordering is the whole
 * point. §3 warns to "watch the interaction between the service worker and
 * prerendering": a plugin that runs during the client build globs the output before SSG
 * has written any HTML, so it precaches the assets and none of the pages. Running here
 * means the glob sees every prerendered route in every locale — and the final HTML, so
 * the precache hashes match what gen-seo actually left on disk.
 *
 * injectManifest, not generateSW, because the offline fallback must be locale-aware and
 * that requires setCatchHandler in hand-written source (src/sw.js).
 */
import { injectManifest } from 'workbox-build'
import { build as esbuild } from 'esbuild'
import { readFileSync, rmSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const dist = resolve(root, 'dist/client')
const bundled = resolve(root, '.sw-bundle.js')

/**
 * Bundle first, inject second.
 *
 * workbox-build's `injectManifest` only swaps `self.__WB_MANIFEST` for the file list —
 * it does NOT bundle. Shipping src/sw.js as-is leaves bare `import ... from
 * 'workbox-precaching'` specifiers that a service worker cannot resolve, so
 * registration fails silently and the whole PWA quietly does nothing.
 */
await esbuild({
  entryPoints: [resolve(root, 'src/sw.js')],
  outfile: bundled,
  bundle: true,
  format: 'iife',
  target: 'es2022',
  minify: true,
  // Keep the placeholder intact for injectManifest to find after bundling.
  define: { 'process.env.NODE_ENV': '"production"' },
})

const { count, size, warnings } = await injectManifest({
  swSrc: bundled,
  swDest: resolve(dist, 'sw.js'),
  globDirectory: dist,
  globPatterns: [
    // §3: precache the app shell, fonts, CSS, JS, and every prerendered HTML route in
    // all locales. The site is small enough that precaching all of it is fine.
    '**/*.{html,js,css,json,woff2,svg,png,jpg,webmanifest}',
  ],
  globIgnores: [
    'sw.js',
    'workbox-*.js',
    // The resume PDF is 129KB and rarely read offline — not worth the precache budget.
    'resume/*.pdf',
    /**
     * NEVER precache version.json.
     *
     * Workbox's precache route runs ahead of runtime routes, so a precached copy would
     * be served before the NetworkOnly rule is consulted — and the one file whose
     * entire job is detecting a stale build would itself be answered from the stale
     * cache. The E2E cache-bust test caught exactly this.
     */
    'version.json',
  ],
  // Cover images are large; raise the ceiling so they precache rather than silently
  // dropping out of the manifest.
  maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
})

rmSync(bundled, { force: true })

for (const warning of warnings) console.warn('[gen-sw]', warning)

// A service worker that still carries bare specifiers will not register at all, and the
// failure is silent. Fail the build instead of shipping a dead PWA.
const output = readFileSync(resolve(dist, 'sw.js'), 'utf8')
if (/^\s*import\s+[^(]/m.test(output)) {
  throw new Error('[gen-sw] sw.js contains unbundled import statements — it will not register')
}

const version = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8')).version
console.log(`[gen-sw] precached ${count} files, ${Math.round(size / 1024)} KB — v${version}`)
