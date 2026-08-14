import type { RouteRecord } from 'vite-react-ssg'
import { LOCALES, PATH_SEGMENTS } from './i18n/locales'
import { getSlugs } from './content/projects'
import LocaleLayout from './layouts/LocaleLayout'
import RootRedirect from './pages/RootRedirect'
import Home from './pages/Home'
import ProjectsIndex from './pages/ProjectsIndex'
import About from './pages/About'
import Resume from './pages/Resume'
import ProjectDetail from './pages/ProjectDetail'
import Offline from './pages/Offline'

/**
 * Routes are generated explicitly per locale rather than via a `:locale` dynamic segment.
 *
 * This is deliberate: §5 requires *localized* path segments (/fr/projets, /es/proyectos),
 * so the children genuinely differ per locale and cannot be shared under one dynamic
 * parent. Explicit routes also give vite-react-ssg a complete, statically-known route
 * list to prerender without needing getStaticPaths for the locale level.
 */
export const routes: RouteRecord[] = [
  {
    path: '/',
    Component: RootRedirect,
    entry: 'src/pages/RootRedirect.tsx',
  },
  ...LOCALES.map(
    (locale): RouteRecord => ({
      path: `/${locale}`,
      element: <LocaleLayout locale={locale} />,
      entry: 'src/layouts/LocaleLayout.tsx',
      children: [
        {
          index: true,
          element: <Home locale={locale} />,
          entry: 'src/pages/Home.tsx',
        },
        {
          path: PATH_SEGMENTS.projects[locale],
          element: <ProjectsIndex locale={locale} />,
          entry: 'src/pages/ProjectsIndex.tsx',
        },
        {
          // Project detail. getStaticPaths returns this locale's slugs, which come from
          // that locale's frontmatter — so /fr/projets/readmissions-hospitalieres and
          // /es/proyectos/reingresos-hospitalarios are both prerendered as real pages.
          path: `${PATH_SEGMENTS.projects[locale]}/:slug`,
          element: <ProjectDetail locale={locale} />,
          entry: 'src/pages/ProjectDetail.tsx',
          getStaticPaths: () =>
            getSlugs(locale).map((slug) => `/${locale}/${PATH_SEGMENTS.projects[locale]}/${slug}`),
        },
        {
          path: PATH_SEGMENTS.about[locale],
          element: <About locale={locale} />,
          entry: 'src/pages/About.tsx',
        },
        {
          path: PATH_SEGMENTS.resume[locale],
          element: <Resume locale={locale} />,
          entry: 'src/pages/Resume.tsx',
        },
        {
          // Offline fallback, one per locale (§3). The path segment is intentionally
          // NOT localized: the service worker resolves it from the URL's locale prefix
          // alone, so it must be predictable from `/${locale}/offline/`.
          path: 'offline',
          element: <Offline locale={locale} />,
          entry: 'src/pages/Offline.tsx',
        },
      ],
    }),
  ),
]
