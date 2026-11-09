import { describe, it, expect } from 'vitest'
import { isWalkable } from '../src/world/tilemap.js'

const level = {
  width: 3, height: 2,
  tiles: ['#.#', '#~#'],
}
describe('isWalkable', () => {
  it('floor yes, wall and water no', () => {
    expect(isWalkable(level, 1, 0)).toBe(true)
    expect(isWalkable(level, 0, 0)).toBe(false)
    expect(isWalkable(level, 1, 1)).toBe(false)
  })
})
