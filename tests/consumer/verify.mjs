import assert from 'node:assert/strict'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import process from 'node:process'
import { chromium } from '@playwright/test'
import { PNG } from 'pngjs'
import { preview } from 'vite'
import { checkBundles } from './check-bundles.mjs'

const project = resolve(import.meta.dirname, '../../.artifacts/consumer/project')
const output = resolve(project, '..', process.env.CONSUMER_CAPTURE ?? 'results')
await mkdir(output, { recursive: true })
const rows = JSON.parse(await readFile(resolve(project, 'generated/rows.json'), 'utf8'))
const failures = []
function check(ok, message) {
  if (!ok)
    failures.push(message)
}
const pixels = buffer => PNG.sync.read(buffer)
function difference(left, right) {
  assert.equal(left.width, right.width)
  assert.equal(left.height, right.height)
  let different = 0
  for (let index = 0; index < left.data.length; index += 4) {
    if ([0, 1, 2, 3].some(channel => Math.abs(left.data[index + channel] - right.data[index + channel]) > 20))
      different++
  }
  return different / (left.width * left.height)
}
async function captureGrid(page, filename, transparent = false) {
  const full = pixels(await page.screenshot({ path: filename, fullPage: true, omitBackground: transparent }))
  const bounds = await page.locator('.sample').evaluateAll(elements => elements.map((element) => {
    const rect = element.getBoundingClientRect()
    return { key: `${element.dataset.name}/${element.dataset.driver}/${element.dataset.copy}`, x: Math.round(rect.x + scrollX), y: Math.round(rect.y + scrollY), width: Math.round(rect.width), height: Math.round(rect.height) }
  }))
  return new Map(bounds.filter(rect => rect.width && rect.height).map((rect) => {
    const crop = new PNG({ width: rect.width, height: rect.height })
    PNG.bitblt(full, crop, rect.x, rect.y, rect.width, rect.height, 0, 0)
    return [rect.key, crop]
  }))
}
const server = await preview({ root: project, configFile: false, preview: { host: '127.0.0.1', port: 0, strictPort: true } })
let browser
const comparisons = []
try {
  browser = await chromium.launch({ headless: true })
  const page = await browser.newPage({ viewport: { width: 970, height: 900 }, deviceScaleFactor: 1 })
  page.on('pageerror', error => failures.push(`pageerror: ${error.message}`))
  page.on('console', (message) => {
    if (['error', 'warning'].includes(message.type()))
      failures.push(`console: ${message.text()}`)
  })
  await page.route('**/*', (route) => {
    const url = new URL(route.request().url())
    if (!['127.0.0.1', 'localhost'].includes(url.hostname)) {
      failures.push(`Unexpected network dependency: ${url}`)
      return route.abort()
    }
    return route.continue()
  })
  const address = server.httpServer.address()
  assert.ok(address && typeof address !== 'string')
  await page.goto(`http://127.0.0.1:${address.port}`, { waitUntil: 'networkidle' })
  await page.waitForFunction(() => [...document.querySelectorAll('[data-driver="react"], [data-driver="iconify"]')].every(element => element.querySelector('svg')))
  const grid = await captureGrid(page, resolve(output, 'all-icons.png'))
  assert.equal(grid.size, rows.reduce((total, row) => total + (row.component ? 10 : 6), 0), 'Some expected icon instances are absent')
  const sample = (name, driver, copy) => page.locator(`[data-name="${name}"][data-driver="${driver}"][data-copy="${copy}"]`)

  // Compare every real icon through both collection consumers; exported components use representatives.
  for (const row of rows) {
    for (const copy of [0, 1]) {
      const reference = grid.get(`${row.name}/reference/${copy}`)
      for (const driver of row.component ? ['uno', 'iconify', 'vue', 'react'] : ['uno', 'iconify']) {
        const actual = grid.get(`${row.name}/${driver}/${copy}`)
        let expected = reference
        if (row.unoMonochrome && driver === 'uno') {
          const element = sample(row.name, 'reference', copy)
          await element.locator('img').evaluate((image, source) => {
            image.src = source
          }, `/reference/${row.name}-uno-${copy}.svg`)
          await element.locator('img').evaluate(image => image.decode())
          expected = pixels(await element.screenshot())
          await element.locator('img').evaluate((image, source) => {
            image.src = source
          }, `/reference/${row.name}-${copy}.svg`)
        }
        const ratio = difference(expected, actual)
        comparisons.push({ name: row.name, driver, copy, difference: ratio, expectedMode: row.unoMonochrome && driver === 'uno' ? 'monochrome-mask' : 'original' })
        check(ratio < 0.01, `${row.name}/${driver}/${copy}: ${(ratio * 100).toFixed(2)}% pixels differ from isolated SVG`)
      }
    }
  }

  // Validate all fragment references against the owning SVG, as well as document-wide ID uniqueness.
  const references = await page.evaluate(() => {
    const errors = []
    const ids = [...document.querySelectorAll('[id]')].map(element => element.id)
    for (const id of new Set(ids)) {
      if (ids.filter(value => value === id).length > 1)
        errors.push(`duplicate id: ${id}`)
    }
    for (const svg of document.querySelectorAll('.sample svg')) {
      for (const element of svg.querySelectorAll('*')) {
        for (const attribute of element.attributes) {
          const targets = [...attribute.value.matchAll(/url\(["']?#([^)'"\s]+)["']?\)/g)].map(match => match[1])
          if (['href', 'xlink:href'].includes(attribute.name) && attribute.value.startsWith('#'))
            targets.push(attribute.value.slice(1))
          for (const id of targets) {
            const target = document.getElementById(id)
            if (!target || target.closest('svg') !== svg)
              errors.push(`${svg.parentElement.dataset.name}: ${attribute.name} resolves outside its SVG: ${id}`)
          }
        }
      }
    }
    return errors
  })
  failures.push(...references)

  // CSS color changes after mounting must update monochrome icons in every consumer.
  for (const driver of ['uno', 'iconify', 'vue', 'react']) {
    const first = sample('brand-mark', driver, 0)
    await first.evaluate(element => element.style.setProperty('color', '#0891b2'))
    const changed = pixels(await first.screenshot())
    check(difference(changed, grid.get(`brand-mark/${driver}/1`)) < 0.01, `${driver}: currentColor did not update after mounting`)
  }
  for (const driver of ['vue', 'react']) {
    const titled = sample('brand-mark', driver, 0).locator('svg')
    check(await titled.getAttribute('role') === 'img', `${driver}: titled component lost role`)
    check(await titled.locator('title').textContent() === 'brand-mark', `${driver}: title was not forwarded`)
    check(await sample('brand-mark', driver, 1).locator('svg').getAttribute('aria-hidden') === 'true', `${driver}: decorative component lost aria-hidden`)
  }

  // A duplicate can look correct until one definition changes. Poison the first copy and compare the second.
  const complex = rows.filter(row => row.component)
  const originals = new Map()
  for (const row of complex) {
    for (const driver of ['iconify', 'vue', 'react'])
      originals.set(`${row.name}/${driver}`, grid.get(`${row.name}/${driver}/1`))
  }
  await page.evaluate(() => {
    for (const svg of document.querySelectorAll('[data-copy="0"] svg')) {
      for (const stop of svg.querySelectorAll('stop'))
        stop.setAttribute('stop-color', '#ff00ff')
      for (const shape of svg.querySelectorAll('mask *, clipPath *'))
        shape.setAttribute('display', 'none')
    }
  })
  const poisoned = await captureGrid(page)
  // Compact evidence of repeated components after the isolation challenge.
  await page.addStyleTag({ content: '.row:not(.heading):not([data-row="advjs-studio-app-icon"]):not([data-row="drive-app-icon"]):not([data-row="home-mark"]):not([data-row="reference-probe"]) { display: none }' })
  await page.locator('main').screenshot({ path: resolve(output, 'id-isolation.png') })
  for (const row of complex.filter(row => ['advjs-studio-app-icon', 'drive-app-icon', 'home-mark', 'reference-probe'].includes(row.name))) {
    for (const driver of ['iconify', 'vue', 'react']) {
      const ratio = difference(originals.get(`${row.name}/${driver}`), poisoned.get(`${row.name}/${driver}/1`))
      check(ratio === 0, `${row.name}/${driver}: changing first instance polluted the second (${(ratio * 100).toFixed(2)}%)`)
    }
  }

  // Pixel alpha checks use the real browser output, with a transparent page and no checkerboard.
  await page.reload({ waitUntil: 'networkidle' })
  await page.waitForSelector('[data-driver="react"] svg')
  await page.addStyleTag({ content: ':root, body, .sample { background: transparent !important }' })
  const alphaGrid = await captureGrid(page, undefined, true)
  for (const row of rows) {
    const name = row.name
    for (const driver of row.component ? ['reference', 'uno', 'iconify', 'vue', 'react'] : ['reference', 'uno', 'iconify']) {
      const image = alphaGrid.get(`${name}/${driver}/1`)
      const alphas = [...image.data].filter((_value, index) => index % 4 === 3)
      check(alphas.some(alpha => alpha > 0), `${name}/${driver}: blank image`)
      if (name.endsWith('-mark'))
        check(alphas.filter(alpha => alpha === 0).length > 256, `${name}/${driver}: lost transparent canvas`)
      else if (name.endsWith('-app-icon'))
        check(alphas.every(alpha => alpha === 255), `${name}/${driver}: app icon has transparent canvas`)
    }
  }
  if (!process.env.CONSUMER_CAPTURE) {
    await checkBundles(project, output)
    const reference = alphaGrid.get('brand-mark/reference/1')
    for (const driver of ['uno', 'iconify', 'vue', 'react']) {
      await page.goto(`http://127.0.0.1:${address.port}/single/${driver}/`, { waitUntil: 'networkidle' })
      await page.waitForSelector(driver === 'uno' ? '#app span' : '#app svg')
      const actual = pixels(await page.locator('#app > :first-child').screenshot({ omitBackground: true }))
      check(difference(reference, actual) < 0.015, `${driver}: standalone single-icon build does not render correctly`)
    }
  }
  await writeFile(resolve(output, 'report.json'), JSON.stringify({ icons: rows.length - 1, componentRepresentatives: rows.filter(row => row.component).length - 1, comparisons, failures }, null, 2))
}
finally {
  await browser?.close()
  await new Promise((resolve, reject) => server.httpServer.close(error => error ? reject(error) : resolve()))
}
assert.equal(failures.length, 0, failures.join('\n'))
console.log(`Consumer rendering passed: ${comparisons.length} comparisons. Evidence: ${output}`)
