import type { IconifyJSON } from '@iconify/types'
import { describe, expect, it } from 'vitest'

import { resolveLastModified } from '../scripts/generation'

function iconSet(body: string, lastModified?: number): IconifyJSON {
  return {
    prefix: 'ylf',
    icons: { sample: { body } },
    lastModified,
  }
}

describe('generated collection metadata', () => {
  it('preserves lastModified when a rebuild has identical inputs', () => {
    expect(resolveLastModified(iconSet('<path/>', 999), iconSet('<path/>', 123), 456)).toBe(123)
  })

  it('uses the generation timestamp when icon content changes', () => {
    expect(resolveLastModified(iconSet('<circle/>', 999), iconSet('<path/>', 123), 456)).toBe(456)
  })

  it('uses the generation timestamp for the first build', () => {
    expect(resolveLastModified(iconSet('<path/>', 999), null, 456)).toBe(456)
  })
})
