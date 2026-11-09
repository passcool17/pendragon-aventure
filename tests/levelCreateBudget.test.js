import { describe, it, expect } from 'vitest'
import { levels, loadLevel } from '../src/data/index.js'
import { planDecor } from '../src/world/decor.js'
import { textureForCell } from '../src/world/autotile.js'
import { isSolidTile } from '../src/world/tilemap.js'

function buildLevelBudget(id, maxMs = 500) {
  const t0 = performance.now()
  const level = loadLevel(id)
  let images = 0
  let walls = 0
  for (let y = 0; y < level.height; y++) {
    for (let x = 0; x < level.width; x++) {
      textureForCell(level.tiles, x, y)
      images += 1
      const ch = level.tiles[y][x]
      if (isSolidTile(ch) && ch !== 'P') walls += 1
    }
  }
  const decor = planDecor(level)
  images += decor.length + (level.props?.length || 0)
  const ms = performance.now() - t0
  return { id, ms, images, walls, decor: decor.length, w: level.width, h: level.height }
}

describe('level create budget (no unbounded work)', () => {
  for (const id of Object.keys(levels)) {
    it(`builds ${id} quickly`, () => {
      const r = buildLevelBudget(id)
      expect(r.ms).toBeLessThan(200)
      expect(r.images).toBeLessThan(5000)
      expect(r.walls).toBeLessThan(2000)
      // eslint-disable-next-line no-console
      console.log(JSON.stringify(r))
    })
  }
})
