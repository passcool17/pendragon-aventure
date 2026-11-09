import { describe, it, expect } from 'vitest'
import { PALETTE, TEXTURE_KEYS } from '../src/gfx/placeholders.js'

describe('placeholders', () => {
  it('uses dark forest palette with gold spell', () => {
    expect(PALETTE.floor).toMatch(/^#/)
    expect(PALETTE.gold).toBe('#e8c547')
    expect(TEXTURE_KEYS).toContain('merlin')
    expect(TEXTURE_KEYS).toContain('icon-light')
    expect(TEXTURE_KEYS).toContain('light-orb')
    expect(TEXTURE_KEYS).toContain('melee-arc')
    expect(TEXTURE_KEYS).toContain('wind-puff')
  })
})
