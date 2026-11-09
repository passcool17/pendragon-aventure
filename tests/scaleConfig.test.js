import { describe, it, expect } from 'vitest'
import { GAME_CONFIG } from '../src/gameConfig.js'

describe('GAME_CONFIG scale', () => {
  it('uses 640x360 FIT for 32px tiles', () => {
    expect(GAME_CONFIG.width).toBe(640)
    expect(GAME_CONFIG.height).toBe(360)
    expect(GAME_CONFIG.tileSize).toBe(32)
    expect(GAME_CONFIG.scaleMode).toBe('FIT')
    expect(GAME_CONFIG.autoCenter).toBe('CENTER_BOTH')
    expect(GAME_CONFIG.pixelArt).toBe(true)
  })
})
