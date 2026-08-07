import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const catalogStyles = readFileSync(resolve(process.cwd(), '.vitepress/theme/style.css'), 'utf8')

describe('catalog responsive and focus styles', () => {
  it('keeps preview controls scrollable at narrow widths', () => {
    expect(catalogStyles).toMatch(/\.preview-options\s*{[^}]*overflow-x:\s*auto/s)
    expect(catalogStyles).toContain('@media (max-width: 720px)')
    expect(catalogStyles).toMatch(/@media \(max-width: 720px\)[\s\S]*?\.preview-toolbar\s*{[^}]*grid-template-columns:\s*1fr/s)
  })

  it('distinguishes keyboard focus from the selected state', () => {
    expect(catalogStyles).toMatch(/\.preview-options button:focus-visible\s*{[^}]*outline:\s*2px solid var\(--catalog-orange\)/s)
    expect(catalogStyles).toMatch(/\.preview-guide-toggle:focus-visible\s*{[^}]*outline:\s*2px solid var\(--catalog-orange\)/s)
  })
})
