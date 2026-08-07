import { describe, expect, it } from 'vitest'
import {
  defaultIconPreviewSettings,
  getIconPreviewTemplateStyle,
  iconPreviewTemplates,
  parseIconPreviewSettings,
} from '../.vitepress/components/icon-preview'

describe('icon preview settings', () => {
  it('defaults to a 128px iOS platform inspection', () => {
    expect(defaultIconPreviewSettings).toEqual({
      mode: 'platform',
      template: 'ios',
      size: 128,
      guides: false,
    })
  })

  it('describes the current Apple template canvas sizes', () => {
    expect(iconPreviewTemplates.map(template => [template.id, template.width, template.height])).toEqual([
      ['ios', 1024, 1024],
      ['watchos', 1088, 1088],
      ['visionos', 1024, 1024],
      ['tvos', 800, 480],
    ])
  })

  it('derives preview geometry from template data', () => {
    expect(getIconPreviewTemplateStyle('platform', iconPreviewTemplates[3], 128)).toEqual({
      '--preview-canvas-width': '128px',
      '--preview-canvas-height': '76.8px',
      '--preview-icon-size': '128px',
      '--preview-stage-width': '152px',
      '--preview-mask-radius': '15%',
      '--preview-keyline-size': '48%',
    })

    expect(getIconPreviewTemplateStyle('app-icon', iconPreviewTemplates[3], 64)).toMatchObject({
      '--preview-canvas-width': '64px',
      '--preview-canvas-height': '64px',
      '--preview-mask-radius': '0',
      '--preview-keyline-size': '80%',
    })
  })

  it('restores supported preview settings', () => {
    expect(parseIconPreviewSettings(JSON.stringify({
      mode: 'platform',
      template: 'watchos',
      size: 24,
      guides: true,
    }))).toEqual({
      mode: 'platform',
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
