/** Deterministic decoration — never on required walkables/exits/spawns. */

export function cellHash(x, y, salt = 0) {
  return Math.abs((x * 374761 + y * 668265 + salt * 127) | 0) % 1000
}

function isExitOrSpawn(level, x, y) {
  if (level.spawn?.x === x && level.spawn?.y === y) return true
  for (const ex of level.exits || []) {
    if (ex.tile[0] === x && ex.tile[1] === y) return true
  }
  for (const cp of level.checkpoints || []) {
    if (cp.x === x && cp.y === y) return true
  }
  for (const n of level.npcs || []) {
    if (n.x === x && n.y === y) return true
  }
  for (const e of level.enemies || []) {
    if (e.x === x && e.y === y) return true
  }
  for (const p of level.puzzles || []) {
    for (const t of p.tiles || []) {
      if (t[0] === x && t[1] === y) return true
    }
    for (const b of p.blocks || []) {
      if (b.x === x && b.y === y) return true
    }
    for (const pl of p.plates || []) {
      if (pl[0] === x && pl[1] === y) return true
    }
    for (const s of p.seeds || []) {
      if (s.x === x && s.y === y) return true
    }
  }
  return false
}

function neighborsFloor(level, x, y) {
  const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]]
  for (const [dx, dy] of dirs) {
    const ch = level.tiles[y + dy]?.[x + dx]
    if (ch && ch !== '#' && ch !== '~') return true
  }
  return false
}

/**
 * @returns {{ key: string, x: number, y: number, originY?: number, scale?: number, alpha?: number, tint?: number }[]}
 */
export function planDecor(level) {
  const out = []
  const id = level.id || ''
  const forest = id.includes('forest') || id === 'hub'
  const ruins = id.includes('ruin')
  for (let y = 0; y < level.height; y++) {
    for (let x = 0; x < level.width; x++) {
      if (isExitOrSpawn(level, x, y)) continue
      const ch = level.tiles[y][x]
      const h = cellHash(x, y, id.length)
      if (ch === '#' && neighborsFloor(level, x, y)) {
        if (forest && h % 11 === 0) {
          out.push({ key: 'tree', x, y, originY: 1 })
        } else if (forest && h % 7 === 3) {
          out.push({ key: 'fern', x, y, originY: 1 })
        } else if (ruins && h % 9 === 0) {
          out.push({ key: 'ruin-column', x, y, originY: 1 })
        }
      }
      // Sparse floor clutter (breaks wallpaper without blocking paths)
      if ((ch === '.' || ch === 'C') && !isExitOrSpawn(level, x, y)) {
        if (h % 19 === 4) {
          out.push({
            key: 'fern', x, y, originY: 1,
            scale: 0.45 + (h % 3) * 0.08,
            alpha: 0.75,
            tint: 0x6a8f5a,
          })
        } else if (h % 31 === 6) {
          // pebble: tiny tinted block
          out.push({
            key: 'block', x, y, originY: 0.5,
            scale: 0.22,
            alpha: 0.7,
            tint: 0x8a8070,
          })
        } else if (ruins && h % 37 === 8) {
          out.push({
            key: 'spell-light', x, y, originY: 0.5,
            scale: 0.35,
            alpha: 0.35,
            tint: 0xb0a090,
          })
        }
      }
    }
  }
  return out
}

/**
 * Floor variation — avoid (x+y)%2 checkerboard which amplifies vertical tile seams.
 */
export function floorStyle(x, y) {
  const h = cellHash(x, y, 3)
  const tints = [0xffffff, 0xfbfbf8, 0xf6f7f4, 0xfaf9f5]
  return {
    flipX: (h % 2) === 0,
    flipY: (h % 5) === 0,
    tint: tints[h % 4],
  }
}
