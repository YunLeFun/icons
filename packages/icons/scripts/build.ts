import type { IconifyJSON } from '@iconify/types'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { importDirectory } from '@iconify/tools'
import iconsConfig, { getIconColorStrategy } from '../../../icons.config'
import { optimizeSVG } from './svg'

interface SourceMetadata {
  name: string
  product: string
  variant: 'app-icon' | 'mark'
  category: 'application' | 'brand'
  style: 'color' | 'monotone'
  source: {
    repository: string
    path: string
    url: string
    sync: boolean
    derivation?: string
  }
}

const packageRoot = iconsConfig.paths.packageRoot
const svgDirectory = iconsConfig.paths.inputs.svgDirectory
const metadataPath = iconsConfig.paths.inputs.metadataFile
const outputPath = iconsConfig.paths.outputs.iconifyFile
const generatedPath = iconsConfig.paths.outputs.generatedSourceFile
const packagePath = resolve(packageRoot, 'package.json')

const [metadata, packageJSON] = await Promise.all([
  readFile(metadataPath, 'utf8').then(content => JSON.parse(content) as SourceMetadata[]),
  readFile(packagePath, 'utf8').then(content => JSON.parse(content) as Record<string, unknown>),
])
const metadataNames = metadata.map(item => item.name)

if (new Set(metadataNames).size !== metadataNames.length)
  throw new Error('metadata.json contains duplicate icon names')

for (const name of metadataNames) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(name))
    throw new Error(`Invalid icon name: ${name}`)
}

for (const [key, expectedValue] of Object.entries(iconsConfig.package)) {
  if (JSON.stringify(packageJSON[key]) !== JSON.stringify(expectedValue))
    throw new Error(`package.json field "${key}" does not match icons.config.ts`)
}

for (const icon of metadata) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(icon.product))
    throw new Error(`Invalid product name: ${icon.product}`)

  const expectedName = `${icon.product}-${icon.variant}`
  if (icon.name !== expectedName)
    throw new Error(`Invalid variant name ${icon.name}: expected ${expectedName}`)

  if (!iconsConfig.sources.repositories[icon.source.repository])
    throw new Error(`No source checkout configured for ${icon.source.repository}`)

  const expectedSourceUrl = `https://github.com/${icon.source.repository}/blob/main/${icon.source.path}`
  if (icon.source.url !== expectedSourceUrl)
    throw new Error(`Invalid source URL for ${icon.name}: expected ${expectedSourceUrl}`)

  if (!icon.source.sync && !icon.source.derivation)
    throw new Error(`Derived icon ${icon.name} must describe its derivation`)

  const colorStrategy = getIconColorStrategy(icon.name)
  if (icon.style === 'monotone' && colorStrategy.mode !== 'current-color')
    throw new Error(`Monotone icon ${icon.name} must use the current-color strategy`)
  if (icon.style === 'color' && colorStrategy.mode === 'current-color')
    throw new Error(`Color icon ${icon.name} cannot use the current-color strategy`)
}

const productVariants = new Map<string, Set<SourceMetadata['variant']>>()
const productCategories = new Map<string, SourceMetadata['category']>()

for (const icon of metadata) {
  const existingCategory = productCategories.get(icon.product)
  if (existingCategory && existingCategory !== icon.category)
    throw new Error(`Product ${icon.product} mixes icon categories`)

  productCategories.set(icon.product, icon.category)
  const variants = productVariants.get(icon.product) ?? new Set<SourceMetadata['variant']>()
  if (variants.has(icon.variant))
    throw new Error(`Product ${icon.product} contains duplicate ${icon.variant} variants`)

  variants.add(icon.variant)
  productVariants.set(icon.product, variants)
}

for (const [product, variants] of productVariants) {
  if (!variants.has('mark'))
    throw new Error(`Product ${product} must provide a mark variant`)

  if (productCategories.get(product) === 'application' && !variants.has('app-icon'))
    throw new Error(`Application ${product} must provide an app-icon variant`)
}

const iconSet = await importDirectory(svgDirectory, {
  prefix: iconsConfig.prefix,
  ignoreImportErrors: false,
  keepTitles: false,
})

iconSet.forEach((name, type) => {
  if (type !== 'icon')
    return

  const svg = iconSet.toSVG(name)
  if (!svg)
    throw new Error(`Unable to parse ${name}.svg`)

  optimizeSVG(svg, getIconColorStrategy(name))
  iconSet.fromSVG(name, svg)
})

const exported = iconSet.export()
const iconNames = Object.keys(exported.icons).sort()
const expectedNames = [...metadataNames].sort()

if (JSON.stringify(iconNames) !== JSON.stringify(expectedNames)) {
  throw new Error([
    'SVG files and metadata.json must contain the same icon names.',
    `SVG: ${iconNames.join(', ')}`,
    `Metadata: ${expectedNames.join(', ')}`,
  ].join('\n'))
}

const sortedIcons = Object.fromEntries(
  iconNames.map(name => [name, exported.icons[name]]),
)

const iconifyJSON: IconifyJSON = {
  ...exported,
  info: iconsConfig.collection,
  icons: sortedIcons,
}

const generatedSource = [
  '// Generated by scripts/build.ts. Do not edit.',
  "import type { IconifyJSON } from '@iconify/types'",
  '',
  `export const prefix = ${JSON.stringify(iconsConfig.prefix)} as const`,
  `export const iconNames = ${JSON.stringify(iconNames)} as const`,
  'export type IconName = typeof iconNames[number]',
  `export const iconsJSON = ${JSON.stringify(iconifyJSON)} as IconifyJSON`,
  `export const metadataJSON = ${JSON.stringify(metadata)} as const`,
  '',
].join('\n')

await mkdir(dirname(generatedPath), { recursive: true })
await Promise.all([
  writeFile(outputPath, `${JSON.stringify(iconifyJSON, null, 2)}\n`),
  writeFile(generatedPath, generatedSource),
])

console.log(`Built ${iconNames.length} icons with prefix \"${iconsConfig.prefix}\"`)
