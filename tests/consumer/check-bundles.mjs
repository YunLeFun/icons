import assert from 'node:assert/strict'
import { Buffer } from 'node:buffer'
import { readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

export async function checkBundles(project, output) {
  const reports = []
  for (const driver of ['uno', 'iconify', 'vue', 'react']) {
    const directory = resolve(project, 'dist/single', driver)
    const manifest = JSON.parse(await readFile(resolve(directory, 'modules.json'), 'utf8'))
    const modules = manifest.flatMap(item => Object.entries(item.modules)).filter(([, bytes]) => bytes > 0)
    const iconModules = modules.filter(([name]) => name.includes('/@yunlefun/icons/'))
    const componentModules = modules.filter(([name]) => name.includes('/generated/'))
    assert.ok(iconModules.every(([name]) => name.endsWith('/icons/brand-mark.json')), `${driver}: full collection leaked into runtime`)
    assert.ok(componentModules.every(([name]) => /\/YlfBrandMark\.(?:vue|tsx)/.test(name)), `${driver}: unrelated component included`)
    const iconBytes = [...iconModules, ...componentModules].reduce((total, [, size]) => total + size, 0)
    assert.ok(iconBytes < 5000, `${driver}: icon code exceeded 5 KB (framework runtime excluded)`)
    if (driver === 'iconify')
      assert.equal(iconModules.length, 1, 'Iconify must use exactly one packed icon data module')
    if (['vue', 'react'].includes(driver)) {
      assert.equal(iconModules.length, 0, `${driver}: downloaded component depends on the icon package`)
      assert.ok(componentModules.length > 0, `${driver}: component is absent`)
    }
    const files = await Promise.all(manifest.map(item => readFile(resolve(directory, item.file), 'utf8')))
    if (driver === 'uno') {
      const css = files.filter((_content, index) => manifest[index].file.endsWith('.css')).join('\n')
      assert.deepEqual([...new Set(css.match(/\.i-ylf-[\w-]+/g))], ['.i-ylf-brand-mark'])
      assert.match(css, /data:image\/svg\+xml/)
      assert.ok(Buffer.byteLength(css) < 5000, 'Single-icon CSS exceeded 5 KB')
      assert.equal(iconModules.length, 0)
    }
    reports.push({ driver, totalBytes: manifest.reduce((sum, item) => sum + item.bytes, 0), iconBytes, iconModules, componentModules })
  }
  await writeFile(resolve(output, 'bundles.json'), JSON.stringify(reports, null, 2))
  return reports
}
