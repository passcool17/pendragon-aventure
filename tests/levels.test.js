import { describe, it, expect } from 'vitest'
import { levels, validateLevel, loadLevel } from '../src/data/index.js'

const REQUIRED = ['hub', 'forest', 'ruins', 'sanctuary', 'boss-final']

describe('levels', () => {
  it('exposes core ids', () => {
    for (const id of REQUIRED) expect(levels[id]).toBeTruthy()
  })
  for (const id of REQUIRED) {
    it(`${id} passes schema`, () => {
      expect(() => validateLevel(levels[id])).not.toThrow()
      expect(loadLevel(id).id).toBe(id)
    })
  }
  it('forest has braziers puzzle count 3', () => {
    const p = levels.forest.puzzles.find((x) => x.type === 'braziers')
    expect(p.count).toBe(3)
    expect(p.unlock).toBe('fog-gate')
  })
  it('ruins has push-blocks puzzle', () => {
    expect(levels.ruins.puzzles.some((p) => p.type === 'push-blocks')).toBe(true)
  })
  it('sanctuary has vine-bridges puzzle', () => {
    expect(levels.sanctuary.puzzles.some((p) => p.type === 'vine-bridges')).toBe(true)
  })
})
