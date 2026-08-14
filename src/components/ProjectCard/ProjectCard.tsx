import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { Locale } from '../../i18n/locales'
import { localePath } from '../../i18n/locales'
import { resolveCover } from '../../content/projects'
import type { Project } from '../../content/types'
import StatLine from '../StatLine/StatLine'
import styles from './ProjectCard.module.css'

interface Props {
  project: Project
  locale: Locale
}

export default function ProjectCard({ project, locale }: Props) {
  const { t } = useTranslation()
  const { meta, frontmatter } = project
  const cover = resolveCover(meta.cover)
  const href = localePath(locale, 'projects', frontmatter.slug)

  const stats = meta.stats.map((stat) => ({
    key: stat.key,
    value: stat.value,
    label: t(`stats.${stat.key}`),
  }))

  return (
    <article className={styles.card}>
      <div className={styles.cardInner}>
        {cover ? (
          <img
            className={styles.cover}
            src={cover.url}
            alt={frontmatter.coverAlt}
            width={cover.width}
            height={cover.height}
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className={styles.coverMissing}>{frontmatter.coverAlt}</div>
        )}

        <div className={styles.body}>
          <p className={styles.domain}>{t(`domains.${meta.domain}`)}</p>

          {/* Cards lead with the research question, not the finding.
              Owner decision 2026-08-14: these findings are too substantial to compress
              into a card, and a truncated conclusion reads worse than a clear question.
              The full headline sentence still opens the detail page, where it has room
              to land. Each title is already framed as the question or design problem. */}
          <h3 className={styles.question}>
            <Link className={styles.titleLink} to={href}>
              {frontmatter.title}
            </Link>
          </h3>

          <div className={styles.statLineWrap}>
            {/* Count-up is reserved for the detail page; a grid of animating cards
                would blow §7's "one orchestrated moment" animation budget. */}
            <StatLine stats={stats} locale={locale} animate={false} />
          </div>

          <ul className={styles.tools}>
            {meta.tools.map((tool) => (
              <li key={tool} className={styles.tool}>
                {tool}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </article>
  )
}
