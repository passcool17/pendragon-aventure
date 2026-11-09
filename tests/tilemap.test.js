import { describe, it, expect } from 'vitest'
import { isWalkable } from '../src/world/tilemap.js'

describe('isWalkable 32px', () => {
  const level = {
    width: 4, height: 2,
    tiles: ['#~==', '#P=.'],
  }
  it('path and bridge yes, wall and water no', () => {
    expect(isWalkable(level, 1, 0)).toBe(false) // ~
    expect(isWalkable(level, 2, 0)).toBe(true) // =
    expect(isWalkable(level, 1, 1)).toBe(true) // P
    expect(isWalkable(level, 0, 0)).toBe(false)
  })
})
