import type { IconName } from '@yunlefun/icons'
import { icons } from '@yunlefun/icons'

export type IconDownloadFormat = 'react' | 'svg' | 'vue'

export interface GeneratedIconAsset {
  content: string
  filename: string
  mimeType: string
}

interface IconSource {
  body: string
  height: number
  name: IconName
  width: number
}

const jsxAttributeNames: Record<string, string> = {
  'class': 'className',
  'clip-path': 'clipPath',
  'clip-rule': 'clipRule',
  'color-interpolation': 'colorInterpolation',
  'color-interpolation-filters': 'colorInterpolationFilters',
  'fill-opacity': 'fillOpacity',
  'fill-rule': 'fillRule',
  'flood-color': 'floodColor',
  'flood-opacity': 'floodOpacity',
  'font-family': 'fontFamily',
  'font-size': 'fontSize',
  'font-weight': 'fontWeight',
  'mask-type': 'maskType',
  'stop-color': 'stopColor',
  'stop-opacity': 'stopOpacity',
  'stroke-dasharray': 'strokeDasharray',
  'stroke-dashoffset': 'strokeDashoffset',
  'stroke-linecap': 'strokeLinecap',
  'stroke-linejoin': 'strokeLinejoin',
  'stroke-miterlimit': 'strokeMiterlimit',
  'stroke-opacity': 'strokeOpacity',
  'stroke-width': 'strokeWidth',
  'text-anchor': 'textAnchor',
  'vector-effect': 'vectorEffect',
  'xlink:href': 'xlinkHref',
  'xml:space': 'xmlSpace',
}

function getIconSource(name: IconName): IconSource {
  const icon = icons.icons[name]
  if (!icon)
    throw new Error(`Unknown YunLeFun icon: ${name}`)

  return {
    body: prefixSvgIds(icon.body, `ylf-${name}`),
    height: icon.height ?? icons.height ?? 16,
    name,
    width: icon.width ?? icons.width ?? 16,
  }
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function prefixSvgIds(body: string, prefix: string): string {
  const replacements = new Map<string, string>()
  const withPrefixedIds = body.replace(/\bid="([^"]+)"/g, (_match, id: string) => {
    const target = `${prefix}-${id.replace(/[^a-zA-Z0-9_-]/g, '-')}`
    replacements.set(id, target)
    return `id="${target}"`
  })

  return [...replacements].reduce((result, [source, target]) => {
    const escapedSource = escapeRegExp(source)
    return result
      .replace(new RegExp(`url\\(#${escapedSource}\\)`, 'g'), `url(#${target})`)
      .replace(new RegExp(`(["'])#${escapedSource}\\1`, 'g'), (_match, quote: string) => `${quote}#${target}${quote}`)
  }, withPrefixedIds)
}

function formatSvgBody(body: string, indentation: string): string {
  return body
    .replace(/></g, '>\n<')
    .split('\n')
    .map(line => `${indentation}${line}`)
    .join('\n')
}

function componentName(name: IconName): string {
  const suffix = name
    .split('-')
    .map(part => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join('')

  return `Ylf${suffix}`
}

function toJsx(body: string): string {
  const attributePattern = new RegExp(`\\b(${Object.keys(jsxAttributeNames).map(escapeRegExp).join('|')})=`, 'g')
  return body.replace(attributePattern, attribute => `${jsxAttributeNames[attribute.slice(0, -1)]}=`)
}

export function createSvgSource(name: IconName): string {
  const icon = getIconSource(name)
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${icon.width}" height="${icon.height}" viewBox="0 0 ${icon.width} ${icon.height}">`,
    formatSvgBody(icon.body, '  '),
    '</svg>',
    '',
  ].join('\n')
}

export function createVueComponentSource(name: IconName): string {
  const icon = getIconSource(name)
  const namePascal = componentName(name)

  return [
    '<script setup lang="ts">',
    'interface Props {',
    '  size?: number | string',
    '  title?: string',
    '}',
    '',
    `defineOptions({ name: '${namePascal}', inheritAttrs: false })`,
    '',
    'withDefaults(defineProps<Props>(), {',
    "  size: '1em',",
    '})',
    '</script>',
    '',
    '<template>',
    '  <svg',
    '    xmlns="http://www.w3.org/2000/svg"',
    '    :width="size"',
    '    :height="size"',
    `    viewBox="0 0 ${icon.width} ${icon.height}"`,
    '    :aria-hidden="title ? undefined : true"',
    '    :role="title ? \'img\' : undefined"',
    '    v-bind="$attrs"',
    '  >',
    '    <title v-if="title">{{ title }}</title>',
    formatSvgBody(icon.body, '    '),
    '  </svg>',
    '</template>',
    '',
  ].join('\n')
}

export function createReactComponentSource(name: IconName): string {
  const icon = getIconSource(name)
  const namePascal = componentName(name)

  return [
    "import type { SVGProps } from 'react'",
    '',
    `export type ${namePascal}Props = Omit<SVGProps<SVGSVGElement>, 'title'> & {`,
    '  size?: number | string',
    '  title?: string',
    '}',
    '',
    `export function ${namePascal}({ size = '1em', title, ...props }: ${namePascal}Props) {`,
    '  return (',
    '    <svg',
    '      xmlns="http://www.w3.org/2000/svg"',
    '      width={size}',
    '      height={size}',
    `      viewBox="0 0 ${icon.width} ${icon.height}"`,
    '      aria-hidden={title ? undefined : true}',
    '      role={title ? \'img\' : undefined}',
    '      {...props}',
    '    >',
    '      {title ? <title>{title}</title> : null}',
    formatSvgBody(toJsx(icon.body), '      '),
    '    </svg>',
    '  )',
    '}',
    '',
    `export default ${namePascal}`,
    '',
  ].join('\n')
}

export function createIconAsset(name: IconName, format: IconDownloadFormat): GeneratedIconAsset {
  const namePascal = componentName(name)

  if (format === 'vue') {
    return {
      content: createVueComponentSource(name),
      filename: `${namePascal}.vue`,
      mimeType: 'text/plain;charset=utf-8',
    }
  }

  if (format === 'react') {
    return {
      content: createReactComponentSource(name),
      filename: `${namePascal}.tsx`,
      mimeType: 'text/typescript;charset=utf-8',
    }
  }

  return {
    content: createSvgSource(name),
    filename: `${name}.svg`,
    mimeType: 'image/svg+xml;charset=utf-8',
  }
}
