const BASE_WALK = new Set(['.', 'D', 'B', 'G', 'X', 'C', 'N', 'T'])

export function isWalkable(level, x, y, extraWalkable = new Set()) {
  if (y < 0 || y >= level.height || x < 0 || x >= level.width) return false
  const key = `${x},${y}`
  if (extraWalkable.has(key)) return true
  const ch = level.tiles[y][x]
  return BASE_WALK.has(ch)
}

export function tileToWorld(tx, ty, tile = 16) {
  return { x: tx * tile + tile / 2, y: ty * tile + tile / 2 }
}

export function worldToTile(wx, wy, tile = 16) {
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
