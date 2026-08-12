import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { publishCanonicalIconAssets } from '../.vitepress/published-icon-assets'

describe('published icon assets', () => {
  it('publishes canonical variants at stable product URLs', async () => {
    const root = await mkdtemp(join(tmpdir(), 'yunlefun-icons-'))
    try {
      const sourceDirectory = join(root, 'svg')
      const outputDirectory = join(root, 'dist')
      await mkdir(sourceDirectory, { recursive: true })
      await writeFile(join(sourceDirectory, 'fc-mark.svg'), '<svg id="fc"/>')
      await writeFile(join(sourceDirectory, 'smap-app-icon.svg'), '<svg id="smap"/>')
      await writeFile(join(sourceDirectory, 'notes.txt'), 'not an icon')

      await publishCanonicalIconAssets(sourceDirectory, outputDirectory)

      await expect(readFile(join(outputDirectory, 'products/fc/mark.svg'), 'utf8'))
        .resolves.toBe('<svg id="fc"/>')
      await expect(readFile(join(outputDirectory, 'products/smap/app-icon.svg'), 'utf8'))
        .resolves.toBe('<svg id="smap"/>')
    }
    finally {
      await rm(root, { force: true, recursive: true })
    }
  })

  it('serves product assets with the SVG media type', async () => {
    const headers = await readFile(resolve(import.meta.dirname, '../public/_headers'), 'utf8')

    expect(headers).toMatch(/\/products\/\*[\s\S]*?Content-Type: image\/svg\+xml/)
  })
})
