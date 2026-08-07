import { describe, expect, it } from 'vitest'
import {
  defaultIconPreviewSettings,
  getIconPreviewTemplateStyle,
  iconPreviewTemplates,
  parseIconPreviewSettings,
} from '../.vitepress/components/icon-preview'

describe('icon preview settings', () => {
  it('describes the current Apple template canvas sizes', () => {
    expect(iconPreviewTemplates.map(template => [template.id, template.width, template.height])).toEqual([
      ['ios', 1024, 1024],
      ['watchos', 1088, 1088],
      ['visionos', 1024, 1024],
      ['tvos', 800, 480],
    ])
  })

  it('derives preview geometry from template data', () => {
    expect(getIconPreviewTemplateStyle(iconPreviewTemplates[3], 128)).toEqual({
      '--preview-icon-size': '128px',
      '--preview-template-ratio': '800 / 480',
      '--preview-stage-width': '184px',
      '--preview-mask-radius': '15%',
      '--preview-keyline-size': '48%',
    })
  })

  it('restores supported preview settings', () => {
    expect(parseIconPreviewSettings(JSON.stringify({
      template: 'watchos',
      size: 24,
      guides: true,
    }))).toEqual({
      template: 'watchos',
      size: 24,
      guides: true,
    })
  })

  it('falls back for malformed or unsupported settings', () => {
    expect(parseIconPreviewSettings('{')).toEqual(defaultIconPreviewSettings)
    expect(parseIconPreviewSettings(JSON.stringify({
      template: 'android',
      size: 1024,
      guides: 'yes',
    }))).toEqual(defaultIconPreviewSettings)
  })
})
