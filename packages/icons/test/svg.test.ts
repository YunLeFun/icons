import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { createOptimizedSVG } from '../scripts/svg'
import metadata from '../metadata.json' with { type: 'json' }

describe('SVG color strategies', () => {
  it('preserves application colors', () => {
    const svg = createOptimizedSVG(
      '<svg viewBox="0 0 24 24"><path fill="#123456" d="M0 0h24v24H0z"/></svg>',
      { mode: 'preserve' },
    )

    expect(svg.getBody()).toContain('#123456')
  })

  it('converts monotone colors to currentColor', () => {
    const svg = createOptimizedSVG(
      '<svg viewBox="0 0 24 24"><path fill="#123456" d="M0 0h24v24H0z"/></svg>',
      { mode: 'current-color' },
    )

    expect(svg.getBody()).toContain('currentColor')
    expect(svg.getBody()).not.toContain('#123456')
  })

  it('resolves inherited source colors without changing white details', () => {
    const svg = createOptimizedSVG(
      '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M0 0h24v24H0z"/><path fill="white" d="M8 8h8v8H8z"/></svg>',
      { mode: 'replace-current-color', color: '#0078E7' },
    )

    expect(svg.getBody()).toContain('#0078e7')
    expect(svg.getBody()).toContain('#fff')
  })
})

describe('application icon canvases', () => {
  it('keeps the CMS app icon artwork inside a symmetric safe area', async () => {
    const content = await readFile(resolve(import.meta.dirname, '../svg/cms-app-icon.svg'), 'utf8')
    const transform = content.match(/matrix\(([\d.]+) 0 0 ([\d.]+) ([\d.]+) ([\d.]+)\)/)

    expect(transform).not.toBeNull()
    expect(transform?.slice(1).map(Number)).toEqual([0.86, 0.86, 4.48, 4.48])
  })

  it('uses full square backgrounds without precomposed corner masks', async () => {
    const appIcons = metadata.filter(icon => icon.variant === 'app-icon')

    for (const icon of appIcons) {
      const content = await readFile(resolve(import.meta.dirname, `../svg/${icon.name}.svg`), 'utf8')
      const viewBox = content.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/)
      expect(viewBox, `${icon.name} must use an origin-aligned viewBox`).not.toBeNull()

      const [, width, height] = viewBox ?? []
      expect(width).toBe(height)

      const fullRect = content.match(new RegExp(`<rect[^>]*width="${width}"[^>]*height="${height}"[^>]*>`))
      const fullPath = content.includes(`M0 0h${width}v${height}H0z`)
      expect(Boolean(fullRect || fullPath), `${icon.name} must paint the full square canvas`).toBe(true)

      if (fullRect)
        expect(fullRect[0], `${icon.name} must leave corner masking to the platform`).not.toMatch(/\srx=/)
    }
  })
})
