export const iconPreviewTemplates = [
  {
    id: 'ios',
    label: 'iOS / iPadOS / macOS',
    shortLabel: 'iOS family',
    width: 1024,
    height: 1024,
    mask: 'rounded-square',
    maskRadius: '22%',
    keylineSize: '80%',
  },
  {
    id: 'watchos',
    label: 'watchOS',
    shortLabel: 'watchOS',
    width: 1088,
    height: 1088,
    mask: 'circle',
    maskRadius: '50%',
    keylineSize: '80%',
  },
  {
    id: 'visionos',
    label: 'visionOS',
    shortLabel: 'visionOS',
    width: 1024,
    height: 1024,
    mask: 'circle',
    maskRadius: '50%',
    keylineSize: '80%',
  },
  {
    id: 'tvos',
    label: 'tvOS',
    shortLabel: 'tvOS',
    width: 800,
    height: 480,
    mask: 'landscape',
    maskRadius: '15%',
    keylineSize: '48%',
  },
] as const

export const iconPreviewSizes = [16, 24, 32, 64, 88, 128] as const
export const iconPreviewStorageKey = 'yunlefun-icons-preview'

export type IconPreviewTemplate = typeof iconPreviewTemplates[number]['id']
export type IconPreviewSize = typeof iconPreviewSizes[number]

export interface IconPreviewSettings {
  template: IconPreviewTemplate
  size: IconPreviewSize
  guides: boolean
}

export const defaultIconPreviewSettings: IconPreviewSettings = {
  template: 'ios',
  size: 64,
  guides: false,
}

export function getIconPreviewTemplateStyle(
  template: typeof iconPreviewTemplates[number],
  size: IconPreviewSize,
): Record<string, string> {
  return {
    '--preview-icon-size': `${size}px`,
    '--preview-template-ratio': `${template.width} / ${template.height}`,
    '--preview-stage-width': template.width === template.height ? '152px' : '184px',
    '--preview-mask-radius': template.maskRadius,
    '--preview-keyline-size': template.keylineSize,
  }
}

export function parseIconPreviewSettings(value: string | null): IconPreviewSettings {
  if (!value)
    return { ...defaultIconPreviewSettings }

  try {
    const parsed = JSON.parse(value) as Record<string, unknown>
    const template = iconPreviewTemplates.some(option => option.id === parsed.template)
      ? parsed.template as IconPreviewTemplate
      : defaultIconPreviewSettings.template
    const size = iconPreviewSizes.some(option => option === parsed.size)
      ? parsed.size as IconPreviewSize
      : defaultIconPreviewSettings.size

    return {
      template,
      size,
      guides: typeof parsed.guides === 'boolean'
        ? parsed.guides
        : defaultIconPreviewSettings.guides,
    }
  }
  catch {
    return { ...defaultIconPreviewSettings }
  }
}
