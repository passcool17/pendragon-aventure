import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'

describe('fx placeholder module', () => {
  it('exports generateFxPlaceholders', () => {
    const src = readFileSync('src/gfx/placeholders.js', 'utf8')
    expect(src).toContain('generateFxPlaceholders')
    expect(src).toContain('rayon-lumiere')
  })
})
