import { describe, it, expect } from 'vitest'
import forest from '../src/data/forest.json'
import { isPathChar, isWaterChar, isBridgeChar } from '../src/world/autotile.js'

function bandThickness(tiles, pred) {
  const h = tiles.length
  const w = tiles[0].length
  let best = 0
  for (let x = 0; x < w; x++) {
    let run = 0
    for (let y = 0; y < h; y++) {
      if (pred(tiles[y][x])) { run += 1; best = Math.max(best, run) }
      else run = 0
    }
  }
  for (let y = 0; y < h; y++) {
    let run = 0
    for (let x = 0; x < w; x++) {
      if (pred(tiles[y][x])) { run += 1; best = Math.max(best, run) }
      else run = 0
    }
  }
  return best
}

function minStreamWidth(tiles) {
  // for each row with water, width of longest water/bridge run; return median of those
  const widths = []
  for (const row of tiles) {
    let best = 0, run = 0
    for (const ch of row) {
      if (isWaterChar(ch) || isBridgeChar(ch)) { run += 1; best = Math.max(best, run) }
      else run = 0
    }
    if (best > 0) widths.push(best)
  }
  if (!widths.length) return 0
  widths.sort((a, b) => a - b)
  return widths[Math.floor(widths.length / 2)]
}

describe('forest layout aesthetics', () => {
  it('path cross is at least 2 tiles thick', () => {
    const thick = bandThickness(forest.tiles, (ch) => isPathChar(ch) || isBridgeChar(ch))
    expect(thick).toBeGreaterThanOrEqual(2)
  })

  it('stream median width >= 3 for smooth body', () => {
    expect(minStreamWidth(forest.tiles)).toBeGreaterThanOrEqual(3)
  })

  it('keeps enemies away from spawn (manhattan >= 5)', () => {
    const { x: sx, y: sy } = forest.spawn
    for (const e of forest.enemies) {
      expect(Math.abs(e.x - sx) + Math.abs(e.y - sy)).toBeGreaterThanOrEqual(5)
    }
  })
})
