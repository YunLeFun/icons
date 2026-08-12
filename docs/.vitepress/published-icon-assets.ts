import { copyFile, mkdir, readdir } from 'node:fs/promises'
import { join } from 'node:path'

const canonicalIconName = /^([a-z0-9]+(?:-[a-z0-9]+)*)-(app-icon|mark)\.svg$/

export async function publishCanonicalIconAssets(
  sourceDirectory: string,
  outputDirectory: string,
): Promise<void> {
  const entries = await readdir(sourceDirectory, { withFileTypes: true })
  for (const entry of entries) {
    if (!entry.isFile())
      continue
    const match = canonicalIconName.exec(entry.name)
    if (!match)
      continue
    const [, product, variant] = match
    const productDirectory = join(outputDirectory, 'products', product!)
    await mkdir(productDirectory, { recursive: true })
    await copyFile(
      join(sourceDirectory, entry.name),
      join(productDirectory, `${variant}.svg`),
    )
  }
}
