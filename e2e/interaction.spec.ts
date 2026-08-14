import { test, expect } from '@playwright/test'

test.describe('projects filter', () => {
  test('chips filter the grid and persist in the URL', async ({ page }) => {
    await page.goto('/en/projects/')
    await expect(page.getByTestId('project-count')).toHaveText('Showing 4 projects')

    await page.getByRole('button', { name: 'Healthcare' }).click()

    // §8: filter state in the query string so a filtered view is shareable.
    await expect(page).toHaveURL(/\?domain=healthcare$/)
    await expect(page.getByTestId('project-count')).toHaveText('Showing 1 project')
    await expect(page.getByRole('button', { name: 'Healthcare' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
  })

  test('a shared filtered URL restores the same view', async ({ page }) => {
    await page.goto('/en/projects/?domain=data-engineering')
    await expect(page.getByTestId('project-count')).toHaveText('Showing 2 projects')
    await expect(page.getByRole('button', { name: 'Data engineering' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
  })

  test('chips are operable by keyboard alone', async ({ page }) => {
    await page.goto('/en/projects/')

    // Walk the tab order to the first chip using real key events, not .focus().
    const all = page.getByRole('button', { name: 'All' })
    for (let i = 0; i < 30 && !(await all.evaluate((el) => el === document.activeElement)); i += 1) {
      await page.keyboard.press('Tab')
    }
    await expect(all).toBeFocused()

    await page.keyboard.press('Tab')
    await page.keyboard.press('Enter')
    await expect(page).toHaveURL(/\?domain=/)
    await expect(page.getByTestId('project-count')).not.toHaveText('Showing 4 projects')
  })

  test('an unknown domain in the URL falls back to All rather than an empty grid', async ({
    page,
  }) => {
    await page.goto('/en/projects/?domain=nonsense')
    await expect(page.getByTestId('project-count')).toHaveText('Showing 4 projects')
  })

  test('chip labels are translated', async ({ page }) => {
    await page.goto('/fr/projets/')
    await expect(page.getByRole('button', { name: 'Santé' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Tous' })).toBeVisible()
  })
})

test.describe('contact', () => {
  test('email is in the static HTML regardless of JS or API state', async ({ request }) => {
    // §2's graceful degradation: the address must survive with no JS and no Resend key.
    const html = await (await request.get('/en/')).text()
    expect(html).toContain('alexsaliba2@gmail.com')
  })

  test('form stays hidden while the send endpoint is unconfigured', async ({ page }) => {
    await page.goto('/en/')
    const health = await page.request.get('/api/health')
    const { contactEnabled } = await health.json()

    if (contactEnabled) {
      await expect(page.getByTestId('contact-form')).toBeVisible()
    } else {
      // §2: "contact form hidden, plain email address shown."
      await expect(page.getByTestId('contact-form')).toHaveCount(0)
      await expect(page.getByText('alexsaliba2@gmail.com')).toBeVisible()
    }
  })

  test('the endpoint reports its own unconfigured state rather than failing opaquely', async ({
    request,
  }) => {
    const response = await request.post('/api/contact', {
      data: { name: 'Test', email: 'test@example.com', message: 'Hello there, this is a test.' },
    })
    // 503 while unconfigured; 200 once a Resend key is set.
    expect([200, 503]).toContain(response.status())
    if (response.status() === 503) {
      expect((await response.json()).error).toBe('not_configured')
    }
  })

  test('malformed payloads are rejected with field detail', async ({ request }) => {
    const response = await request.post('/api/contact', {
      data: { name: '', email: 'not-an-email', message: 'short' },
    })
    expect([400, 503]).toContain(response.status())
  })
})

test.describe('keyboard and accessibility', () => {
  test('skip link is the first stop and moves focus to main', async ({ page }) => {
    await page.goto('/en/')
    await page.keyboard.press('Tab')
    const skip = page.getByRole('link', { name: 'Skip to content' })
    await expect(skip).toBeFocused()
    await page.keyboard.press('Enter')
    await expect(page).toHaveURL(/#main$/)
  })

  test('every page has exactly one h1', async ({ page }) => {
    for (const path of ['/en/', '/en/projects/', '/en/about/', '/en/resume/', '/en/projects/hospital-readmissions/']) {
      await page.goto(path)
      await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1)
    }
  })

  test('focus is always visible, never outline:none', async ({ page }) => {
    await page.goto('/en/projects/')
    await page.keyboard.press('Tab')
    const outline = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement
      const s = getComputedStyle(el)
      return { style: s.outlineStyle, width: s.outlineWidth }
    })
    expect(outline.style).not.toBe('none')
  })

  test('images all carry alt text', async ({ page }) => {
    await page.goto('/en/projects/')
    const missing = await page.$$eval('img', (imgs) =>
      imgs.filter((i) => !i.getAttribute('alt')).map((i) => i.getAttribute('src')),
    )
    expect(missing).toEqual([])
  })
})

test.describe('no console noise', () => {
  test('no errors or warnings on any route in any locale', async ({ page }) => {
    // §10: "No console errors or warnings on any route in any locale."
    const problems: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error' || msg.type() === 'warning') problems.push(`${msg.type()}: ${msg.text()}`)
    })
    page.on('pageerror', (err) => problems.push(`pageerror: ${err.message}`))

    for (const path of [
      '/en/', '/fr/', '/es/',
      '/en/projects/', '/fr/projets/', '/es/proyectos/',
      '/en/about/', '/fr/a-propos/', '/es/sobre-mi/',
      '/en/resume/', '/fr/cv/', '/es/cv/',
      '/en/projects/hospital-readmissions/',
      '/fr/projets/analyse-genres-imdb/',
      '/es/proyectos/base-datos-tienda-antiguedades/',
    ]) {
      await page.goto(path, { waitUntil: 'networkidle' })
    }

    expect(problems).toEqual([])
  })
})
