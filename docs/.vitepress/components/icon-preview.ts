export const iconPreviewModes = [
  {
    id: 'mark',
    label: '主体',
    description: '透明主体层，用于界面、导航和品牌组合。',
  },
  {
    id: 'app-icon',
    label: '完整图标',
    description: '方形满幅构图，包含背景与主体，不预裁圆角。',
  },
  {
    id: 'platform',
    label: '平台效果',
    description: '使用完整图标模拟系统遮罩、裁切与关键线。',
  },
] as const

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
    note: '正方形无遮罩图层，圆角由系统生成。',
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
    note: '正方形无遮罩图层，系统生成圆形输出。',
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
    note: '正方形无遮罩图层，系统生成圆形输出。',
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
    note: '此处仅做方形主图裁切检查；正式提交需单独准备 800 × 480 分层资产。',
  },
] as const

export const iconPreviewSizes = [16, 24, 32, 64, 88, 128] as const
export const iconPreviewStorageKey = 'yunlefun-icons-preview'

export type IconPreviewMode = typeof iconPreviewModes[number]['id']
export type IconPreviewTemplate = typeof iconPreviewTemplates[number]['id']
export type IconPreviewSize = typeof iconPreviewSizes[number]

export interface IconPreviewSettings {
  mode: IconPreviewMode
  template: IconPreviewTemplate
  size: IconPreviewSize
  guides: boolean
}

export const defaultIconPreviewSettings: IconPreviewSettings = {
  mode: 'mark',
  template: 'ios',
  size: 64,
  guides: false,
}

export function getIconPreviewTemplateStyle(
  mode: IconPreviewMode,
  template: typeof iconPreviewTemplates[number],
  size: IconPreviewSize,
): Record<string, string> {
  const canvasWidth = size
  const canvasHeight = mode === 'platform'
    ? Number((size * template.height / template.width).toFixed(2))
    : size

  return {
    '--preview-canvas-width': `${canvasWidth}px`,
    '--preview-canvas-height': `${canvasHeight}px`,
    '--preview-icon-size': `${Math.max(canvasWidth, canvasHeight)}px`,
    '--preview-stage-width': '152px',
    '--preview-mask-radius': mode === 'platform' ? template.maskRadius : '0',
    '--preview-keyline-size': template.keylineSize,
  }
}

export function parseIconPreviewSettings(value: string | null): IconPreviewSettings {
  if (!value)
    return { ...defaultIconPreviewSettings }

  try {
    const parsed = JSON.parse(value) as Record<string, unknown>
    const mode = iconPreviewModes.some(option => option.id === parsed.mode)
      ? parsed.mode as IconPreviewMode
      : defaultIconPreviewSettings.mode
    const template = iconPreviewTemplates.some(option => option.id === parsed.template)
      ? parsed.template as IconPreviewTemplate
      : defaultIconPreviewSettings.template
    const size = iconPreviewSizes.some(option => option === parsed.size)
      ? parsed.size as IconPreviewSize
      : defaultIconPreviewSettings.size

    return {
      mode,
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
