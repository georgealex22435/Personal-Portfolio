/**
 * Renders page 1 of a PDF to a trimmed PNG.
 *
 * No ImageMagick or poppler on this machine, so this drives pdf.js inside the Chromium
 * Playwright already ships. The trim step matters for the EER diagram: MySQL Workbench
 * exports it onto a full page, so most of the PDF is empty white and an untrimmed render
 * would be a tiny diagram floating in a huge cover image.
 *
 * Usage: node scripts/pdf-to-png.mjs <input.pdf> <output.png> [scale]
 */
import { chromium } from 'playwright'
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const [input, output, scaleArg] = process.argv.slice(2)
if (!input || !output) {
  console.error('usage: node scripts/pdf-to-png.mjs <input.pdf> <output.png> [scale]')
  process.exit(1)
}
const scale = Number(scaleArg ?? 3)

const pdfBytes = readFileSync(resolve(input)).toString('base64')
const pdfWorker = readFileSync(
  resolve('node_modules/pdfjs-dist/build/pdf.worker.min.mjs'),
  'utf8',
)
const pdfLib = readFileSync(resolve('node_modules/pdfjs-dist/build/pdf.min.mjs'), 'utf8')

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1600, height: 1200 } })

page.on('console', (m) => {
  if (m.type() === 'error') console.error('  page error:', m.text())
})

await page.setContent('<canvas id="c"></canvas>')

const dataUrl = await page.evaluate(
  async ({ b64, scale, libSrc, workerSrc }) => {
    // pdfjs-dist 6.x ships ESM only — it never assigns window.pdfjsLib, so it has to be
    // dynamically imported from a blob URL rather than injected as a classic script.
    const lib = await import(
      URL.createObjectURL(new Blob([libSrc], { type: 'text/javascript' }))
    )
    lib.GlobalWorkerOptions.workerSrc = URL.createObjectURL(
      new Blob([workerSrc], { type: 'text/javascript' }),
    )

    const raw = atob(b64)
    const bytes = new Uint8Array(raw.length)
    for (let i = 0; i < raw.length; i += 1) bytes[i] = raw.charCodeAt(i)

    const pdf = await lib.getDocument({ data: bytes }).promise
    const pdfPage = await pdf.getPage(1)
    const viewport = pdfPage.getViewport({ scale })

    const canvas = document.getElementById('c')
    canvas.width = viewport.width
    canvas.height = viewport.height
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    await pdfPage.render({ canvasContext: ctx, viewport }).promise

    // Trim near-white margins.
    const { data, width, height } = ctx.getImageData(0, 0, canvas.width, canvas.height)
    let top = height
    let left = width
    let right = 0
    let bottom = 0
    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        const i = (y * width + x) * 4
        const isInk = data[i] < 244 || data[i + 1] < 244 || data[i + 2] < 244
        if (isInk) {
          if (y < top) top = y
          if (y > bottom) bottom = y
          if (x < left) left = x
          if (x > right) right = x
        }
      }
    }
    if (right <= left || bottom <= top) return canvas.toDataURL('image/png')

    const pad = Math.round(16 * scale)
    const cropX = Math.max(0, left - pad)
    const cropY = Math.max(0, top - pad)
    const cropW = Math.min(width - cropX, right - left + pad * 2)
    const cropH = Math.min(height - cropY, bottom - top + pad * 2)

    const out = document.createElement('canvas')
    out.width = cropW
    out.height = cropH
    const octx = out.getContext('2d')
    octx.fillStyle = '#ffffff'
    octx.fillRect(0, 0, cropW, cropH)
    octx.drawImage(canvas, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH)
    return out.toDataURL('image/png')
  },
  { b64: pdfBytes, scale, libSrc: pdfLib, workerSrc: pdfWorker },
)

await browser.close()

const buffer = Buffer.from(dataUrl.split(',')[1], 'base64')
writeFileSync(resolve(output), buffer)
console.log(`[pdf-to-png] ${output} — ${Math.round(buffer.length / 1024)} KB`)
