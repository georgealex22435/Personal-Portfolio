import type { Locale } from '../i18n/locales'

/**
 * Resume content — transcribed from the owner's "Alexandre S. Resume 2026.pdf"
 * (supplied 2026-08-14). §8 wants the resume as real HTML: searchable, linkable,
 * indexable, with the PDF as a download rather than the only copy.
 *
 * English is the owner's own wording. French and Spanish are translations pending the
 * owner's review, per §5's "writes or reviews" clause. Nothing here is invented —
 * every line traces to the PDF.
 */

export interface ResumeSection {
  heading: string
  /** Free prose (profile summary). */
  body?: string
  /** Bulleted list (skills, certifications). */
  items?: string[]
  /** Dated entries (education, experience, projects). */
  entries?: {
    title: string
    subtitle?: string
    meta?: string
    bullets?: string[]
  }[]
}

export const RESUME: Record<Locale, { summary: string; sections: ResumeSection[] }> = {
  en: {
    summary:
      'Soon-to-graduate Data Analytics student with an Associate in Computer Information Systems and hands-on experience leveraging large language models and cloud platforms to solve analytical problems. Proficient in SQL, Azure Data Studio, Tableau, Power BI, and R, with a strong foundation in cleaning and transforming complex datasets to surface actionable insights. Seeking opportunities in data analytics, business intelligence, or related roles.',
    sections: [
      {
        heading: 'Highlighted skills',
        items: [
          'SQL, MySQL, Power BI, Tableau',
          'Data visualization & statistical analysis',
          'Python & R',
          'Machine learning (Python — scikit-learn)',
          'Microsoft Azure & Databricks',
          'ETL processes & data transformation',
          'Azure Data Studio',
          'Microsoft Office Suite (Excel, Word, PowerPoint)',
          'Cloud data platforms (Azure, Databricks)',
          'Analytical & problem-solving skills',
          'Communication',
          'Team collaboration',
          'Data storytelling',
        ],
      },
      {
        heading: 'Education',
        entries: [
          {
            title: 'Bachelor of Applied Science, Data Analytics',
            subtitle: 'Miami Dade College — Miami, FL',
            meta: 'August 2026',
            bullets: [
              'Relevant coursework: SQL, Tableau, Power BI, Data Visualization, R Language, Databricks',
            ],
          },
          {
            title: 'Associate of Arts, Computer Information Systems',
            subtitle: 'Miami Dade College — Miami, FL',
            meta: 'July 2024',
          },
        ],
      },
      {
        heading: 'Certifications',
        items: [
          'Microsoft PL-300 Data Analyst Certification (in progress) — DataCamp',
          'Google Data Analytics Certification (in progress) — Coursera',
        ],
      },
      {
        heading: 'Experience',
        entries: [
          {
            title: 'Sales Associate',
            subtitle: 'CVS Pharmacy — Miami, FL',
            meta: '2021 – 2022',
            bullets: [
              'Assisted in the management of store inventory',
              'Engaged with clients at checkout using proprietary software',
              'Provided photography services and communicated effectively with customers',
              'Processed cash and card transactions accurately while maintaining balanced drawer reconciliations',
              'Supported team operations during peak hours by coordinating stock replenishment across assigned floor sections',
            ],
          },
        ],
      },
    ],
  },

  fr: {
    summary:
      "Étudiant en analytique des données, bientôt diplômé, titulaire d'un Associate en systèmes d'information et fort d'une expérience pratique des grands modèles de langage et des plateformes cloud appliqués à des problèmes analytiques. Maîtrise de SQL, Azure Data Studio, Tableau, Power BI et R, avec de solides bases en nettoyage et en transformation de jeux de données complexes pour en dégager des enseignements exploitables. À la recherche de postes en analytique des données, en informatique décisionnelle ou dans des domaines connexes.",
    sections: [
      {
        heading: 'Compétences clés',
        items: [
          'SQL, MySQL, Power BI, Tableau',
          'Visualisation de données et analyse statistique',
          'Python et R',
          'Apprentissage automatique (Python — scikit-learn)',
          'Microsoft Azure et Databricks',
          'Processus ETL et transformation de données',
          'Azure Data Studio',
          'Suite Microsoft Office (Excel, Word, PowerPoint)',
          'Plateformes de données cloud (Azure, Databricks)',
          'Esprit analytique et résolution de problèmes',
          'Communication',
          "Travail d'équipe",
          'Narration par les données',
        ],
      },
      {
        heading: 'Formation',
        entries: [
          {
            title: 'Bachelor of Applied Science, analytique des données',
            subtitle: 'Miami Dade College — Miami, Floride',
            meta: 'Août 2026',
            bullets: [
              'Cours pertinents : SQL, Tableau, Power BI, visualisation de données, langage R, Databricks',
            ],
          },
          {
            title: "Associate of Arts, systèmes d'information",
            subtitle: 'Miami Dade College — Miami, Floride',
            meta: 'Juillet 2024',
          },
        ],
      },
      {
        heading: 'Certifications',
        items: [
          'Certification Microsoft PL-300 Data Analyst (en cours) — DataCamp',
          'Certification Google Data Analytics (en cours) — Coursera',
        ],
      },
      {
        heading: 'Expérience',
        entries: [
          {
            title: 'Conseiller de vente',
            subtitle: 'CVS Pharmacy — Miami, Floride',
            meta: '2021 – 2022',
            bullets: [
              'Participation à la gestion des stocks du magasin',
              'Accueil des clients en caisse à l’aide d’un logiciel propriétaire',
              'Prestation de services photo et communication avec la clientèle',
              'Traitement précis des paiements en espèces et par carte, avec équilibrage de la caisse',
              'Appui aux opérations en période de forte affluence par la coordination du réassort sur les rayons attribués',
            ],
          },
        ],
      },
    ],
  },

  es: {
    summary:
      'Estudiante de Analítica de Datos a punto de graduarse, con un Associate en Sistemas de Información y experiencia práctica en el uso de grandes modelos de lenguaje y plataformas en la nube para resolver problemas analíticos. Dominio de SQL, Azure Data Studio, Tableau, Power BI y R, con una base sólida en la limpieza y transformación de conjuntos de datos complejos para extraer conclusiones accionables. En busca de oportunidades en analítica de datos, inteligencia de negocio o funciones afines.',
    sections: [
      {
        heading: 'Competencias destacadas',
        items: [
          'SQL, MySQL, Power BI, Tableau',
          'Visualización de datos y análisis estadístico',
          'Python y R',
          'Aprendizaje automático (Python — scikit-learn)',
          'Microsoft Azure y Databricks',
          'Procesos ETL y transformación de datos',
          'Azure Data Studio',
          'Paquete Microsoft Office (Excel, Word, PowerPoint)',
          'Plataformas de datos en la nube (Azure, Databricks)',
          'Capacidad analítica y de resolución de problemas',
          'Comunicación',
          'Trabajo en equipo',
          'Narrativa de datos',
        ],
      },
      {
        heading: 'Formación',
        entries: [
          {
            title: 'Bachelor of Applied Science, Analítica de Datos',
            subtitle: 'Miami Dade College — Miami, Florida',
            meta: 'Agosto de 2026',
            bullets: [
              'Asignaturas relevantes: SQL, Tableau, Power BI, visualización de datos, lenguaje R, Databricks',
            ],
          },
          {
            title: 'Associate of Arts, Sistemas de Información',
            subtitle: 'Miami Dade College — Miami, Florida',
            meta: 'Julio de 2024',
          },
        ],
      },
      {
        heading: 'Certificaciones',
        items: [
          'Certificación Microsoft PL-300 Data Analyst (en curso) — DataCamp',
          'Certificación Google Data Analytics (en curso) — Coursera',
        ],
      },
      {
        heading: 'Experiencia',
        entries: [
          {
            title: 'Dependiente de tienda',
            subtitle: 'CVS Pharmacy — Miami, Florida',
            meta: '2021 – 2022',
            bullets: [
              'Colaboración en la gestión del inventario de la tienda',
              'Atención a clientes en caja mediante software propio',
              'Prestación de servicios de fotografía y comunicación con la clientela',
              'Procesamiento preciso de pagos en efectivo y con tarjeta, manteniendo el cuadre de caja',
              'Apoyo a las operaciones en horas punta coordinando la reposición de existencias en las secciones asignadas',
            ],
          },
        ],
      },
    ],
  },
}
