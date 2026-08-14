import { ViteReactSSG } from 'vite-react-ssg'
import { routes } from './routes'
import { assertLocaleParity } from './i18n/config'
import { registerServiceWorker } from './pwa'
import './styles/global.css'

// §5: "The build fails loudly on a missing locale file. Silent English fallback
// mid-French-page is worse than no French." This runs during prerendering only and is
// tree-shaken out of the client bundle, so a locale gap breaks the build, not the site.
if (import.meta.env.SSR) {
  assertLocaleParity()
}

export const createRoot = ViteReactSSG({ routes }, () => {
  // Runs once per client-side boot, never during prerendering.
  registerServiceWorker()
})
