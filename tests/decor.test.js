import { describe, it, expect } from 'vitest'
import { planDecor, cellHash } from '../src/world/decor.js'
import { loadLevel } from '../src/data/index.js'

describe('decor', () => {
  it('is deterministic and dense on forest grass', () => {
    expect(cellHash(3, 4)).toBe(cellHash(3, 4))
    const level = loadLevel('forest')
    const decor = planDecor(level)
    expect(decor.length).toBeGreaterThan(10)
    const banned = new Set([
      `${level.spawn.x},${level.spawn.y}`,
      ...level.exits.map((e) => `${e.tile[0]},${e.tile[1]}`),
    ])
    for (const d of decor) expect(banned.has(`${d.x},${d.y}`)).toBe(false)
  })
})
