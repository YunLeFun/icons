import { describe, expect, it } from 'vitest'
import { createOptimizedSVG } from '../scripts/svg'

describe('SVG color strategies', () => {
  it('preserves application colors', () => {
    const svg = createOptimizedSVG(
      '<svg viewBox="0 0 24 24"><path fill="#123456" d="M0 0h24v24H0z"/></svg>',
      { mode: 'preserve' },
    )

    expect(svg.getBody()).toContain('#123456')
  })

  it('converts monotone colors to currentColor', () => {
    const svg = createOptimizedSVG(
      '<svg viewBox="0 0 24 24"><path fill="#123456" d="M0 0h24v24H0z"/></svg>',
      { mode: 'current-color' },
    )

    expect(svg.getBody()).toContain('currentColor')
    expect(svg.getBody()).not.toContain('#123456')
  })

  it('resolves inherited source colors without changing white details', () => {
    const svg = createOptimizedSVG(
      '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M0 0h24v24H0z"/><path fill="white" d="M8 8h8v8H8z"/></svg>',
      { mode: 'replace-current-color', color: '#0078E7' },
    )

    expect(svg.getBody()).toContain('#0078e7')
    expect(svg.getBody()).toContain('#fff')
  })
})
