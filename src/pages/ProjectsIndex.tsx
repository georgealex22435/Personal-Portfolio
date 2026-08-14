import { useSearchParams } from 'react-router-dom'
import { Head } from 'vite-react-ssg'
import { useTranslation } from 'react-i18next'
import type { Locale } from '../i18n/locales'
import { getProjects } from '../content/projects'
import type { Domain } from '../content/types'
import ProjectCard from '../components/ProjectCard/ProjectCard'
import styles from './ProjectsIndex.module.css'

interface Props {
  locale: Locale
}

const ALL = 'all'

export default function ProjectsIndex({ locale }: Props) {
  const { t } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()

  const projects = getProjects(locale)

  // §8: "Domain filter chips built from frontmatter" — never a hardcoded list, so a
  // new project with a new domain gets a chip without touching this file.
  const domains = [...new Set(projects.map((p) => p.meta.domain))].sort()

  const active = searchParams.get('domain')
  const selected: Domain | typeof ALL =
    active && domains.includes(active as Domain) ? (active as Domain) : ALL

  const visible = selected === ALL ? projects : projects.filter((p) => p.meta.domain === selected)

  /**
   * §8: "filter state in the URL query string so a filtered view is shareable."
   * `replace` keeps the back button meaning "previous page", not "previous chip".
   */
  const select = (domain: Domain | typeof ALL) => {
    const next = new URLSearchParams(searchParams)
    if (domain === ALL) next.delete('domain')
    else next.set('domain', domain)
    setSearchParams(next, { replace: true })
  }

  return (
    <>
      <Head>
        <title>{t('meta.projectsTitle')}</title>
        <meta name="description" content={t('meta.projectsDescription')} />
      </Head>

      <main id="main" className="container">
        <header className={styles.header}>
          <h1 className={styles.heading}>{t('projects.heading')}</h1>
          <p className={styles.leadIn}>{t('home.gridLeadIn')}</p>
        </header>

        <fieldset className={styles.filters}>
          <legend className={styles.filtersLegend}>{t('projects.filterLabel')}</legend>

          <button
            type="button"
            className={selected === ALL ? styles.chipActive : styles.chip}
            aria-pressed={selected === ALL}
            onClick={() => select(ALL)}
          >
            {t('projects.all')}
          </button>

          {domains.map((domain) => (
            <button
              key={domain}
              type="button"
              className={selected === domain ? styles.chipActive : styles.chip}
              aria-pressed={selected === domain}
              onClick={() => select(domain)}
            >
              {t(`domains.${domain}`)}
            </button>
          ))}
        </fieldset>

        {/* Announced politely so the result count reaches screen readers when the
            filter changes without a navigation. */}
        <p className={styles.count} role="status" data-testid="project-count">
          {t('projects.showing', { count: visible.length })}
        </p>

        {visible.length === 0 ? (
          <p className={styles.empty}>{t('projects.empty')}</p>
        ) : (
          <ul className={styles.grid}>
            {visible.map((project) => (
              <li key={project.meta.id}>
                <ProjectCard project={project} locale={locale} />
              </li>
            ))}
          </ul>
        )}
      </main>
    </>
  )
}
