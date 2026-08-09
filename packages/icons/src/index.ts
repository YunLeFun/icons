import type { IconifyJSON } from '@iconify/types'
import { iconsJSON, metadataJSON } from './generated'
import type { IconName } from './generated'

export { iconNames, prefix } from './generated'
export type { IconName } from './generated'

export type IconCategory = 'application' | 'brand'
export type IconStyle = 'color' | 'monotone'
export type IconVariant = 'app-icon' | 'mark'

export interface IconSource {
  repository: string
  path: string
  url: string
  sync: boolean
  derivation?: string
}

export interface IconMetadata {
  name: IconName
  product: string
  variant: IconVariant
  title: string
  titleZh: string
  description: string
  category: IconCategory
  style: IconStyle
  tags: string[]
  website?: string
  source: IconSource
}

export const icons = iconsJSON as IconifyJSON
export const iconMetadata = metadataJSON as unknown as IconMetadata[]
