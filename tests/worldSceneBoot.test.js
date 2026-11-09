import { describe, it, expect } from 'vitest'
import fs from 'node:fs'
import { levels, loadLevel } from '../src/data/index.js'
import { planDecor } from '../src/world/decor.js'
import { textureForCell } from '../src/world/autotile.js'
import { isSolidTile } from '../src/world/tilemap.js'

/** Simulate WorldScene.create tile/prop/decor work with a hard time budget (no Phaser). */
function simulateWorldCreate(id, budgetMs = 250) {
  const started = Date.now()
  const level = loadLevel(id)
  let imageOps = 0
  let wallOps = 0
  for (let y = 0; y < level.height; y++) {
    for (let x = 0; x < level.width; x++) {
      textureForCell(level.tiles, x, y)
      imageOps += 1
      const ch = level.tiles[y][x]
      if (isSolidTile(ch) && ch !== 'P') wallOps += 1
    }
  }
  const decor = planDecor(level)
  imageOps += decor.length + (level.props?.length || 0) + (level.enemies?.length || 0)
  const ms = Date.now() - started
  return { id, ms, imageOps, wallOps, budgetMs, ok: ms < budgetMs }
}

describe('WorldScene boot non-regression', () => {
  it('defines updateCanopyFade on WorldScene source (prevents runtime TypeError freeze)', () => {
    const src = fs.readFileSync(new URL('../src/scenes/WorldScene.js', import.meta.url), 'utf8')
    expect(src).toMatch(/updateCanopyFade\s*\(/)
    expect(src).toMatch(/updateCanopyFade\s*\(\)\s*\{/)
    // called from update
    expect(src).toMatch(/this\.updateCanopyFade/)
  })

  for (const id of Object.keys(levels)) {
    it(`create-path for ${id} finishes within budget (no unbounded loop)`, () => {
      const r = simulateWorldCreate(id)
      expect(r.ok, `${id} took ${r.ms}ms / ops=${r.imageOps}`).toBe(true)
      expect(r.imageOps).toBeLessThan(5000)
    })
  }
})
