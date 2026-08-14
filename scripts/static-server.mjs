/**
 * Minimal static server over dist/client, used by the cache-busting E2E test.
 *
 * Why not just use `wrangler dev` for that test: wrangler snapshots its asset manifest
 * at startup, so a rebuild mid-test is invisible to it without a full restart. This
 * server reads from disk on every request, which is exactly what a redeploy looks like
 * to a browser — and that is the condition the test needs to reproduce.
 *
 * It applies the same Cache-Control rules as dist/client/_headers, so the test exercises
 * the real caching policy rather than a permissive stand-in.
 */
import { createServer } from 'node:http'
import { readFile, stat } from 'node:fs/promises'
import { resolve, extname, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const dist = resolve(root, 'dist/client')
const port = Number(process.env.PORT ?? 4180)

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.woff2': 'font/woff2',
  '.pdf': 'application/pdf',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
}

function cacheControl(pathname) {
  if (pathname === '/version.json') return 'no-store'
  if (pathname === '/sw.js') return 'no-cache'
  if (pathname.startsWith('/assets/')) return 'public, max-age=31536000, immutable'
  if (pathname.endsWith('.html') || pathname.endsWith('/')) return 'no-cache, must-revalidate'
  return 'public, max-age=3600'
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url ?? '/', `http://localhost:${port}`)
  let pathname = decodeURIComponent(url.pathname)

  // Mirror the Worker's Accept-Language redirect so navigation behaves the same.
  if (pathname === '/') {
    const header = req.headers['accept-language'] ?? ''
    const locale = ['fr', 'es'].find((l) => header.includes(l)) ?? 'en'
    res.writeHead(302, { Location: `/${locale}/`, 'Cache-Control': 'no-store' })
    res.end()
    return
  }

  // The Workers runtime is absent here, so stub the health probe. Without it the client
  // logs a 404 for every page load and the contact form cannot resolve its own state.
  if (pathname === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' })
    res.end(JSON.stringify({ ok: true, version: 'static', contactEnabled: false }))
    return
  }

  let file = resolve(dist, `.${pathname}`)
  try {
    const info = await stat(file)
    if (info.isDirectory()) file = resolve(file, 'index.html')
  } catch {
    if (pathname.endsWith('/')) file = resolve(dist, `.${pathname}index.html`)
  }

  try {
    const body = await readFile(file)
    res.writeHead(200, {
      'Content-Type': TYPES[extname(file)] ?? 'application/octet-stream',
      'Cache-Control': cacheControl(pathname),
    })
    res.end(body)
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain' })
    res.end('not found')
  }
})

server.listen(port, () => console.log(`[static-server] http://127.0.0.1:${port}`))
