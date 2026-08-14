import { test, expect } from '@playwright/test'

/** Every prerendered route, with a string that must appear in the raw HTML. */
const ROUTES: { path: string; needle: string; lang: string }[] = [
  { path: '/en/', needle: 'Data analyst working across analytics', lang: 'en' },
  { path: '/fr/', needle: 'Analyste de données travaillant', lang: 'fr' },
  { path: '/es/', needle: 'Analista de datos con experiencia', lang: 'es' },
  { path: '/en/projects/', needle: 'Three branches, four projects.', lang: 'en' },
  { path: '/fr/projets/', needle: 'Trois branches, quatre projets.', lang: 'fr' },
  { path: '/es/proyectos/', needle: 'Tres ramas, cuatro proyectos.', lang: 'es' },
  { path: '/en/about/', needle: 'I started in Computer Science', lang: 'en' },
  { path: '/fr/a-propos/', needle: "J'ai commencé en informatique", lang: 'fr' },
  { path: '/es/sobre-mi/', needle: 'Empecé en Informática', lang: 'es' },
  { path: '/en/resume/', needle: 'Soon-to-graduate Data Analytics student', lang: 'en' },
  { path: '/en/projects/hospital-readmissions/', needle: 'Length of stay and medication count', lang: 'en' },
  { path: '/fr/projets/readmissions-hospitalieres/', needle: 'La durée du séjour', lang: 'fr' },
  { path: '/es/proyectos/reingresos-hospitalarios/', needle: 'La duración de la estancia', lang: 'es' },
]

test.describe('prerendered routes', () => {
  for (const route of ROUTES) {
    test(`${route.path} serves localized content in raw HTML`, async ({ request, page }) => {
      // §2 acceptance: the text must be in the response body itself, not injected by JS.
      const response = await request.get(route.path)
      expect(response.status()).toBe(200)
      const html = await response.text()
      expect(html).toContain(route.needle)
      expect(html).toMatch(new RegExp(`<html[^>]*lang="${route.lang}"`))
      // A default Vite SPA would ship this; prerendering means it must never appear.
      expect(html).not.toContain('<div id="root"></div>')

      await page.goto(route.path)
      await expect(page).toHaveTitle(/.+/)
    })
  }
})

test.describe('locale routing', () => {
  test('/ redirects by Accept-Language, server-side', async ({ playwright }) => {
    const cases: [string, string][] = [
      ['fr-FR,fr;q=0.9', '/fr/'],
      ['es-ES,es;q=0.9', '/es/'],
      ['de-DE,de;q=0.9', '/en/'],
      ['en-US', '/en/'],
    ]

    for (const [header, expected] of cases) {
      const ctx = await playwright.request.newContext({
        baseURL: 'http://127.0.0.1:8787',
        extraHTTPHeaders: { 'Accept-Language': header },
      })
      const response = await ctx.get('/', { maxRedirects: 0 })
      expect(response.status()).toBe(302)
      expect(response.headers()['location']).toBe(expected)
      await ctx.dispose()
    }
  })

  test('hreflang alternates use localized slugs and trailing slashes', async ({ request }) => {
    const html = await (await request.get('/fr/projets/')).text()
    expect(html).toContain('hreflang="en" href="https://portfolio.georgealex22435.workers.dev/en/projects/"')
    expect(html).toContain('hreflang="es" href="https://portfolio.georgealex22435.workers.dev/es/proyectos/"')
    expect(html).toContain('hreflang="x-default"')
  })

  test('language switcher navigates to the equivalent page, not the home page', async ({ page }) => {
    await page.goto('/en/projects/')
    await page.getByRole('link', { name: 'FR', exact: true }).click()
    await expect(page).toHaveURL(/\/fr\/projets\/$/)
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Projets')
  })
})

test.describe('stat line', () => {
  test('formats numbers per locale', async ({ page }) => {
    // §5 calls this out specifically — wrong separators look sloppy to a native reader.
    await page.goto('/en/projects/hospital-readmissions/')
    await expect(page.getByTestId('stat-value-encounters')).toHaveText('101,766')

    await page.goto('/fr/projets/readmissions-hospitalieres/')
    // French uses a narrow no-break space as the group separator.
    await expect(page.getByTestId('stat-value-encounters')).toHaveText(/101.766/)
    const fr = await page.getByTestId('stat-value-encounters').textContent()
    expect(fr).not.toContain(',')

    await page.goto('/es/proyectos/reingresos-hospitalarios/')
    await expect(page.getByTestId('stat-value-encounters')).toHaveText('101.766')
  })

  test('renders final values in the prerendered HTML, before any JS', async ({ request }) => {
    const html = await (await request.get('/en/projects/hospital-readmissions/')).text()
    expect(html).toContain('101,766')
  })
})

test.describe('editorial rules', () => {
  test('the profitability projection appears nowhere on the site', async ({ request }) => {
    // A deliberate credibility decision in the handover — worth a permanent guard.
    for (const path of [
      '/en/projects/imdb-genre-analysis/',
      '/fr/projets/analyse-genres-imdb/',
      '/es/proyectos/analisis-generos-imdb/',
      '/en/projects/',
      '/en/',
    ]) {
      const html = await (await request.get(path)).text()
      expect(html).not.toMatch(/15\s*[–-]\s*20%/)
      expect(html.toLowerCase()).not.toContain('profitability increase')
    }
  })

  test('the load-bearing grid lead-in is present in all locales', async ({ request }) => {
    expect(await (await request.get('/en/')).text()).toContain('Three branches, four projects.')
    expect(await (await request.get('/fr/')).text()).toContain('Trois branches, quatre projets.')
    expect(await (await request.get('/es/')).text()).toContain('Tres ramas, cuatro proyectos.')
  })

  test('Limitations paragraphs survive on both projects that carry them', async ({ request }) => {
    const imdb = await (await request.get('/en/projects/imdb-genre-analysis/')).text()
    expect(imdb).toContain('Limitations.')
    const satisfaction = await (await request.get('/en/projects/employee-satisfaction/')).text()
    expect(satisfaction).toContain('Limitations.')
  })

  test('cards lead with the question, not the finding', async ({ page }) => {
    // Owner decision: findings are too substantial to compress onto a card.
    await page.goto('/en/')
    await expect(page.getByRole('heading', { name: /What predicts a 30-day hospital readmission for diabetes/ })).toBeVisible()
    await expect(page.getByText('Length of stay and medication count are strongly')).toHaveCount(0)
  })
})
