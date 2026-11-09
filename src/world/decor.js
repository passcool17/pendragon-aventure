/** Deterministic decoration placement — never on required walkables/exits/spawns. */

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
 * @returns {{ key: string, x: number, y: number, originY?: number }[]}
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
      // ferns just inside floor near walls
      if (forest && (ch === '.' || ch === 'C') && h % 17 === 2) {
        if (!isExitOrSpawn(level, x, y) && neighborsFloor(level, x, y)) {
          // only if next to wall
          const nearWall = [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => level.tiles[y + dy]?.[x + dx] === '#')
          if (nearWall) out.push({ key: 'fern', x, y, originY: 1 })
        }
      }
    }
  }
  return out
}

/** Floor tint/flip variation — pure. */
export function floorStyle(x, y) {
  const h = cellHash(x, y, 3)
  return {
    flipX: (x + y) % 2 === 0,
    tint: h % 3 === 0 ? 0xdde8dd : h % 3 === 1 ? 0xffffff : 0xe8f0e4,
  }
}
