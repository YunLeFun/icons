import manifestData from '../../../../assets/catalog/app-assets.json'

export interface AssetFile {
  url: string
  width: number
  height: number
  mime: 'image/webp' | 'image/png'
  bytes: number
  sha256: string
}

export interface AssetSource {
  kind?: string
  url?: string
  repository?: string
  path?: string
  commit?: string
  tool?: string
  sha256: string
}

export interface AppArtwork {
  kind: 'official' | 'generated'
  version: string
  usage: 'desktop-selected' | 'comparison-only'
  status?: 'candidate' | 'superseded'
  adoption?: { status: 'maintainer-approved', approvedAt: string, scope: 'application-icon' }
  thumbnail: AssetFile
  master: AssetFile
  source: AssetSource
}

export interface AppAsset {
  slug: string
  title: string
  description: string
  tags: string[]
  desktopAsset: AppArtwork
  applicationIdentity: { status: string, notes: string, source?: AssetSource }
  websitePublication: {
    status: 'verified-resource' | 'declared-only' | 'unverified'
    websiteUrl?: string
    iconUrl?: string
    checkedAt?: string
  }
  candidates: AppArtwork[]
  previousIcon?: { url: string, label: string, source?: AssetSource, width?: number, height?: number, archivedArtwork?: AppArtwork }
}

export interface AppAssetManifest {
  schemaVersion: 1
  updatedAt: string
  scope: 'desktop-catalog-artwork'
  hashMeaning: string
  assets: AppAsset[]
}

export type AssetFilter = 'all' | 'official' | 'generated' | 'comparison'
export const previewSizes = [32, 56, 128] as const
export const mediaOrigin = 'https://yunlefun-cos-1253292018.cos.ap-shanghai.myqcloud.com'
export const identityLabels: Record<string, string> = {
  formal_app_icon: '正式应用图标',
  generic_project_favicon: '项目通用 favicon',
  legacy_icon_unverified: '已有旧图，品牌来源未确认',
  project_selected_logo_mark: '项目选用的标记',
  project_mark_only: '项目专属 mark',
  project_selected_illustration: '项目选用的插图',
  framework_default: '框架默认图标',
  external_brand_only: '第三方品牌 favicon',
}

export const publicationLabels = {
  'verified-resource': '已核实公开图标资源',
  'declared-only': '站点声明已核实，图像访问未确认',
  'unverified': '站点发布版本未核实',
} as const

function record(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value)
}

function requireValue(condition: unknown, message: string): asserts condition {
  if (!condition)
    throw new Error(`App asset manifest: ${message}`)
}

/** Fixed public links must not contain credentials, temporary queries or local hosts. */
export function isPublicHttpsUrl(value: unknown): value is string {
  if (typeof value !== 'string')
    return false
  try {
    const url = new URL(value)
    return url.protocol === 'https:' && !url.username && !url.password && !url.port
      && !url.search && !url.hash
      && /^[a-z0-9-]+(?:\.[a-z0-9-]+)+$/i.test(url.hostname)
      && !/^\d+(?:\.\d+){3}$/.test(url.hostname)
      && !/(?:^|\.)(?:localhost|local|internal|test|invalid)$/.test(url.hostname)
  }
  catch { return false }
}

function validateSource(value: unknown): void {
  requireValue(record(value), 'source is required')
  requireValue(typeof value.sha256 === 'string' && /^[a-f0-9]{64}$/.test(value.sha256), 'source SHA-256 is invalid')
  if (value.url !== undefined)
    requireValue(isPublicHttpsUrl(value.url), 'source URL must be permanent public HTTPS')
  if (value.path !== undefined)
    requireValue(typeof value.path === 'string' && !value.path.startsWith('/') && !value.path.includes('..'), 'source path must be repository-relative')
  if (value.commit !== undefined)
    requireValue(typeof value.commit === 'string' && /^[a-f0-9]{40}$/.test(value.commit), 'source commit is invalid')
}

function validateArtwork(value: unknown, slug: string, role: 'selected' | 'candidate' | 'superseded'): void {
  requireValue(record(value), 'artwork is required')
  requireValue(value.kind === 'official' || value.kind === 'generated', 'artwork kind is invalid')
  requireValue(typeof value.version === 'string' && /^v\d+$/.test(value.version), 'artwork version is invalid')
  const selected = role === 'selected'
  requireValue(value.usage === (selected ? 'desktop-selected' : 'comparison-only'), 'artwork usage is invalid')
  requireValue(value.status === (selected ? undefined : role), 'artwork status does not match its role')
  if (value.adoption !== undefined) {
    requireValue(selected && record(value.adoption) && value.adoption.status === 'maintainer-approved'
      && value.adoption.scope === 'application-icon', 'adoption is only valid for a maintainer-approved selected application icon')
    const date = value.adoption.approvedAt
    requireValue(typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)
      && !Number.isNaN(Date.parse(date)) && new Date(date).toISOString().startsWith(date), 'adoption approval date is invalid')
  }
  for (const [key, size, mime, path] of [
    ['thumbnail', 256, 'image/webp', `/desktop/app-icons/${value.version}/${slug}.webp`],
    ['master', 1024, 'image/png', `/desktop/app-icons/masters/${value.version}/${slug}.png`],
  ] as const) {
    const file = value[key]
    requireValue(record(file), `${key} is required`)
    requireValue(isPublicHttpsUrl(file.url) && file.url === `${mediaOrigin}${path}`, `${key} URL must match the fixed object path`)
    requireValue(file.width === size && file.height === size && file.mime === mime, `${key} dimensions or MIME are invalid`)
    requireValue(Number.isSafeInteger(file.bytes) && Number(file.bytes) > 0, `${key} byte size is invalid`)
    requireValue(typeof file.sha256 === 'string' && /^[a-f0-9]{64}$/.test(file.sha256), `${key} SHA-256 is invalid`)
  }
  validateSource(value.source)
}

/** Validate static metadata without fetching media or depending on another checkout. */
export function parseAppAssetManifest(value: unknown): AppAssetManifest {
  requireValue(record(value) && value.schemaVersion === 1, 'unsupported schemaVersion')
  requireValue(value.scope === 'desktop-catalog-artwork', 'scope is invalid')
  requireValue(typeof value.updatedAt === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value.updatedAt), 'updatedAt is invalid')
  requireValue(typeof value.hashMeaning === 'string', 'hash meaning is required')
  requireValue(Array.isArray(value.assets) && value.assets.length > 0, 'assets must not be empty')
  const slugs = new Set<string>()
  for (const asset of value.assets) {
    requireValue(record(asset) && typeof asset.slug === 'string' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(asset.slug), 'slug is invalid')
    requireValue(!slugs.has(asset.slug), `duplicate slug ${asset.slug}`)
    slugs.add(asset.slug)
    requireValue(typeof asset.title === 'string' && !!asset.title.trim() && typeof asset.description === 'string', 'display copy is required')
    requireValue(Array.isArray(asset.tags) && asset.tags.every(tag => typeof tag === 'string'), 'tags are invalid')
    validateArtwork(asset.desktopAsset, asset.slug, 'selected')
    requireValue(record(asset.applicationIdentity) && typeof asset.applicationIdentity.notes === 'string'
      && typeof asset.applicationIdentity.status === 'string' && Object.hasOwn(identityLabels, asset.applicationIdentity.status), 'application identity is invalid')
    if (asset.applicationIdentity.source)
      validateSource(asset.applicationIdentity.source)
    requireValue(record(asset.websitePublication) && typeof asset.websitePublication.status === 'string'
      && Object.hasOwn(publicationLabels, asset.websitePublication.status), 'website publication status is invalid')
    for (const key of ['websiteUrl', 'iconUrl']) {
      if (asset.websitePublication[key] !== undefined)
        requireValue(isPublicHttpsUrl(asset.websitePublication[key]), 'website URL must be permanent public HTTPS')
    }
    requireValue(Array.isArray(asset.candidates), 'candidates must be explicit')
    for (const candidate of asset.candidates)
      validateArtwork(candidate, asset.slug, 'candidate')
    if (asset.previousIcon !== undefined) {
      requireValue(record(asset.previousIcon) && isPublicHttpsUrl(asset.previousIcon.url)
        && typeof asset.previousIcon.label === 'string', 'previous icon is invalid')
      if (asset.previousIcon.source)
        validateSource(asset.previousIcon.source)
      if (asset.previousIcon.archivedArtwork !== undefined)
        validateArtwork(asset.previousIcon.archivedArtwork, asset.slug, 'superseded')
    }
  }
  return value as unknown as AppAssetManifest
}

export function filterAppAssets(assets: readonly AppAsset[], query: string, filter: AssetFilter): AppAsset[] {
  const needle = query.trim().toLocaleLowerCase()
  return assets.filter((asset) => {
    const matches = filter === 'all' || (filter === 'comparison'
      ? !!asset.previousIcon || asset.candidates.length > 0
      : asset.desktopAsset.kind === filter)
    const text = [asset.slug, asset.title, asset.description, ...asset.tags,
      asset.desktopAsset.source.repository ?? '', asset.applicationIdentity.source?.repository ?? '',
      identityLabels[asset.applicationIdentity.status]].join(' ').toLocaleLowerCase()
    return matches && (!needle || text.includes(needle))
  })
}

export function formatBytes(bytes: number): string {
  return `${(bytes / 1024).toFixed(1)} KB`
}

export const appAssetManifest = parseAppAssetManifest(manifestData)
