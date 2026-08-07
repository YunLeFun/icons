import type { IconColorStrategy } from '../../../icons.config'
import { readFile, writeFile } from 'node:fs/promises'
import { isAbsolute, relative, resolve } from 'node:path'
import iconsConfig, { getIconColorStrategy } from '../../../icons.config'
import { createOptimizedSVG } from './svg'

interface SourceMetadata {
  name: string
  source: {
    repository: string
    path: string
    url: string
  }
}

interface CollectedIcon {
  name: string
  targetPath: string
  content: string
  changed: boolean
}

const args = new Set(process.argv.slice(2))
const supportedArgs = new Set(['--check'])
const unknownArgs = [...args].filter(arg => !supportedArgs.has(arg))

if (unknownArgs.length)
  throw new Error(`Unknown arguments: ${unknownArgs.join(', ')}`)

const checkOnly = args.has('--check')
const metadata = JSON.parse(
  await readFile(iconsConfig.paths.inputs.metadataFile, 'utf8'),
) as SourceMetadata[]

function resolveSourcePath(icon: SourceMetadata): string {
  const checkoutDirectory = iconsConfig.sources.repositories[icon.source.repository]
  if (!checkoutDirectory) {
    throw new Error([
      `No checkout is configured for ${icon.source.repository}.`,
      `Add it to icons.config.ts before collecting ${icon.name}.`,
    ].join(' '))
  }

  const checkoutRoot = resolve(iconsConfig.sources.repositoriesRoot, checkoutDirectory)
  const sourcePath = resolve(checkoutRoot, icon.source.path)
  const relativeSourcePath = relative(checkoutRoot, sourcePath)

  if (isAbsolute(relativeSourcePath) || relativeSourcePath.startsWith('..'))
    throw new Error(`Source path escapes its checkout for ${icon.name}: ${icon.source.path}`)

  return sourcePath
}

async function readCanonicalIcon(path: string): Promise<string | undefined> {
  try {
    return await readFile(path, 'utf8')
  }
  catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT')
      return undefined

    throw error
  }
}

function normalize(content: string, strategy: IconColorStrategy): string {
  return createOptimizedSVG(content, strategy).toMinifiedString()
}

const collected = await Promise.all(metadata.map(async (icon): Promise<CollectedIcon> => {
  const sourcePath = resolveSourcePath(icon)
  const targetPath = resolve(iconsConfig.paths.inputs.svgDirectory, `${icon.name}.svg`)
  const colorStrategy = getIconColorStrategy(icon.name)
  const [sourceContent, targetContent] = await Promise.all([
    readFile(sourcePath, 'utf8'),
    readCanonicalIcon(targetPath),
  ])
  const normalizedSource = normalize(sourceContent, colorStrategy)
  const normalizedTarget = targetContent === undefined
    ? undefined
    : normalize(targetContent, colorStrategy)

  return {
    name: icon.name,
    targetPath,
    content: `${createOptimizedSVG(sourceContent, colorStrategy).toPrettyString()}\n`,
    changed: normalizedSource !== normalizedTarget,
  }
}))

const changedIcons = collected.filter(icon => icon.changed)

if (!changedIcons.length) {
  console.log(`All ${collected.length} collected icons are up to date`)
}
else if (checkOnly) {
  throw new Error([
    `Collected icons are out of date: ${changedIcons.map(icon => icon.name).join(', ')}`,
    'Run pnpm icons:collect to update the canonical SVG snapshots.',
  ].join('\n'))
}
else {
  await Promise.all(changedIcons.map(icon => writeFile(icon.targetPath, icon.content)))
  console.log(`Collected ${changedIcons.length} updated icons: ${changedIcons.map(icon => icon.name).join(', ')}`)
}
