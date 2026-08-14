/**
 * Emits sitemap.xml, robots.txt and _headers into the built output — handover §10.
 *
 * Runs after the SSG build so the sitemap is derived from the HTML that actually exists
 * rather than from a hand-maintained route list that can drift.
 */
import { readdirSync, statSync, writeFileSync, readFileSync } from 'node:fs'
import { resolve, dirname, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createHash } from 'node:crypto'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const dist = resolve(root, 'dist/client')

const ORIGIN =
  process.env.SITE_ORIGIN ?? 'https://portfolio.georgealex22435.workers.dev'
const LOCALES = ['en', 'fr', 'es']

/** Every prerendered index.html becomes one canonical trailing-slash URL. */
function walk(dir) {
  const out = []
  for (const entry of readdirSync(dir)) {
    const full = resolve(dir, entry)
    if (statSync(full).isDirectory()) out.push(...walk(full))
    else if (entry === 'index.html') out.push(full)
  }
  return out
}

const urls = walk(dist)
  .map((file) => {
    const rel = relative(dist, dirname(file)).split('\\').join('/')
    return rel === '' ? '/' : `/${rel}/`
  })
  // The bare "/" only ever redirects, and the offline shells are noindex.
  .filter((path) => path !== '/' && !path.endsWith('/offline/'))
  .sort()

/** Group by "same page, different locale" so each entry can carry its alternates. */
const groups = new Map()
for (const path of urls) {
  const [locale, ...rest] = path.split('/').filter(Boolean)
  const key = rest.join('/')
  if (!groups.has(key)) groups.set(key, new Map())
  groups.get(key).set(locale, path)
}

const entries = []
for (const [, byLocale] of groups) {
  for (const [locale, path] of byLocale) {
    const alternates = [...byLocale.entries()]
      .map(
        ([altLocale, altPath]) =>
          `    <xhtml:link rel="alternate" hreflang="${altLocale}" href="${ORIGIN}${altPath}"/>`,
      )
      .join('\n')
    const xDefault = byLocale.get('en')
    entries.push(
      `  <url>\n` +
        `    <loc>${ORIGIN}${path}</loc>\n` +
        `${alternates}\n` +
        (xDefault
          ? `    <xhtml:link rel="alternate" hreflang="x-default" href="${ORIGIN}${xDefault}"/>\n`
          : '') +
        `  </url>`,
    )
    void locale
  }
}

writeFileSync(
  resolve(dist, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n` +
    `${entries.join('\n')}\n` +
    `</urlset>\n`,
  'utf8',
)

writeFileSync(
  resolve(dist, 'robots.txt'),
  `User-agent: *\nAllow: /\n\nSitemap: ${ORIGIN}/sitemap.xml\n`,
  'utf8',
)

/**
 * §2 and §10: custom headers via `_headers` in the assets directory.
 *
 * The CSP has to allow 'unsafe-inline' for styles because CSS Modules emit an inline
 * <style> during hydration; scripts get no such exemption. connect-src stays same-origin
 * since the only fetches are /api/* and version.json.
 *
 * vite-react-ssg emits two inline bootstrap scripts per page —
 * `__staticRouterHydrationData` and `__VITE_REACT_SSG_HASH__`. A bare `script-src 'self'`
 * blocks both, and the failure is quiet but total: hydration never runs, the app fetches
 * its data manifest at the wrong URL, and every interactive control is dead. Their
 * SHA-256 hashes are collected here so the policy stays strict without 'unsafe-inline'.
 */
/**
 * Strip vite-react-ssg's image preload hints.
 *
 * It emits `<link rel="preload" as="image" crossorigin="">` for every image in the
 * module graph. The anonymous crossorigin never matches the plain <img> request, so the
 * browser warns "credentials mode does not match" and downloads the file twice — and
 * §10 forbids console warnings on any route. They are also counterproductive: card
 * covers are deliberately `loading="lazy"`, so preloading them competes with the
 * critical path for images that may never be scrolled to.
 */
let strippedPreloads = 0
for (const file of walk(dist)) {
  const html = readFileSync(file, 'utf8')
  const cleaned = html.replace(/<link rel="preload" as="image"[^>]*>/g, () => {
    strippedPreloads += 1
    return ''
  })
  if (cleaned !== html) writeFileSync(file, cleaned, 'utf8')
}

// Hashes must be computed from the FINAL html, after the rewrite above.
const scriptHashes = new Set()
for (const file of walk(dist)) {
  const html = readFileSync(file, 'utf8')
  for (const match of html.matchAll(/<script(?![^>]*\ssrc=)([^>]*)>([\s\S]*?)<\/script>/g)) {
    const attrs = match[1] ?? ''
    // Data blocks (application/ld+json) are never executed, so they need no hash.
    if (/type\s*=\s*["']application\/ld\+json["']/i.test(attrs)) continue
    scriptHashes.add(`'sha256-${createHash('sha256').update(match[2], 'utf8').digest('base64')}'`)
  }
}

const csp = [
  "default-src 'self'",
  `script-src 'self' ${[...scriptHashes].join(' ')}`.trim(),
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self'",
  "connect-src 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "object-src 'none'",
].join('; ')

writeFileSync(
  resolve(dist, '_headers'),
  `/*\n` +
    `  Content-Security-Policy: ${csp}\n` +
    `  X-Content-Type-Options: nosniff\n` +
    `  Referrer-Policy: strict-origin-when-cross-origin\n` +
    `  Permissions-Policy: geolocation=(), microphone=(), camera=()\n` +
    `  Strict-Transport-Security: max-age=31536000; includeSubDomains\n` +
    `\n` +
    `# Content-hashed assets: a new build is a new URL, so these are safe to pin.\n` +
    `/assets/*\n` +
    `  Cache-Control: public, max-age=31536000, immutable\n` +
    `\n` +
    `# HTML is the entry point and must never be stale, or a visitor keeps the old build.\n` +
    `/*.html\n` +
    `  Cache-Control: no-cache, must-revalidate\n` +
    `\n` +
    `# The freshness probe itself must never be answered from cache.\n` +
    `/version.json\n` +
    `  Cache-Control: no-store\n` +
    `\n` +
    `/sw.js\n` +
    `  Cache-Control: no-cache\n`,
  'utf8',
)

const version = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8')).version
console.log(
  `[gen-seo] sitemap.xml (${entries.length} urls), robots.txt, _headers ` +
    `(${scriptHashes.size} script hashes), stripped ${strippedPreloads} image preloads — v${version}`,
)
