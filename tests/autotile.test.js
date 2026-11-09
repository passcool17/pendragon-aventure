import { describe, it, expect } from 'vitest'
import { cheminKey, eauKey, herbeKey, textureForCell } from '../src/world/autotile.js'

describe('autotile', () => {
  it('picks fill for surrounded path', () => {
    const tiles = [
      '=====',
      '=====',
      '=====',
    ]
    expect(cheminKey(tiles, 2, 1)).toBe('chemin-terre')
  })
  it('picks water fill', () => {
    const tiles = [
      '~~~~~',
      '~~~~~',
      '~~~~~',
    ]
    expect(eauKey(tiles, 2, 1)).toBe('eau-ruisseau')
  })
  it('herbes cycle', () => {
    expect(herbeKey(0, 0)).toMatch(/^herbe-/)
  })
  it('textureForCell maps path and grass', () => {
    const tiles = ['..=..', '..==.', '.....']
    expect(textureForCell(tiles, 2, 0)).toMatch(/^chemin-/)
    expect(textureForCell(tiles, 0, 0)).toMatch(/^herbe-/)
  })
})
