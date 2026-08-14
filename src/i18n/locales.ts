/**
 * Locale definitions and the localized path segments from handover §5.
 *
 * Slugs are declared here, never machine-translated at runtime. Adding a locale is
 * additive: append to LOCALES and add its column to PATH_SEGMENTS.
 */

export const LOCALES = ['en', 'fr', 'es'] as const
export type Locale = (typeof LOCALES)[number]

export const DEFAULT_LOCALE: Locale = 'en'

export function isLocale(value: string | null | undefined): value is Locale {
  return value != null && (LOCALES as readonly string[]).includes(value)
}

/** BCP-47 tags for <html lang> and hreflang. */
export const HTML_LANG: Record<Locale, string> = {
  en: 'en',
  fr: 'fr',
  es: 'es',
}

/** Language switcher labels — text, never flag icons (§7 forbidden list). */
export const LOCALE_LABEL: Record<Locale, string> = {
  en: 'EN',
  fr: 'FR',
  es: 'ES',
}

/**
 * Route keys → localized path segment, per §5.
 *   /en/projects   /fr/projets    /es/proyectos
 *   /en/about      /fr/a-propos   /es/sobre-mi
 *   /en/resume     /fr/cv         /es/cv
 */
export const PATH_SEGMENTS = {
  projects: { en: 'projects', fr: 'projets', es: 'proyectos' },
  about: { en: 'about', fr: 'a-propos', es: 'sobre-mi' },
  resume: { en: 'resume', fr: 'cv', es: 'cv' },
} as const satisfies Record<string, Record<Locale, string>>

export type RouteKey = keyof typeof PATH_SEGMENTS

/**
 * Build a localized path, e.g. localePath('fr', 'projects') → "/fr/projets/".
 *
 * Always trailing-slashed. Prerendering emits nested directories (fr/projets/index.html),
 * so "/fr/projets/" is the canonical URL and "/fr/projets" 301s to it. Emitting the
 * slashless form in links, canonical tags, or hreflang alternates would make every one
 * of them a redirect hop and point search engines at a non-canonical URL.
 */
export function localePath(locale: Locale, key?: RouteKey, slug?: string): string {
  if (!key) return `/${locale}/`
  const segment = PATH_SEGMENTS[key][locale]
  return slug ? `/${locale}/${segment}/${slug}/` : `/${locale}/${segment}/`
}

/** Normalize any pathname to the trailing-slash canonical form. */
export function canonicalPath(pathname: string): string {
  if (pathname.endsWith('/')) return pathname
  return `${pathname}/`
}

/**
 * Parse a pathname into its locale and route key.
 *
 * Returns `slug` untranslated — project slugs are localized in content frontmatter,
 * not here, so the caller resolves them via the content layer (§5: localized slugs
 * live in frontmatter, never machine-translated at runtime).
 */
export function parsePath(pathname: string): {
  locale: Locale
  key?: RouteKey
  slug?: string
} | null {
  const parts = pathname.split('/').filter(Boolean)
  const [maybeLocale, segment, slug] = parts

  if (!isLocale(maybeLocale)) return null
  if (!segment) return { locale: maybeLocale }

  for (const key of Object.keys(PATH_SEGMENTS) as RouteKey[]) {
    if (PATH_SEGMENTS[key][maybeLocale] === segment) {
      return slug ? { locale: maybeLocale, key, slug } : { locale: maybeLocale, key }
    }
  }
  return { locale: maybeLocale }
}

/**
 * Equivalent path in another locale, for hreflang alternates and the language switcher.
 * `slugFor` resolves a project's localized slug; without it, a slugged route falls back
 * to the section index rather than emitting a wrong URL.
 */
export function translatePath(
  pathname: string,
  target: Locale,
  slugFor?: (slug: string, target: Locale) => string | undefined,
): string {
  const parsed = parsePath(pathname)
  if (!parsed) return `/${target}/`
  if (!parsed.key) return `/${target}/`

  if (parsed.slug) {
    const translated = slugFor?.(parsed.slug, target)
    return translated
      ? localePath(target, parsed.key, translated)
      : localePath(target, parsed.key)
  }
  return localePath(target, parsed.key)
}

/**
 * Resolve a preferred locale from an Accept-Language header value.
 * Used by the Worker for the "/" redirect (§5: handled server-side, not client-side).
 */
export function pickLocale(acceptLanguage: string | null): Locale {
  if (!acceptLanguage) return DEFAULT_LOCALE

  const ranked = acceptLanguage
    .split(',')
    .map((part) => {
      const [tag = '', ...params] = part.trim().split(';')
      const qParam = params.find((p) => p.trim().startsWith('q='))
      const q = qParam ? Number.parseFloat(qParam.split('=')[1] ?? '1') : 1
      return { tag: tag.trim().toLowerCase(), q: Number.isNaN(q) ? 0 : q }
    })
    .filter((entry) => entry.tag.length > 0)
    .sort((a, b) => b.q - a.q)

  for (const { tag } of ranked) {
    const base = tag.split('-')[0]
    if (isLocale(base)) return base
  }
  return DEFAULT_LOCALE
}
