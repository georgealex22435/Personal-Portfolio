import { Head } from 'vite-react-ssg'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import type { Locale } from '../i18n/locales'
import { localePath } from '../i18n/locales'
import { SITE_LINKS } from '../content/site'
import styles from './Home.module.css'

interface Props {
  locale: Locale
}

/**
 * Offline fallback — handover §3.
 *
 * "A real translated offline page naming what is available cached, plus the email
 * address. Not a browser error."
 *
 * One per locale, prerendered, so the service worker can serve the page matching the
 * URL the visitor asked for rather than defaulting everyone to English.
 */
export default function Offline({ locale }: Props) {
  const { t } = useTranslation()

  return (
    <>
      <Head>
        <title>{t('offline.heading')}</title>
        {/* Never index the offline shell — it would compete with the real pages. */}
        <meta name="robots" content="noindex" />
      </Head>

      <main id="main" className="container">
        <section className={styles.hero}>
          <h1 className={styles.name}>{t('offline.heading')}</h1>
          <p className={styles.positioning}>{t('offline.body')}</p>
        </section>

        <section className={styles.section} aria-labelledby="offline-available">
          <h2 id="offline-available" className={styles.sectionLabel}>
            {t('offline.availableHeading')}
          </h2>
          <ul className={styles.contactList}>
            <li className={styles.contactItem}>
              <Link to={localePath(locale)}>{t('nav.home')}</Link>
            </li>
            <li className={styles.contactItem}>
              <Link to={localePath(locale, 'projects')}>{t('nav.projects')}</Link>
            </li>
            <li className={styles.contactItem}>
              <Link to={localePath(locale, 'about')}>{t('nav.about')}</Link>
            </li>
            <li className={styles.contactItem}>
              <Link to={localePath(locale, 'resume')}>{t('nav.resume')}</Link>
            </li>
          </ul>
        </section>

        <section className={styles.section} aria-labelledby="offline-contact">
          <h2 id="offline-contact" className={styles.sectionLabel}>
            {t('home.contactHeading')}
          </h2>
          <p className={styles.aboutBody}>{t('offline.contactPrompt')}</p>
          <p className={styles.email}>{SITE_LINKS.email}</p>
        </section>
      </main>
    </>
  )
}
