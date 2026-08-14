/**
 * Service worker registration — handover §3.
 *
 * No install prompt is wired up, deliberately: §3 says "do not put an install prompt in
 * front of first-time visitors." The PWA is here for instant repeat loads and
 * resilience on bad Wi-Fi, not to badger a recruiter into installing a portfolio.
 *
 * iOS supports service workers but never fires `beforeinstallprompt` and evicts storage
 * aggressively, so nothing here assumes that event exists.
 */
export function registerServiceWorker(): void {
  if (typeof window === 'undefined') return
  if (!('serviceWorker' in navigator)) return

  // Registering after load keeps the SW off the critical path for first paint.
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch((error) => {
      // A failed registration must never break the page — the site works without it.
      console.warn('service worker registration failed', error)
    })
  })
}
