import { describe, it, expect } from 'vitest'
import { spellIconPositions, hudLayout } from '../src/ui/hudLayout.js'

describe('hudLayout 640x360', () => {
  it('keeps spell icons fully inside the viewport', () => {
    const { width, height } = { width: 640, height: 360 }
    const icons = spellIconPositions(width, height, 32)
    expect(icons).toHaveLength(3)
    for (const p of icons) {
      expect(p.x - 16).toBeGreaterThanOrEqual(0)
      expect(p.x + 16).toBeLessThanOrEqual(width)
      expect(p.y - 16).toBeGreaterThanOrEqual(0)
      expect(p.y + 16).toBeLessThanOrEqual(height)
    }
    expect(icons[0].id).toBe('light')
    expect(icons[2].id).toBe('nature')
  })

  it('places hearts and mana in the top-left safe area', () => {
    const L = hudLayout(640, 360)
    expect(L.heartsOrigin.x).toBeLessThan(80)
    expect(L.heartsOrigin.y).toBeLessThan(40)
    expect(L.mana.x + L.mana.w).toBeLessThan(200)
    expect(L.mana.y).toBeLessThan(70)
  })
})
