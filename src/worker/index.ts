import { Hono } from 'hono'
import { DEFAULT_LOCALE, isLocale, pickLocale } from '../i18n/locales'
import { APP_VERSION, BUILD_TIME } from '../generated/version'
import { handleContact, isContactConfigured } from './contact'

/**
 * Workers runtime — NOT Node. No fs, no Buffer, no Node HTTP client (handover §2).
 * Everything here uses fetch / Web Crypto / Web Streams only.
 */
export interface Env {
  ASSETS: Fetcher
  CACHE: KVNamespace
  /** Secrets, set with `wrangler secret put` — never in wrangler.jsonc (§2). */
  RESEND_API_KEY?: string
  CONTACT_TO?: string
  CONTACT_FROM?: string
}

const app = new Hono<{ Bindings: Env }>()

/**
 * Liveness, the version the edge is actually running, and whether the contact form can
 * send. The client uses `contactEnabled` to decide between rendering the form and
 * falling back to a plain email address (§2).
 */
app.get('/api/health', (c) =>
  c.json({
    ok: true,
    version: APP_VERSION,
    buildTime: BUILD_TIME,
    contactEnabled: isContactConfigured(c.env),
  }),
)

app.post('/api/contact', (c) => handleContact(c.req.raw, c.env))

/** A GET here is almost always a confused crawler; be explicit rather than 404. */
app.get('/api/contact', (c) => c.json({ ok: false, error: 'method_not_allowed' }, 405))

/**
 * §5: "/" redirects by Accept-Language, defaulting to /en/. Handled here in the Worker,
 * not client-side, so crawlers and curl see a real 302 rather than a JS redirect.
 */
app.get('/', (c) => {
  const locale = pickLocale(c.req.header('accept-language') ?? null)
  return c.redirect(`/${locale}/`, 302)
})

/** Bare locale root without trailing slash → canonical trailing-slash form. */
app.get('/:locale', (c) => {
  const locale = c.req.param('locale')
  if (isLocale(locale)) return c.redirect(`/${locale}/`, 301)
  return c.notFound()
})

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url)

    // API and the root redirect belong to the Worker. Everything else is a static
    // asset; `run_worker_first: ["/"]` means we normally aren't invoked for those.
    if (url.pathname.startsWith('/api/') || url.pathname === '/') {
      const response = await app.fetch(request, env, ctx)
      if (url.pathname === '/') {
        const headers = new Headers(response.headers)
        headers.set('Vary', 'Accept-Language')
        headers.set('Cache-Control', 'no-store')
        return new Response(response.body, { status: response.status, headers })
      }
      return response
    }

    const asset = await env.ASSETS.fetch(request)
    if (asset.status !== 404) return asset

    /**
     * Fallback only for real page navigations.
     *
     * Serving the locale home page for *any* missing asset is actively harmful: a
     * missing .json comes back as HTML with a 200, and the caller's JSON.parse throws
     * "Unexpected token '<'" — which points at the data layer instead of at the missing
     * file. Non-navigation requests get an honest 404 so failures name themselves.
     */
    const accept = request.headers.get('accept') ?? ''
    const isNavigation =
      request.method === 'GET' &&
      accept.includes('text/html') &&
      !url.pathname.includes('.')

    if (!isNavigation) {
      return new Response('Not found', {
        status: 404,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      })
    }

    const locale = pickLocale(request.headers.get('accept-language')) ?? DEFAULT_LOCALE
    const fallback = await env.ASSETS.fetch(new URL(`/${locale}/`, request.url))
    return new Response(fallback.body, { status: 404, headers: fallback.headers })
  },
}
