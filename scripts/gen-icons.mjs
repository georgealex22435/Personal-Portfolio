/**
 * Generates the PWA icon set — handover §3.
 *
 * Needs 192, 512, a 512 maskable with safe-zone padding, and a 180 apple-touch icon
 * (iOS ignores manifest icons entirely). Drawn on canvas in the Chromium Playwright
 * already ships, so this adds no image-processing dependency.
 *
 * The mark is the "AS" monogram in Archivo Condensed on the rail blue, matching the
 * site's own wordmark.
 */
import { chromium } from 'playwright'
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const outDir = resolve(root, 'public/icons')
mkdirSync(outDir, { recursive: true })

const fontData = readFileSync(
  resolve(root, 'node_modules/@fontsource-variable/archivo/files/archivo-latin-wdth-normal.woff2'),
).toString('base64')

const RAIL = '#1F3FD6'
const WHITE = '#FFFFFF'

/**
 * `inset` is the fraction of the canvas kept clear of the mark. Maskable icons get 20%
 * because Android crops them to arbitrary shapes — a circle mask on a full-bleed mark
 * would clip the letterforms.
 */
const ICONS = [
  { file: 'icon-192.png', size: 192, inset: 0.12, bleed: true },
  { file: 'icon-512.png', size: 512, inset: 0.12, bleed: true },
  { file: 'icon-512-maskable.png', size: 512, inset: 0.2, bleed: true },
  { file: 'apple-touch-icon.png', size: 180, inset: 0.12, bleed: true },
]

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 512, height: 512 } })

await page.setContent(`<canvas id="c"></canvas>`)
await page.evaluate(async (font) => {
  const face = new FontFace(
    'ArchivoIcon',
    `url(data:font/woff2;base64,${font}) format('woff2-variations')`,
    { weight: '100 900', stretch: '62% 125%' },
  )
  await face.load()
  document.fonts.add(face)
  await document.fonts.ready
}, fontData)

for (const icon of ICONS) {
  const dataUrl = await page.evaluate(
    ({ size, inset, rail, white }) => {
      const canvas = document.getElementById('c')
      canvas.width = size
      canvas.height = size
      const ctx = canvas.getContext('2d')

      ctx.fillStyle = rail
      ctx.fillRect(0, 0, size, size)

      const safe = size * (1 - inset * 2)
      ctx.fillStyle = white
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.font = `700 ${Math.round(safe * 0.62)}px ArchivoIcon`
      // Canvas has no font-stretch property, so the condensed axis is applied by
      // scaling horizontally around the centre instead.
      ctx.save()
      ctx.translate(size / 2, size / 2)
      ctx.scale(0.82, 1)
      ctx.fillText('AS', 0, size * 0.02)
      ctx.restore()

      return canvas.toDataURL('image/png')
    },
    { size: icon.size, inset: icon.inset, rail: RAIL, white: WHITE },
  )

  const buffer = Buffer.from(dataUrl.split(',')[1], 'base64')
  writeFileSync(resolve(outDir, icon.file), buffer)
  console.log(`[gen-icons] ${icon.file} — ${icon.size}px, ${Math.round(buffer.length / 1024)} KB`)
}

// Favicon as SVG: sharp at every size, and one fewer raster to keep in sync.
writeFileSync(
  resolve(root, 'public/favicon.svg'),
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">` +
    `<rect width="64" height="64" fill="${RAIL}"/>` +
    `<text x="32" y="34" font-family="Arial Narrow, Arial, sans-serif" font-size="34" font-weight="700"` +
    ` fill="${WHITE}" text-anchor="middle" dominant-baseline="central" transform="scale(0.85 1) translate(5.6 0)">AS</text>` +
    `</svg>\n`,
  'utf8',
)
console.log('[gen-icons] favicon.svg')

await browser.close()
