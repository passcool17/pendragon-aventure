import { describe, it, expect } from 'vitest'
import { herbeKey, textureForCell, isWaterChar, isPathChar } from '../src/world/autotile.js'

describe('autotile (grass underlay only)', () => {
  it('textureForCell always returns herbe (path/water are smooth blobs)', () => {
    const tiles = ['~=~..', '.===.', '.....']
    expect(textureForCell(tiles, 0, 0)).toMatch(/^herbe-/)
    expect(textureForCell(tiles, 2, 1)).toMatch(/^herbe-/)
  })
  it('herbes cycle', () => {
    expect(herbeKey(0, 0)).toMatch(/^herbe-/)
  })
  it('char helpers', () => {
    expect(isWaterChar('~')).toBe(true)
    expect(isPathChar('=')).toBe(true)
  })
})
