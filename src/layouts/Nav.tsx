import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { Locale, RouteKey } from '../i18n/locales'
import { LOCALE_LABEL, LOCALES, localePath, translatePath } from '../i18n/locales'
import styles from './SiteChrome.module.css'

interface Props {
  locale: Locale
}

/**
 * §4: on the phone the bar carries three items plus the language switcher; tablet and
 * up gets the full horizontal nav. Home is the item that drops — it is the only one
 * reachable another way (the site name in the page header links to it), and at 375px a
 * fourth item plus EN/FR/ES forced "À PROPOS" to wrap. French and Spanish run 15–25%
 * longer than English (§5), so the phone bar has to be sized for the longest locale.
 */
const ITEMS: { key?: RouteKey; label: string; phone: boolean }[] = [
  { label: 'nav.home', phone: false },
  { key: 'projects', label: 'nav.projects', phone: true },
  { key: 'about', label: 'nav.about', phone: true },
  { key: 'resume', label: 'nav.resume', phone: true },
]

const STORAGE_KEY = 'portfolio.locale'

export default function Nav({ locale }: Props) {
  const { t } = useTranslation()
  const { pathname } = useLocation()

  const isCurrent = (key?: RouteKey) => {
    const target = localePath(locale, key)
    if (!key) return pathname === `/${locale}/` || pathname === `/${locale}`
    return pathname === target || pathname.startsWith(`${target}/`)
  }

  return (
    <nav className={styles.nav} aria-label={t('nav.mainLabel')}>
      {/* Wordmark at the head of the rail. Hidden on the phone bar, where there is no
          room and the page's own <h1> already carries the name. */}
      <Link className={styles.railMark} to={localePath(locale)}>
        AS
      </Link>

      {ITEMS.map((item) => (
        <Link
          key={item.label}
          to={localePath(locale, item.key)}
          className={item.phone ? styles.navLink : styles.navLinkDesktop}
          aria-current={isCurrent(item.key) ? 'page' : undefined}
        >
          {t(item.label)}
        </Link>
      ))}

      <div className={styles.langGroup} role="group" aria-label={t('nav.languageLabel')}>
        {LOCALES.map((candidate) => (
          <a
            key={candidate}
            href={translatePath(pathname, candidate)}
            className={styles.langLink}
            hrefLang={candidate}
            aria-current={candidate === locale ? 'true' : undefined}
            // §5: an explicit language choice persists and beats Accept-Language
            // thereafter. A plain <a> (not <Link>) is deliberate — a full navigation
            // fetches the prerendered HTML for that locale rather than swapping
            // strings client-side, which keeps what the user sees identical to what
            // a crawler would get at that URL.
            onClick={() => {
              try {
                window.localStorage.setItem(STORAGE_KEY, candidate)
              } catch {
                // Private-mode or storage-disabled: the choice just won't persist.
              }
            }}
          >
            {LOCALE_LABEL[candidate]}
          </a>
        ))}
      </div>
    </nav>
  )
}
