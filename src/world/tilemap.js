import { isPathChar, isWaterChar, isBridgeChar } from './autotile.js'

const WALK = new Set(['.', ',', '=', 'P', 'B', 'D', 'G', 'T', 'C', 'X', 'N'])

export function isWalkable(level, x, y, extraWalkable = new Set()) {
  if (y < 0 || y >= level.height || x < 0 || x >= level.width) return false
  if (extraWalkable.has(`${x},${y}`)) return true
  const ch = level.tiles[y][x]
  return WALK.has(ch)
}

export function isSolidTile(ch) {
  return ch === '#' || isWaterChar(ch)
}

export function tileToWorld(tx, ty, tile = 32) {
  return { x: tx * tile + tile / 2, y: ty * tile + tile / 2 }
}

export function worldToTile(wx, wy, tile = 32) {
  return { x: Math.floor(wx / tile), y: Math.floor(wy / tile) }
}

export function buildWalkGrid(level, extraWalkable = new Set()) {
  const grid = []
  for (let y = 0; y < level.height; y++) {
    const row = []
    for (let x = 0; x < level.width; x++) {
      row.push(isWalkable(level, x, y, extraWalkable))
    }
    grid.push(row)
  }
  return grid
}

export { isPathChar, isWaterChar, isBridgeChar }
