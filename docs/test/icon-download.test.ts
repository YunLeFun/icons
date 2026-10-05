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
    const drive = createSvgSource('drive-app-icon')

    expect(brand).toContain('width="100" height="70" viewBox="0 0 100 70"')
    expect(brand).toContain('currentColor')
    expect(drive).toContain('id="ylf-drive-app-icon-svgID0"')
    expect(drive).toContain('url(#ylf-drive-app-icon-svgID0)')
    expect(drive).not.toContain('url(#svgID0)')
  })

  it('creates a Vue component with sizing and accessible title props', () => {
    const source = createVueComponentSource('drive-app-icon')

    expect(source).toContain("defineOptions({ name: 'YlfDriveAppIcon', inheritAttrs: false })")
    expect(source).toContain(':width="size"')
    expect(source).toContain('<title v-if="title">{{ title }}</title>')
    expect(source).toContain('viewBox="0 0 64 64"')
    expect(source).toContain("import { useId } from 'vue'")
    expect(source).toContain(':id="`${id}-ylf-drive-app-icon-svgID0`"')
    expect(source).toContain(':fill="`url(#${id}-ylf-drive-app-icon-svgID0)`"')
  })

  it('creates valid React-style SVG attributes', () => {
    const source = createReactComponentSource('drive-app-icon')
    const strokedSource = createReactComponentSource('smap-app-icon')

    expect(source).toContain("import type { SVGProps } from 'react'")
    expect(source).toContain('fillRule="evenodd"')
    expect(source).toContain('stopColor=')
    expect(source).toContain("import { useId } from 'react'")
    expect(source).toContain('id={`${id}-ylf-drive-app-icon-svgID0`}')
    expect(source).toContain('fill={`url(#${id}-ylf-drive-app-icon-svgID0)`}')
    expect(source).not.toContain('fill-rule=')
    expect(strokedSource).toContain('strokeLinecap="round"')
    expect(strokedSource).not.toContain('stroke-linecap=')
  })

  it('keeps simple components free of unnecessary ID hooks', () => {
    expect(createVueComponentSource('brand-mark')).not.toContain('useId')
    expect(createReactComponentSource('brand-mark')).not.toContain('useId')
  })

  it('uses stable filenames for every download format', () => {
    expect(createIconAsset('brand-mark', 'svg').filename).toBe('brand-mark.svg')
    expect(createIconAsset('brand-mark', 'vue').filename).toBe('YlfBrandMark.vue')
    expect(createIconAsset('brand-mark', 'react').filename).toBe('YlfBrandMark.tsx')
  })
})
