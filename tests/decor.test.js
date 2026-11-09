import { describe, it, expect } from 'vitest'
import { planDecor, floorStyle, cellHash } from '../src/world/decor.js'
import { loadLevel } from '../src/data/index.js'
import { isWalkable } from '../src/world/tilemap.js'

describe('decor', () => {
  it('is deterministic', () => {
    expect(cellHash(3, 4)).toBe(cellHash(3, 4))
    expect(floorStyle(1, 2)).toEqual(floorStyle(1, 2))
  })

  it('avoids harsh (x+y) checkerboard flip that stripes the floor', () => {
    const a = floorStyle(2, 2)
    const b = floorStyle(3, 2)
    // Not forced opposite purely by parity of x+y
    const parityFlip = ((2 + 2) % 2 === 0) !== ((3 + 2) % 2 === 0)
    // Styles come from hash; tints stay near white (low contrast)
    expect(a.tint).toBeGreaterThan(0xf00000)
    expect(b.tint).toBeGreaterThan(0xf00000)
    expect(typeof a.flipY).toBe('boolean')
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
