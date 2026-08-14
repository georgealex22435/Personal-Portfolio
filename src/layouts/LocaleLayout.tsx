import { Outlet, useLocation } from 'react-router-dom'
import { Head } from 'vite-react-ssg'
import { I18nextProvider, useTranslation } from 'react-i18next'
import type { Locale } from '../i18n/locales'
import {
  HTML_LANG,
  LOCALES,
  DEFAULT_LOCALE,
  translatePath,
  canonicalPath,
} from '../i18n/locales'
import { getI18n } from '../i18n/config'
import { APP_VERSION } from '../generated/version'
import Nav from './Nav'
import UpdatePrompt from '../components/UpdatePrompt/UpdatePrompt'
import styles from './SiteChrome.module.css'

interface Props {
  locale: Locale
}

/**
 * Canonical origin for absolute URLs in hreflang, canonical, and Open Graph tags.
 * No custom domain is on the Cloudflare account yet, so this is the workers.dev host.
 * It is the single value to change when a real domain is added.
 */
const SITE_ORIGIN = 'https://portfolio.georgealex22435.workers.dev'

function Chrome({ locale }: Props) {
  const { t } = useTranslation()
  const { pathname } = useLocation()
  const canonical = `${SITE_ORIGIN}${canonicalPath(pathname)}`

  const alternates = LOCALES.map((candidate) => ({
    locale: candidate,
    href: `${SITE_ORIGIN}${translatePath(pathname, candidate)}`,
  }))

  return (
    <>
      <Head>
        <html lang={HTML_LANG[locale]} />
        <link rel="canonical" href={canonical} />
        {/* §5: full hreflang alternates including x-default on every page. */}
        {alternates.map((alt) => (
          <link key={alt.locale} rel="alternate" hrefLang={alt.locale} href={alt.href} />
        ))}
        <link
          rel="alternate"
          hrefLang="x-default"
          href={`${SITE_ORIGIN}${translatePath(pathname, DEFAULT_LOCALE)}`}
        />
        <meta property="og:locale" content={HTML_LANG[locale]} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonical} />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>

      <a className="skip-link" href="#main">
        {t('nav.skipToContent')}
      </a>

      <Nav locale={locale} />

      <div className={styles.page}>
        <Outlet />

        <footer className={styles.footer}>
          <div className="container">
            <div className={styles.footerRow}>
              <p className={styles.footerNote}>
                © {new Date().getFullYear()} Alexandre Saliba
              </p>
              {/* Visible version badge — lets the owner confirm at a glance which build
                  they are looking at without opening devtools. */}
              <p className={styles.footerNote} data-testid="version-badge">
                {t('footer.version', { version: APP_VERSION })}
              </p>
            </div>
          </div>
        </footer>
      </div>

      <UpdatePrompt />
    </>
  )
}

/**
 * Per-locale shell. The i18n instance is resolved per locale (never a mutated global),
 * so prerendering all three locales in one process cannot leak strings between them.
 */
export default function LocaleLayout({ locale }: Props) {
  return (
    <I18nextProvider i18n={getI18n(locale)}>
      <Chrome locale={locale} />
    </I18nextProvider>
  )
}
