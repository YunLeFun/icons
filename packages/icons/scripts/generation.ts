import type { IconifyJSON } from '@iconify/types'

function withoutLastModified(iconSet: IconifyJSON): Omit<IconifyJSON, 'lastModified'> {
  const { lastModified: _lastModified, ...comparable } = iconSet
  return comparable
}

/** Preserve collection metadata when identical inputs are rebuilt. */
export function resolveLastModified(
  current: IconifyJSON,
  previous: IconifyJSON | null,
  generatedAt: number,
): number {
  if (
    previous
    && typeof previous.lastModified === 'number'
    && JSON.stringify(withoutLastModified(current)) === JSON.stringify(withoutLastModified(previous))
  ) {
    return previous.lastModified
  }

  return generatedAt
}
