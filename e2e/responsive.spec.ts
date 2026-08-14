import { test, expect } from '@playwright/test'

/** §4 acceptance: clean at all eight widths, plus landscape phone. */
const WIDTHS = [320, 375, 414, 768, 834, 1024, 1280, 1920]
const PAGES = ['/en/', '/en/projects/', '/en/projects/hospital-readmissions/', '/fr/', '/es/cv/']

test.describe('responsive', () => {
  for (const width of WIDTHS) {
    test(`no horizontal scroll or overlap at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 })

      for (const path of PAGES) {
        await page.goto(path, { waitUntil: 'networkidle' })

        const overflow = await page.evaluate(() => ({
          scrollWidth: document.documentElement.scrollWidth,
          clientWidth: document.documentElement.clientWidth,
        }))
        expect(
          overflow.scrollWidth,
          `${path} at ${width}px scrolls horizontally`,
        ).toBeLessThanOrEqual(overflow.clientWidth + 1)

        // Nothing may spill outside the viewport either — a wide child inside an
        // overflow:hidden parent hides the symptom without fixing the layout.
        const spilling = await page.evaluate(() => {
          const vw = document.documentElement.clientWidth
          return [...document.querySelectorAll('main *')]
            .filter((el) => {
              const r = el.getBoundingClientRect()
              return r.width > 0 && (r.right > vw + 1 || r.left < -1)
            })
            .slice(0, 3)
            .map((el) => `${el.tagName.toLowerCase()}.${el.className}`)
        })
        expect(spilling, `${path} at ${width}px has elements outside the viewport`).toEqual([])
      }
    })
  }

  test('landscape phone (844×390) does not break', async ({ page }) => {
    await page.setViewportSize({ width: 844, height: 390 })
    await page.goto('/en/', { waitUntil: 'networkidle' })

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    )
    expect(overflow).toBe(false)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  })

  test('project grid column counts follow the spec', async ({ page }) => {
    // §4: 1 column ≤768px, 2 columns 768–1440px, 3 above.
    const columnsAt = async (width: number) => {
      await page.setViewportSize({ width, height: 900 })
      await page.goto('/en/projects/', { waitUntil: 'networkidle' })
      return page.evaluate(() => {
        const grid = document.querySelector('main ul[class*="grid"]') as HTMLElement
        return getComputedStyle(grid).gridTemplateColumns.split(' ').length
      })
    }

    expect(await columnsAt(375)).toBe(1)
    expect(await columnsAt(1024)).toBe(2)
    expect(await columnsAt(1500)).toBe(3)
  })

  test('stat line is 2×2 below 400px and a single row above', async ({ page }) => {
    const rowsAt = async (width: number) => {
      await page.setViewportSize({ width, height: 900 })
      await page.goto('/en/projects/hospital-readmissions/', { waitUntil: 'networkidle' })
      return page.evaluate(() => {
        const stats = [...document.querySelectorAll('[data-testid="stat-line"] > div')]
        return new Set(stats.map((s) => Math.round(s.getBoundingClientRect().top))).size
      })
    }

    expect(await rowsAt(360), '3 stats at 360px should wrap to 2 rows').toBe(2)
    expect(await rowsAt(768), '3 stats at 768px should be one row').toBe(1)
  })

  test('nav is a bottom bar on phone and a side rail on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto('/en/', { waitUntil: 'networkidle' })
    const phone = await page.locator('nav').first().boundingBox()
    expect(phone!.width).toBeGreaterThan(300)
    expect(phone!.y).toBeGreaterThan(600)

    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/en/', { waitUntil: 'networkidle' })
    const desktop = await page.locator('nav').first().boundingBox()
    expect(desktop!.x).toBe(0)
    expect(desktop!.height).toBeGreaterThanOrEqual(890)
    expect(desktop!.width).toBeLessThan(300)
  })

  test('touch targets meet the 44px minimum on phone', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto('/en/projects/', { waitUntil: 'networkidle' })

    const small = await page.$$eval('nav a, main button', (els) =>
      els
        .map((el) => ({ el: el.textContent?.trim() ?? '', r: el.getBoundingClientRect() }))
        .filter((x) => x.r.height > 0 && (x.r.height < 44 || x.r.width < 44))
        .map((x) => `${x.el} ${Math.round(x.r.width)}×${Math.round(x.r.height)}`),
    )
    expect(small).toEqual([])
  })
})
