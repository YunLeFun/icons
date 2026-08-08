import { describe, expect, it } from 'vitest'
import {
  createIconAsset,
  createReactComponentSource,
  createSvgSource,
  createVueComponentSource,
} from '../.vitepress/components/icon-download'

describe('icon downloads', () => {
  it('creates standalone SVG with canonical dimensions and safe ids', () => {
    const brand = createSvgSource('brand-mark')
    const drive = createSvgSource('drive-mark')

    expect(brand).toContain('width="100" height="70" viewBox="0 0 100 70"')
    expect(brand).toContain('currentColor')
    expect(drive).toContain('id="ylf-drive-mark-svgID0"')
    expect(drive).toContain('url(#ylf-drive-mark-svgID0)')
    expect(drive).not.toContain('url(#svgID0)')
  })

  it('creates a Vue component with sizing and accessible title props', () => {
    const source = createVueComponentSource('drive-app-icon')

    expect(source).toContain("defineOptions({ name: 'YlfDriveAppIcon', inheritAttrs: false })")
    expect(source).toContain(':width="size"')
    expect(source).toContain('<title v-if="title">{{ title }}</title>')
    expect(source).toContain('viewBox="0 0 64 64"')
  })

  it('creates valid React-style SVG attributes', () => {
    const source = createReactComponentSource('drive-app-icon')

    expect(source).toContain("import type { SVGProps } from 'react'")
    expect(source).toContain('maskType="luminance"')
    expect(source).toContain('strokeLinecap="round"')
    expect(source).not.toContain('stroke-linecap=')
  })

  it('uses stable filenames for every download format', () => {
    expect(createIconAsset('brand-mark', 'svg').filename).toBe('brand-mark.svg')
    expect(createIconAsset('brand-mark', 'vue').filename).toBe('YlfBrandMark.vue')
    expect(createIconAsset('brand-mark', 'react').filename).toBe('YlfBrandMark.tsx')
  })
})
