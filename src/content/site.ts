/**
 * Site-wide external links and identity.
 *
 * Every empty string here is an unresolved `[FILL]` from handover §13. They are left
 * empty deliberately rather than guessed — the UI renders a visible "[FILL]" marker so
 * a missing value is obvious in review instead of silently vanishing, and each one is
 * listed in the handback notes.
 */
export const SITE_LINKS = {
  email: 'alexsaliba2@gmail.com',
  phone: '(305) 399 4862',
  location: 'Miami, FL',

  /**
   * The showcased project repos live on the alexsaliba2 account; the portfolio repo
   * itself is on georgealex22435 (a known identity split the owner accepted).
   */
  github: 'https://github.com/alexsaliba2',

  linkedin: 'https://www.linkedin.com/in/alexandre-saliba/',

  tableau: 'https://public.tableau.com/app/profile/alexandre.saliba/vizzes',
} as const

/**
 * One resume PDF per shipped locale (§8), served from /resume/.
 *
 * Only English exists so far — the owner supplied "Alexandre S. Resume 2026.pdf".
 * FR/ES remain [FILL]; those locales fall back to the pending state rather than
 * offering an English download under a French label.
 */
export const RESUME_PDF: Record<string, string> = {
  en: '/resume/alexandre-saliba-resume-en.pdf',
  fr: '',
  es: '',
}
