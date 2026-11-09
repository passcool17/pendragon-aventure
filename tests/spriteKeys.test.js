import { describe, it, expect } from 'vitest'
import { CREA_SPRITE_KEYS, spriteUrl, TILE_SIZE } from '../src/gfx/spriteKeys.js'
import { existsSync } from 'node:fs'
import { join } from 'node:path'

describe('Créa sprites32 pack', () => {
  it('tile size 32 and core PNGs present', () => {
    expect(TILE_SIZE).toBe(32)
    expect(CREA_SPRITE_KEYS.length).toBeGreaterThanOrEqual(60)
    for (const key of ['merlin-dos', 'herbe-1', 'chemin-terre', 'eau-ruisseau', 'rayon-lumiere', 'facade-sanctuaire']) {
      expect(CREA_SPRITE_KEYS).toContain(key)
      expect(existsSync(join('public/assets/sprites32', `${key}.png`)), key).toBe(true)
      expect(spriteUrl(key)).toBe(`assets/sprites32/${key}.png`)
    }
  })
})
