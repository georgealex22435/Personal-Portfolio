import i18next, { type i18n as I18nInstance } from 'i18next'
import { initReactI18next } from 'react-i18next'
import type { Locale } from './locales'
import { DEFAULT_LOCALE, LOCALES } from './locales'

import en from '../locales/en/common.json'
import fr from '../locales/fr/common.json'
import es from '../locales/es/common.json'

const RESOURCES: Record<Locale, typeof en> = { en, fr, es }

/**
 * One i18next instance per locale, cached.
 *
 * A single global instance with `changeLanguage` is wrong here: prerendering renders
 * every locale in the same Node process, so a shared mutable instance would let one
 * page's language leak into another's output depending on render order. Per-locale
 * instances make that class of bug impossible.
 *
 * §5 also forbids a silent English fallback mid-French-page, so fallbackLng is off.
 * A missing key renders its own key string — loud and obvious in review — rather than
 * quietly swapping in English.
 */
const instances = new Map<Locale, I18nInstance>()

export function getI18n(locale: Locale): I18nInstance {
  const existing = instances.get(locale)
  if (existing) return existing

  const instance = i18next.createInstance()
  instance.use(initReactI18next).init({
    lng: locale,
    fallbackLng: false,
    supportedLngs: LOCALES as unknown as string[],
    ns: ['common'],
    defaultNS: 'common',
    resources: { [locale]: { common: RESOURCES[locale] } },
    interpolation: {
      // React already escapes; double-escaping mangles apostrophes in French copy.
      escapeValue: false,
    },
    react: { useSuspense: false },
    returnEmptyString: false,
  })

  instances.set(locale, instance)
  return instance
}

/**
 * Build-time guard against §5's "the build fails loudly on a missing locale file".
 * Compares every leaf key path in each locale against English and throws on a gap.
 */
export function assertLocaleParity(): void {
  const leafKeys = (obj: unknown, prefix = ''): string[] => {
    if (obj === null || typeof obj !== 'object') return [prefix]
    return Object.entries(obj as Record<string, unknown>).flatMap(([key, value]) =>
      leafKeys(value, prefix ? `${prefix}.${key}` : key),
    )
  }

  const reference = new Set(leafKeys(RESOURCES[DEFAULT_LOCALE]))
  const problems: string[] = []

  for (const locale of LOCALES) {
    if (locale === DEFAULT_LOCALE) continue
    const keys = new Set(leafKeys(RESOURCES[locale]))

    for (const key of reference) {
      // i18next plural suffixes legitimately differ per language, so compare the base.
      const base = key.replace(/_(one|other|two|few|many|zero)$/, '')
      const present = [...keys].some((k) => k.replace(/_(one|other|two|few|many|zero)$/, '') === base)
      if (!present) problems.push(`${locale}: missing "${key}"`)
    }
    for (const key of keys) {
      const base = key.replace(/_(one|other|two|few|many|zero)$/, '')
      const present = [...reference].some(
        (k) => k.replace(/_(one|other|two|few|many|zero)$/, '') === base,
      )
      if (!present) problems.push(`${locale}: extra "${key}" not in ${DEFAULT_LOCALE}`)
    }
  }

  if (problems.length > 0) {
    throw new Error(`Locale parity check failed:\n  ${problems.join('\n  ')}`)
  }
}
