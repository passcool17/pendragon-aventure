import { describe, it, expect } from 'vitest'
import { planDecor, floorStyle, cellHash } from '../src/world/decor.js'
import { loadLevel } from '../src/data/index.js'
import { isWalkable } from '../src/world/tilemap.js'

describe('decor', () => {
  it('is deterministic', () => {
    expect(cellHash(3, 4)).toBe(cellHash(3, 4))
    expect(floorStyle(1, 2)).toEqual(floorStyle(1, 2))
  })

  it('never covers forest spawn or exits', () => {
    const level = loadLevel('forest')
    const decor = planDecor(level)
    const banned = new Set([
      `${level.spawn.x},${level.spawn.y}`,
      ...level.exits.map((e) => `${e.tile[0]},${e.tile[1]}`),
    ])
    for (const d of decor) {
      expect(banned.has(`${d.x},${d.y}`)).toBe(false)
    }
    expect(decor.some((d) => d.key === 'tree' || d.key === 'fern')).toBe(true)
  })

  it('places columns in ruins', () => {
    const level = loadLevel('ruins')
    const decor = planDecor(level)
    expect(decor.some((d) => d.key === 'ruin-column')).toBe(true)
  })
})
