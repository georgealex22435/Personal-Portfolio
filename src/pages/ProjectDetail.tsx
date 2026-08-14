import { Link, useParams } from 'react-router-dom'
import { Head } from 'vite-react-ssg'
import { useTranslation } from 'react-i18next'
import type { Locale } from '../i18n/locales'
import { localePath } from '../i18n/locales'
import { getNextProject, getProjectBySlug, resolveCover } from '../content/projects'
import type { ProjectLinks } from '../content/types'
import StatLine from '../components/StatLine/StatLine'
import styles from './ProjectDetail.module.css'

interface Props {
  locale: Locale
}

/** Inline so no icon font or sprite request is needed. */
function ExternalIcon() {
  return (
    <svg
      className={styles.linkIcon}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M7 17 17 7M9 7h8v8" strokeLinecap="square" />
    </svg>
  )
}

/**
 * Link order. The handover's agent note for employee-satisfaction says the rendered
 * report is more valuable to a recruiter than the repo and must be the primary link,
 * so `report` and `dashboard` sort ahead of `repo` wherever they exist.
 */
const LINK_ORDER: (keyof ProjectLinks)[] = ['report', 'dashboard', 'notebook', 'repo']

export default function ProjectDetail({ locale }: Props) {
  const { t } = useTranslation()
  const { slug } = useParams<{ slug: string }>()

  const project = slug ? getProjectBySlug(locale, slug) : undefined

  if (!project) {
    return (
      <main id="main" className="container">
        <h1>404</h1>
      </main>
    )
  }

  const { meta, frontmatter, html } = project
  const next = getNextProject(locale, meta.id)
  const cover = resolveCover(meta.cover)

  const stats = meta.stats.map((stat) => ({
    key: stat.key,
    value: stat.value,
    label: t(`stats.${stat.key}`),
  }))

  const links = LINK_ORDER.filter((key) => Boolean(meta.links[key])).map((key) => ({
    key,
    href: meta.links[key] as string,
    label: t(`project.${key}`),
  }))

  return (
    <>
      <Head>
        <title>{`${frontmatter.title} — Alexandre Saliba`}</title>
        <meta name="description" content={frontmatter.headline} />
        <meta property="og:title" content={frontmatter.title} />
        <meta property="og:description" content={frontmatter.headline} />
      </Head>

      <main id="main" className="container">
        <header className={styles.header}>
          <p className={styles.eyebrow}>
            <span>{frontmatter.role}</span>
            <span>{meta.timeframe}</span>
          </p>
          <h1 className={styles.title}>{frontmatter.title}</h1>
          {/* The finding, stated as a sentence — the hero of the page (§8). */}
          <p className={styles.headline} data-testid="project-headline">
            {frontmatter.headline}
          </p>
        </header>

        <div className={styles.statLineWrap}>
          <StatLine stats={stats} locale={locale} />
        </div>

        <figure className={styles.cover}>
          {cover ? (
            <img
              className={styles.coverImage}
              src={cover.url}
              alt={frontmatter.coverAlt}
              // §10: explicit intrinsic dimensions so the image reserves exactly its own
              // space and cannot shift layout as it loads. Above the fold, so eager.
              width={cover.width}
              height={cover.height}
              decoding="async"
              data-testid="cover-image"
            />
          ) : (
            /* Covers the owner has not exported yet render as a labelled gap rather
               than a broken image or a decorative stand-in, so a missing asset is
               obvious in review. Listed in the handback notes. */
            <div className={styles.coverMissing} data-testid="cover-missing">
              {frontmatter.coverAlt}
            </div>
          )}
          <figcaption className={styles.caption}>{frontmatter.coverAlt}</figcaption>
        </figure>

        {links.length > 0 && (
          <nav className={styles.links} aria-label={t('project.repo')}>
            {links.map((link, index) => (
              <a
                key={link.key}
                href={link.href}
                className={index === 0 ? styles.linkPrimary : styles.link}
                target="_blank"
                rel="noopener noreferrer"
              >
                {link.label}
                <ExternalIcon />
              </a>
            ))}
          </nav>
        )}

        <ul className={styles.tools}>
          {meta.tools.map((tool) => (
            <li key={tool} className={styles.tool}>
              {tool}
            </li>
          ))}
        </ul>

        {/* Body HTML is compiled at build time from Markdown the owner controls — no
            user input reaches this, so dangerouslySetInnerHTML is safe here. */}
        <div
          className={styles.body}
          data-testid="project-body"
          dangerouslySetInnerHTML={{ __html: html }}
        />

        {next && (
          <Link
            className={styles.next}
            to={localePath(locale, 'projects', next.frontmatter.slug)}
          >
            <span className={styles.nextLabel}>{t('projects.next')}</span>
            <span className={styles.nextTitle}>{next.frontmatter.title}</span>
          </Link>
        )}
      </main>
    </>
  )
}
