import assert from 'node:assert/strict'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { iconNames, icons } from '@yunlefun/icons'
import collection from '@yunlefun/icons/icons.json' with { type: 'json' }
import metadata from '@yunlefun/icons/metadata.json' with { type: 'json' }
import { createIconAsset } from './icon-download.ts'

// Real examples: radial/linear gradients + filters, masks, strokes, mixed/fixed/currentColor.
const representatives = ['advjs-studio-app-icon', 'advjs-mark', 'drive-app-icon', 'home-mark', 'smap-app-icon', 'brand-mark', 'design-mark', 'go-far-away-mark']
assert.deepEqual([...iconNames], Object.keys(collection.icons).sort())
assert.deepEqual([...iconNames], metadata.map(icon => icon.name).sort())
for (const name of iconNames) {
  const canonical = await readFile(new URL(import.meta.resolve(`@yunlefun/icons/svg/${name}.svg`)), 'utf8')
  const extensionless = await readFile(new URL(import.meta.resolve(`@yunlefun/icons/svg/${name}`)), 'utf8')
  assert.equal(canonical, extensionless)
  assert.match(canonical, /<svg\b/)
  const single = (await import(`@yunlefun/icons/icons/${name}`, { with: { type: 'json' } })).default
  assert.deepEqual(single, { ...collection.icons[name], width: collection.icons[name].width ?? collection.width ?? 16, height: collection.icons[name].height ?? collection.height ?? 16 })
}
// The current optimized collection has no clipPath/use; this non-published probe keeps those paths exercised.
const probe = {
  width: 64,
  height: 64,
  body: '<defs><linearGradient id="paint"><stop stop-color="#08f"/><stop offset="1" stop-color="#f80"/></linearGradient><linearGradient id="linked" href="#paint"/><clipPath id="clip"><circle cx="32" cy="32" r="24"/></clipPath><path id="shape" d="M0 0h64v64H0z"/></defs><use href="#shape" fill="url(#linked)" clip-path="url(#clip)"/>',
}
icons.icons['reference-probe'] = probe
representatives.push('reference-probe')
await mkdir('generated', { recursive: true })
await mkdir('public/reference', { recursive: true })
const rows = []
const vueImports = []
const reactImports = []
const vueEntries = []
const reactEntries = []
for (const name of [...iconNames, 'reference-probe']) {
  const icon = icons.icons[name]
  const width = icon.width ?? icons.width ?? 16
  const height = icon.height ?? icons.height ?? 16
  const component = representatives.includes(name)
  const unoMonochrome = name === 'go-far-away-mark'
  rows.push({ name, width, height, component, currentColor: icon.body.includes('currentColor'), unoMonochrome })
  // Independent reference: packed Iconify data rendered as an isolated SVG image.
  for (const [index, color] of ['#c026d3', '#0891b2'].entries()) {
    await writeFile(`public/reference/${name}-${index}.svg`, `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 ${width} ${height}" color="${color}">${icon.body}</svg>`)
    if (unoMonochrome) {
      await writeFile(`public/reference/${name}-uno-${index}.svg`, `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 ${width} ${height}" color="${color}"><defs><mask id="monochrome" mask-type="alpha">${icon.body}</mask></defs><rect width="${width}" height="${height}" fill="currentColor" mask="url(#monochrome)"/></svg>`)
    }
  }
  if (component) {
    const vue = createIconAsset(name, 'vue')
    const react = createIconAsset(name, 'react')
    await writeFile(`generated/${vue.filename}`, vue.content)
    await writeFile(`generated/${react.filename}`, react.content)
    const identifier = vue.filename.slice(0, -4)
    vueImports.push(`import ${identifier} from './${vue.filename}'`)
    reactImports.push(`import ${identifier} from './${react.filename.slice(0, -4)}'`)
    vueEntries.push(`'${name}': ${identifier}`)
    reactEntries.push(`'${name}': ${identifier}`)
  }
}
await writeFile('generated/vue.ts', `import type { Component } from 'vue'\n${vueImports.join('\n')}\nexport default { ${vueEntries.join(', ')} } as Record<string, Component>\n`)
await writeFile('generated/react.ts', `import type { ComponentType, SVGProps } from 'react'\n${reactImports.join('\n')}\nexport default { ${reactEntries.join(', ')} } as Record<string, ComponentType<SVGProps<SVGSVGElement> & { size?: number, title?: string }>>\n`)
await writeFile('generated/rows.json', JSON.stringify(rows))
await writeFile('generated/probe.json', JSON.stringify(probe))
