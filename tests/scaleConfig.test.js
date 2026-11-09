import { describe, it, expect } from 'vitest'
import { GAME_CONFIG } from '../src/gameConfig.js'

describe('GAME_CONFIG scale', () => {
  it('uses FIT + CENTER_BOTH without manual canvas resize', () => {
    expect(GAME_CONFIG.scaleMode).toBe('FIT')
    expect(GAME_CONFIG.autoCenter).toBe('CENTER_BOTH')
    expect(GAME_CONFIG.pixelArt).toBe(true)
    expect(GAME_CONFIG.roundPixels).toBe(true)
    expect(GAME_CONFIG.width).toBe(384)
    expect(GAME_CONFIG.height).toBe(288)
  })
})
