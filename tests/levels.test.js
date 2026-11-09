import { describe, it, expect } from 'vitest'
import { levels, validateLevel, loadLevel } from '../src/data/index.js'

const REQUIRED = ['hub', 'forest', 'ruins', 'sanctuary', 'boss-final']

describe('levels 32px', () => {
  it('exposes core ids', () => {
    for (const id of REQUIRED) expect(levels[id]).toBeTruthy()
  })
  for (const id of REQUIRED) {
    it(`${id} passes schema`, () => {
      expect(() => validateLevel(levels[id])).not.toThrow()
      expect(loadLevel(id).id).toBe(id)
    })
  }
  it('forest has cross path, water, braziers, facade prop', () => {
    const f = levels.forest
    expect(f.tiles.some((r) => r.includes('='))).toBe(true)
    expect(f.tiles.some((r) => r.includes('~') || r.includes('P'))).toBe(true)
    const p = f.puzzles.find((x) => x.type === 'braziers')
    expect(p.count).toBe(3)
    expect(f.props.some((p) => p.key === 'facade-sanctuaire')).toBe(true)
    expect(f.props.some((p) => p.key === 'pont-pierre')).toBe(true)
  })
  it('ruins has push-blocks', () => {
    expect(levels.ruins.puzzles.some((p) => p.type === 'push-blocks')).toBe(true)
  })
  it('sanctuary has vine-bridges', () => {
    expect(levels.sanctuary.puzzles.some((p) => p.type === 'vine-bridges')).toBe(true)
  })
})
