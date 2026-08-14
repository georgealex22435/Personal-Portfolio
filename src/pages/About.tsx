import { Head } from 'vite-react-ssg'
import { useTranslation } from 'react-i18next'
import type { Locale } from '../i18n/locales'
import { ABOUT_PARAGRAPHS } from '../content/about'
import styles from './Home.module.css'

interface Props {
  locale: Locale
}

/**
 * §8 About: "Appendix A verbatim. One photo. No stock imagery."
 *
 * No photo is rendered — the owner has not supplied one, and §8 forbids stock imagery,
 * so a placeholder person would be worse than none. Listed in the handback notes.
 */
export default function About({ locale }: Props) {
  const { t } = useTranslation()
  const paragraphs = ABOUT_PARAGRAPHS[locale]

  return (
    <>
      <Head>
        <title>{t('meta.aboutTitle')}</title>
        <meta name="description" content={t('meta.aboutDescription')} />
      </Head>

      <main id="main" className="container">
        <section className={styles.hero}>
          <h1 className={styles.name}>{t('about.heading')}</h1>
          <div className={styles.aboutBody} data-testid="about-body">
            {paragraphs.map((paragraph) => (
              <p key={paragraph.slice(0, 32)} style={{ marginBlockEnd: 'var(--space-m)' }}>
                {paragraph}
              </p>
            ))}
          </div>
        </section>
      </main>
    </>
  )
}
