import { Head } from 'vite-react-ssg'
import { useTranslation } from 'react-i18next'
import type { Locale } from '../i18n/locales'
import { RESUME_PDF, SITE_LINKS } from '../content/site'
import { RESUME } from '../content/resume'
import { getProjects } from '../content/projects'
import { localePath } from '../i18n/locales'
import { Link } from 'react-router-dom'
import styles from './Resume.module.css'

interface Props {
  locale: Locale
}

/**
 * §8 Resume: "Full resume as real HTML — searchable, linkable, indexable — with a
 * prominent Download PDF at the top."
 *
 * Content is transcribed from the owner's PDF (src/content/resume.ts). Projects are
 * pulled from the content layer rather than duplicated, so adding a project updates the
 * resume too — §6's "content is never hardcoded into components" applies here as well.
 */
export default function Resume({ locale }: Props) {
  const { t } = useTranslation()
  const resume = RESUME[locale]
  const projects = getProjects(locale)
  const pdf = RESUME_PDF[locale]

  return (
    <>
      <Head>
        <title>{t('meta.resumeTitle')}</title>
        <meta name="description" content={t('meta.resumeDescription')} />
      </Head>

      <main id="main" className="container">
        <header className={styles.header}>
          <h1 className={styles.name}>Alexandre Saliba</h1>

          <p className={styles.contactLine}>
            <span>{SITE_LINKS.location}</span>
            <span aria-hidden="true">·</span>
            <span>{SITE_LINKS.phone}</span>
            <span aria-hidden="true">·</span>
            <a href={`mailto:${SITE_LINKS.email}`}>{SITE_LINKS.email}</a>
            <span aria-hidden="true">·</span>
            <a href={SITE_LINKS.linkedin} target="_blank" rel="noopener noreferrer">
              LinkedIn
            </a>
          </p>

          {pdf ? (
            <a className={styles.download} href={pdf} download>
              {t('resume.download')}
            </a>
          ) : (
            /* FR/ES PDFs are still [FILL]. Offering the English file under a French
               label would be worse than showing nothing, so this stays pending. */
            <p className={styles.pending} data-testid="resume-pdf-pending">
              {t('resume.downloadUnavailable')}
            </p>
          )}

          <p className={styles.summary}>{resume.summary}</p>
        </header>

        {resume.sections.map((section) => (
          <section key={section.heading} className={styles.section}>
            <h2 className={styles.sectionLabel}>{section.heading}</h2>

            {section.body && <p className={styles.prose}>{section.body}</p>}

            {section.items && (
              <ul className={styles.skills}>
                {section.items.map((item) => (
                  <li key={item} className={styles.skill}>
                    {item}
                  </li>
                ))}
              </ul>
            )}

            {section.entries?.map((entry) => (
              <article key={entry.title} className={styles.entry}>
                <div className={styles.entryHead}>
                  <h3 className={styles.entryTitle}>{entry.title}</h3>
                  {entry.meta && <p className={styles.entryMeta}>{entry.meta}</p>}
                </div>
                {entry.subtitle && <p className={styles.entrySubtitle}>{entry.subtitle}</p>}
                {entry.bullets && (
                  <ul className={styles.bullets}>
                    {entry.bullets.map((bullet) => (
                      <li key={bullet}>{bullet}</li>
                    ))}
                  </ul>
                )}
              </article>
            ))}
          </section>
        ))}

        {/* Projects come from the content layer so the resume and the site cannot drift. */}
        <section className={styles.section}>
          <h2 className={styles.sectionLabel}>{t('projects.heading')}</h2>
          {projects.map((project) => (
            <article key={project.meta.id} className={styles.entry}>
              <div className={styles.entryHead}>
                <h3 className={styles.entryTitle}>
                  <Link
                    className={styles.entryLink}
                    to={localePath(locale, 'projects', project.frontmatter.slug)}
                  >
                    {project.frontmatter.title}
                  </Link>
                </h3>
                <p className={styles.entryMeta}>{project.meta.timeframe}</p>
              </div>
              <p className={styles.entrySubtitle}>{project.frontmatter.role}</p>
              <ul className={styles.bullets}>
                <li>{project.frontmatter.headline}</li>
                <li>{project.meta.tools.join(' · ')}</li>
              </ul>
            </article>
          ))}
        </section>
      </main>
    </>
  )
}
