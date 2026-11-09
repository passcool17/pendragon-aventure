import { describe, it, expect } from 'vitest'
import { CREA_SPRITE_KEYS, spriteUrl } from '../src/gfx/spriteKeys.js'
import { existsSync } from 'node:fs'
import { join } from 'node:path'

describe('Créa sprite pack', () => {
  it('lists 22 keys matching public PNGs', () => {
    expect(CREA_SPRITE_KEYS).toHaveLength(22)
    for (const key of CREA_SPRITE_KEYS) {
      const path = join('public/assets/sprites', `${key}.png`)
      expect(existsSync(path), path).toBe(true)
      expect(spriteUrl(key)).toBe(`assets/sprites/${key}.png`)
    }
  })
})
