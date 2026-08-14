import { useEffect } from 'react'
import { DEFAULT_LOCALE, isLocale, LOCALES } from '../i18n/locales'

const STORAGE_KEY = 'portfolio.locale'

/**
 * Client-side fallback for "/" only.
 *
 * §5 requires the "/" redirect to be handled in the Worker from Accept-Language, and it
 * is (src/worker/index.ts). This component exists because "/" is still prerendered as a
 * static asset, which the edge may serve without invoking the Worker. It honours an
 * explicit stored choice first, then the browser's languages — matching the Worker's
 * precedence so the two can never disagree.
 */
export default function RootRedirect() {
  useEffect(() => {
    let target: string = DEFAULT_LOCALE

    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (isLocale(stored)) {
      target = stored
    } else {
      for (const language of navigator.languages ?? [navigator.language]) {
        const base = language.split('-')[0]?.toLowerCase()
        if (isLocale(base)) {
          target = base
          break
        }
      }
    }

    window.location.replace(`/${target}/`)
  }, [])

  return (
    <noscript>
      <ul>
        {LOCALES.map((locale) => (
          <li key={locale}>
            <a href={`/${locale}/`}>{locale.toUpperCase()}</a>
          </li>
        ))}
      </ul>
    </noscript>
  )
}
