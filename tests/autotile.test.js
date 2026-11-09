import { describe, it, expect } from 'vitest'
import { cheminKey, eauKey, herbeKey, textureForCell } from '../src/world/autotile.js'

describe('autotile', () => {
  it('picks fill for surrounded path', () => {
    const tiles = ['=====', '=====', '=====']
    expect(cheminKey(tiles, 2, 1)).toBe('chemin-terre')
  })

  it('picks water fill', () => {
    const tiles = ['~~~~~', '~~~~~', '~~~~~']
    expect(eauKey(tiles, 2, 1)).toBe('eau-ruisseau')
  })

  it('eau south rim uses berge-n (water on north of tile)', () => {
    const tiles = [
      '.....',
      '.~~~.',
      '.~~~.',
      '.....',
    ]
    expect(eauKey(tiles, 2, 2)).toBe('eau-berge-n')
  })

  it('eau north rim uses berge-s', () => {
    const tiles = [
      '.....',
      '.~~~.',
      '.~~~.',
      '.....',
    ]
    expect(eauKey(tiles, 2, 1)).toBe('eau-berge-s')
  })

  it('eau outer SE tip uses coin-ext-se', () => {
    const tiles = [
      '.....',
      '..~~.',
      '..~..',
      '.....',
    ]
    expect(eauKey(tiles, 2, 1)).toBe('eau-coin-ext-se')
  })

  it('eau interior corner when NE diagonal is grass', () => {
    const tiles = [
      '~~.~',
      '~~~~',
      '~~~~',
    ]
    expect(eauKey(tiles, 1, 1)).toBe('eau-coin-int-ne')
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
