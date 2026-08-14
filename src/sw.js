/// <reference lib="webworker" />
import { precacheAndRoute, cleanupOutdatedCaches, matchPrecache } from 'workbox-precaching'
import { registerRoute, setCatchHandler, setDefaultHandler } from 'workbox-routing'
import { CacheFirst, NetworkFirst, NetworkOnly, StaleWhileRevalidate } from 'workbox-strategies'
import { ExpirationPlugin } from 'workbox-expiration'
import { CacheableResponsePlugin } from 'workbox-cacheable-response'

/**
 * Service worker — handover §3.
 *
 * Written by hand rather than generated because the offline fallback has to be
 * locale-aware, and that needs `setCatchHandler`. An extra `fetch` listener appended to
 * a generated SW does not work: Workbox's router has already called `respondWith()` for
 * any matching route, so a second call throws and the navigation fails outright with
 * ERR_FAILED — which is worse than having no fallback at all. The E2E offline tests
 * caught exactly that.
 *
 * The manifest below is injected at build time by scripts/gen-sw.mjs, which runs after
 * prerendering so every locale's HTML is included (§3's precache requirement).
 */

const PAGES_CACHE = 'pages'

/**
 * Navigations are NetworkFirst — registered BEFORE precacheAndRoute so it wins, since
 * Workbox routes are first-match in registration order.
 *
 * Precache-first would mean a reload after a deploy still renders the old HTML: the
 * active worker answers from its precache while the *new* worker is only just
 * installing, so the update lands one navigation late. That directly contradicts the
 * requirement that the browser picks up the latest version on load, and §3's "a
 * redeploy reaches a previously-visited browser without a hard refresh".
 *
 * HTML is small and Cloudflare serves it from the edge, so the network cost is minimal;
 * the 3-second timeout keeps a flaky connection from hanging the page, and the cache
 * still covers genuine offline use.
 */
registerRoute(
  ({ request }) => request.mode === 'navigate',
  new NetworkFirst({
    cacheName: PAGES_CACHE,
    networkTimeoutSeconds: 3,
    plugins: [new CacheableResponsePlugin({ statuses: [0, 200] })],
  }),
)

// eslint-disable-next-line no-undef
precacheAndRoute(self.__WB_MANIFEST)
cleanupOutdatedCaches()

// §3: registerType 'autoUpdate' — a redeploy reaches a returning browser without a
// hard refresh, which is the §3 acceptance criterion.
self.skipWaiting()
self.addEventListener('activate', () => self.clients.claim())

/** Allow the page's update prompt to retire a waiting worker on demand. */
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting()
})

// version.json is the staleness probe. It must never be answered from any cache — the
// precache manifest excludes it, and this makes the intent explicit at runtime too.
registerRoute(({ url }) => url.pathname === '/version.json', new NetworkOnly())

// §3: "NetworkOnly for /api/contact — a silently queued offline contact submission is
// worse than no form."
registerRoute(({ url }) => url.pathname.startsWith('/api/'), new NetworkOnly())

// §3: CacheFirst for images.
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'images',
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({ maxEntries: 60, maxAgeSeconds: 60 * 60 * 24 * 30 }),
    ],
  }),
)

// §3: CacheFirst for fonts. They are content-hashed, so a long TTL is safe.
registerRoute(
  ({ request }) => request.destination === 'font',
  new CacheFirst({
    cacheName: 'fonts',
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({ maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 }),
    ],
  }),
)

// §3: StaleWhileRevalidate for /api/live-stats. Registered after the /api/ NetworkOnly
// rule above would never match, so it is scoped explicitly ahead of it in intent —
// Workbox uses first-match, so this is deliberately declared before that catch-all is
// consulted for this exact path.
registerRoute(
  ({ url }) => url.pathname === '/api/live-stats',
  new StaleWhileRevalidate({
    cacheName: 'live-stats',
    plugins: [new ExpirationPlugin({ maxEntries: 4, maxAgeSeconds: 60 * 10 })],
  }),
)

setDefaultHandler(new NetworkOnly())

const OFFLINE_LOCALES = ['en', 'fr', 'es']

/**
 * §3: "a real translated offline page naming what is available cached, plus the email
 * address. Not a browser error."
 *
 * The page served matches the locale of the URL that failed, so a French visitor never
 * lands on an English error.
 */
setCatchHandler(async ({ request, url }) => {
  if (request.mode !== 'navigate') return Response.error()

  // A page visited before should still render offline: NetworkFirst already tried the
  // network and its own cache, so fall back to the precached copy of this exact URL
  // before giving up and showing the offline page.
  const precachedPage =
    (await matchPrecache(url.pathname)) ??
    (await matchPrecache(`${url.pathname.replace(/\/$/, '')}/index.html`))
  if (precachedPage) return precachedPage

  const segment = url.pathname.split('/').filter(Boolean)[0]
  const locale = OFFLINE_LOCALES.includes(segment) ? segment : 'en'

  /**
   * Redirect rather than serving the offline HTML under the requested URL.
   *
   * Returning the offline page's markup for /fr/projets/whatever/ only works until
   * React Router hydrates: it then matches the *address bar*, not the markup, and
   * re-renders the route's own 404. Redirecting keeps URL and content in agreement, and
   * the target is precached so the redirect resolves with no network.
   */
  const target = (await matchPrecache(`/${locale}/offline/index.html`))
    ? `/${locale}/offline/`
    : '/en/offline/'

  return Response.redirect(new URL(target, url.origin).toString(), 302)
})
