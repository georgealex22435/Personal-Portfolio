import type { Locale } from '../i18n/locales'

/**
 * Appendix A — the owner's own copy.
 *
 * The English is VERBATIM from the handover and must not be rewritten, embellished, or
 * "improved". The French and Spanish are translations written by Claude and are pending
 * the owner's review (§5 allows the owner to write *or review* all three).
 *
 * This lives in the content layer rather than in a component, per §6's rule that
 * content is never hardcoded into components.
 */

export const POSITIONING: Record<Locale, string> = {
  en: 'Data analyst working across analytics, data science, and data engineering.',
  fr: 'Analyste de données travaillant en analytique, science des données et ingénierie des données.',
  es: 'Analista de datos con experiencia en analítica, ciencia de datos e ingeniería de datos.',
}

export const ABOUT_PARAGRAPHS: Record<Locale, [string, string]> = {
  en: [
    'I started in Computer Science, but the field was broad enough that I kept looking for the specific part of it I wanted to do. I found it in analytics. Statistics was always the part I enjoyed, and more precisely, taking data and making it make sense. Data has three branches — analytics, science, and engineering — that intersect more than they separate, and my education at Miami Dade College has given me a foundation in all three.',
    "Outside of school I'm usually upgrading my custom-built PC, gaming, or working through certifications to sharpen what I already have.",
  ],
  fr: [
    "J'ai commencé en informatique, mais le domaine était assez vaste pour que je continue à chercher la partie précise que je voulais exercer. Je l'ai trouvée dans l'analytique. Les statistiques ont toujours été ce qui me plaisait, et plus précisément le fait de prendre des données et de leur donner du sens. Les données comptent trois branches — analytique, science et ingénierie — qui se recoupent plus qu'elles ne se séparent, et ma formation au Miami Dade College m'a donné des bases dans les trois.",
    "En dehors des cours, je passe surtout mon temps à améliorer le PC que j'ai monté moi-même, à jouer, ou à préparer des certifications pour affûter ce que je maîtrise déjà.",
  ],
  es: [
    'Empecé en Informática, pero el campo era lo bastante amplio como para que siguiera buscando la parte concreta a la que quería dedicarme. La encontré en la analítica. La estadística fue siempre la parte que disfrutaba y, más concretamente, tomar datos y hacer que cobraran sentido. Los datos tienen tres ramas —analítica, ciencia e ingeniería— que se cruzan más de lo que se separan, y mi formación en Miami Dade College me ha dado una base en las tres.',
    'Fuera de las clases suelo estar mejorando el PC que monté yo mismo, jugando o preparando certificaciones para afinar lo que ya sé.',
  ],
}

/**
 * §8 / Appendix A: "Three branches, four projects."
 * Explicitly load-bearing — it turns the project grid into evidence for the claim the
 * About section makes. Do not cut it or reword it.
 */
export const GRID_LEAD_IN: Record<Locale, string> = {
  en: 'Three branches, four projects.',
  fr: 'Trois branches, quatre projets.',
  es: 'Tres ramas, cuatro proyectos.',
}
