import { Link } from 'react-router-dom'
import { Head } from 'vite-react-ssg'
import { useTranslation } from 'react-i18next'
import type { Locale } from '../i18n/locales'
import { localePath } from '../i18n/locales'
import { getFeaturedProjects } from '../content/projects'
import { ABOUT_PARAGRAPHS, GRID_LEAD_IN, POSITIONING } from '../content/about'
import { SITE_LINKS } from '../content/site'
import ProjectCard from '../components/ProjectCard/ProjectCard'
import ContactForm from '../components/ContactForm/ContactForm'
import styles from './Home.module.css'

interface Props {
  locale: Locale
}

/**
 * §8 Home: hero → featured projects → about strip → contact.
 * "Under three scroll-screens on desktop."
 */
export default function Home({ locale }: Props) {
  const { t } = useTranslation()
  const featured = getFeaturedProjects(locale)

  return (
    <>
      <Head>
        <title>{t('meta.homeTitle')}</title>
        <meta name="description" content={t('meta.homeDescription')} />
        <meta property="og:title" content={t('meta.homeTitle')} />
        <meta property="og:description" content={t('meta.homeDescription')} />
        {/* §10: JSON-LD Person on home. */}
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Person',
            name: 'Alexandre Saliba',
            jobTitle: 'Data Analyst',
            description: POSITIONING[locale],
            alumniOf: { '@type': 'CollegeOrUniversity', name: 'Miami Dade College' },
            sameAs: [SITE_LINKS.github].filter(Boolean),
          })}
        </script>
      </Head>

      <main id="main" className="container">
        {/* 1. Hero — name in display type, positioning line, two links. No photo. */}
        <section className={styles.hero}>
          <h1 className={styles.name}>Alexandre Saliba</h1>
          <p className={styles.positioning} data-testid="positioning">
            {POSITIONING[locale]}
          </p>
          <div className={styles.heroLinks}>
            <Link className={styles.primaryLink} to={localePath(locale, 'projects')}>
              {t('home.seeWork')}
            </Link>
            <Link className={styles.secondaryLink} to={localePath(locale, 'resume')}>
              {t('home.downloadResume')}
            </Link>
          </div>
        </section>

        {/* 2 + 3. Featured projects, with the load-bearing lead-in above the grid. */}
        <section className={styles.section} aria-labelledby="featured">
          <h2 id="featured" className={styles.sectionLabel}>
            {t('home.featuredHeading')}
          </h2>
          <p className={styles.leadIn} data-testid="grid-lead-in">
            {GRID_LEAD_IN[locale]}
          </p>
          <ul className={styles.grid}>
            {featured.map((project) => (
              <li key={project.meta.id}>
                <ProjectCard project={project} locale={locale} />
              </li>
            ))}
          </ul>
        </section>

        {/* 4. About strip — first paragraph of Appendix A plus a link. */}
        <section className={styles.section} aria-labelledby="about">
          <h2 id="about" className={styles.sectionLabel}>
            {t('home.aboutHeading')}
          </h2>
          <p className={styles.aboutBody}>{ABOUT_PARAGRAPHS[locale][0]}</p>
          <Link className={styles.aboutMore} to={localePath(locale, 'about')}>
            {t('home.aboutMore')} →
          </Link>
        </section>

        {/* 5. Contact — email in plain selectable text, plus profile links. */}
        <section className={styles.section} aria-labelledby="contact">
          <h2 id="contact" className={styles.sectionLabel}>
            {t('home.contactHeading')}
          </h2>

          {/* §8: email in plain selectable text. It is in the prerendered HTML, so it
              works with no JS, offline, and when the send endpoint is unconfigured. */}
          <p className={styles.email}>{SITE_LINKS.email}</p>

          <ContactForm />

          <ul className={styles.contactList}>
            {(
              [
                ['contact.github', SITE_LINKS.github],
                ['contact.linkedin', SITE_LINKS.linkedin],
                ['contact.tableau', SITE_LINKS.tableau],
              ] as const
            ).map(([key, href]) => (
              <li key={key} className={styles.contactItem}>
                <a href={href} target="_blank" rel="noopener noreferrer">
                  {t(key)} ↗
                </a>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </>
  )
}
