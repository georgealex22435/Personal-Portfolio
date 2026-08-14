import type { Locale } from '../i18n/locales'
import { LOCALES } from '../i18n/locales'
import { COVER_SIZES } from '../generated/covers'
import type { Project, ProjectFrontmatter, ProjectMeta } from './types'

/**
 * Content loader — §6: "Content is never hardcoded into components. Adding a project
 * means adding files, not editing code."
 *
 * Both globs are eager so everything resolves at build time and prerendering can emit
 * every project page without async data loading.
 */

const metaModules = import.meta.glob<{ default: ProjectMeta }>('./projects/*/meta.yaml', {
  eager: true,
})

const bodyModules = import.meta.glob<{
  frontmatter: ProjectFrontmatter
  html: string
}>('./projects/*/*.md', { eager: true })

/**
 * Cover images live in src/content/covers/ rather than public/, so Vite fingerprints
 * and emits them. A content-hashed filename means a replaced cover can never be served
 * from a stale cache — the same cache-busting property the JS bundle gets.
 *
 * meta.yaml keeps the handover's "/covers/<file>" field format; only the basename is
 * matched here.
 */
const coverModules = import.meta.glob<string>('./covers/*', {
  eager: true,
  query: '?url',
  import: 'default',
})

const coverByName = new Map<string, string>()
for (const [path, url] of Object.entries(coverModules)) {
  const name = path.split('/').pop()
  if (name) coverByName.set(name, url)
}

export interface ResolvedCover {
  url: string
  width: number
  height: number
}

/**
 * Resolved cover with its intrinsic dimensions, or undefined when the owner has not
 * supplied the asset yet.
 *
 * Dimensions come from the generated manifest rather than a fixed guess — the supplied
 * covers range from 1.35:1 to 2.26:1, so a single hardcoded size would mis-reserve
 * space on most of them and shift layout as they load.
 */
export function resolveCover(cover: string): ResolvedCover | undefined {
  const name = cover.split('/').pop()
  if (!name) return undefined
  const url = coverByName.get(name)
  const size = COVER_SIZES[name]
  if (!url || !size) return undefined
  return { url, width: size.width, height: size.height }
}

/** "./projects/hospital-readmissions/meta.yaml" → "hospital-readmissions" */
function dirOf(path: string): string {
  return path.split('/')[2] ?? ''
}

/** "./projects/hospital-readmissions/fr.md" → "fr" */
function localeOf(path: string): string {
  const file = path.split('/').pop() ?? ''
  return file.replace(/\.md$/, '')
}

const metaById = new Map<string, ProjectMeta>()
for (const [path, mod] of Object.entries(metaModules)) {
  metaById.set(dirOf(path), mod.default)
}

/** id → locale → { frontmatter, html } */
const bodyById = new Map<string, Map<string, { frontmatter: ProjectFrontmatter; html: string }>>()
for (const [path, mod] of Object.entries(bodyModules)) {
  const id = dirOf(path)
  const locale = localeOf(path)
  if (!bodyById.has(id)) bodyById.set(id, new Map())
  bodyById.get(id)!.set(locale, { frontmatter: mod.frontmatter, html: mod.html })
}

/**
 * §5: "The build fails loudly on a missing locale file. Silent English fallback
 * mid-French-page is worse than no French."
 */
function assertContentComplete(): void {
  const problems: string[] = []

  for (const [id, meta] of metaById) {
    if (meta.id !== id) {
      problems.push(`${id}: meta.yaml declares id "${meta.id}" but lives in directory "${id}"`)
    }
    const bodies = bodyById.get(id)
    for (const locale of LOCALES) {
      if (!bodies?.has(locale)) problems.push(`${id}: missing ${locale}.md`)
    }
  }

  for (const id of bodyById.keys()) {
    if (!metaById.has(id)) problems.push(`${id}: has translations but no meta.yaml`)
  }

  // Slugs must be unique per locale or two projects would collide on one URL.
  for (const locale of LOCALES) {
    const seen = new Map<string, string>()
    for (const [id, bodies] of bodyById) {
      const slug = bodies.get(locale)?.frontmatter.slug
      if (!slug) continue
      const clash = seen.get(slug)
      if (clash) problems.push(`${locale}: slug "${slug}" used by both ${clash} and ${id}`)
      seen.set(slug, id)
    }
  }

  if (problems.length > 0) {
    throw new Error(`Project content check failed:\n  ${problems.join('\n  ')}`)
  }
}

assertContentComplete()

/** All projects for a locale, in `order`. */
export function getProjects(locale: Locale): Project[] {
  const projects: Project[] = []

  for (const [id, meta] of metaById) {
    const body = bodyById.get(id)?.get(locale)
    if (!body) continue
    projects.push({ meta, frontmatter: body.frontmatter, html: body.html, locale })
  }

  return projects.sort((a, b) => a.meta.order - b.meta.order)
}

/** §8: the three with `featured: true`, by `order`. */
export function getFeaturedProjects(locale: Locale): Project[] {
  return getProjects(locale).filter((p) => p.meta.featured)
}

/** Resolve by that locale's slug — the form that appears in the URL. */
export function getProjectBySlug(locale: Locale, slug: string): Project | undefined {
  return getProjects(locale).find((p) => p.frontmatter.slug === slug)
}

/** Every localized slug, for prerendering the detail routes. */
export function getSlugs(locale: Locale): string[] {
  return getProjects(locale).map((p) => p.frontmatter.slug)
}

/**
 * Translate a slug across locales — used by hreflang alternates and the language
 * switcher so /fr/projets/<fr-slug> maps to /es/proyectos/<es-slug> rather than
 * dropping the visitor on the section index.
 */
export function translateSlug(slug: string, from: Locale, to: Locale): string | undefined {
  for (const [id, bodies] of bodyById) {
    if (bodies.get(from)?.frontmatter.slug === slug) {
      return bodyById.get(id)?.get(to)?.frontmatter.slug
    }
  }
  return undefined
}

/** The next project in `order`, wrapping around — §8's "Next project" link. */
export function getNextProject(locale: Locale, id: string): Project | undefined {
  const all = getProjects(locale)
  const index = all.findIndex((p) => p.meta.id === id)
  if (index === -1) return undefined
  return all[(index + 1) % all.length]
}
