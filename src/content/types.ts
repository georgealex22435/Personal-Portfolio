import type { Locale } from '../i18n/locales'

/** §6: domains are a closed set, used for the index filter chips. */
export const DOMAINS = ['healthcare', 'gaming', 'data-engineering', 'analytics'] as const
export type Domain = (typeof DOMAINS)[number]

/** A figure in the stat line. `key` is an i18n key; `value` is a raw number. */
export interface StatSpec {
  key: string
  value: number
}

export interface ProjectLinks {
  repo?: string
  notebook?: string
  dashboard?: string
  report?: string
}

/** meta.yaml — locale-independent fields shared by all translations. */
export interface ProjectMeta {
  id: string
  timeframe: number
  stats: StatSpec[]
  tools: string[]
  domain: Domain
  cover: string
  links: ProjectLinks
  featured: boolean
  order: number
}

/** Per-locale frontmatter from <locale>.md. */
export interface ProjectFrontmatter {
  /** Localized slug — declared here, never machine-translated at runtime (§5). */
  slug: string
  title: string
  role: string
  /**
   * A full sentence stating the finding, not a topic.
   * §6: "it is the most important string on the site."
   */
  headline: string
  coverAlt: string
}

/** A project resolved for one locale: shared meta + that locale's copy. */
export interface Project {
  meta: ProjectMeta
  frontmatter: ProjectFrontmatter
  /** Body HTML, compiled at build time by plugins/content.ts. */
  html: string
  locale: Locale
}
