import { isPathChar, isWaterChar, isBridgeChar } from './autotile.js'

export function cellHash(x, y, salt = 0) {
  return Math.abs((x * 374761 + y * 668265 + salt * 127) | 0) % 1000
}

function banned(level, x, y) {
  if (level.spawn?.x === x && level.spawn?.y === y) return true
  for (const ex of level.exits || []) {
    if (ex.tile[0] === x && ex.tile[1] === y) return true
  }
  for (const e of level.enemies || []) {
    if (e.x === x && e.y === y) return true
  }
  for (const n of level.npcs || []) {
    if (n.x === x && n.y === y) return true
  }
  for (const p of level.puzzles || []) {
    for (const t of p.tiles || []) if (t[0] === x && t[1] === y) return true
    for (const b of p.blocks || []) if (b.x === x && b.y === y) return true
    for (const s of p.seeds || []) if (s.x === x && s.y === y) return true
  }
  return false
}

/** Dense forest fill: ferns, bushes, rocks on grass; trees on border. */
export function planDecor(level) {
  const out = []
  const id = level.id || ''
  for (let y = 0; y < level.height; y++) {
    for (let x = 0; x < level.width; x++) {
      if (banned(level, x, y)) continue
      const ch = level.tiles[y][x]
      const h = cellHash(x, y, id.length)
      if (ch === '.' || ch === ',') {
        if (h % 3 === 0) out.push({ key: h % 2 ? 'fougere-1' : 'fougere-2', x, y, originY: 1, solid: false })
        else if (h % 7 === 2) out.push({ key: h % 2 ? 'buisson-1' : 'buisson-2', x, y, originY: 1, solid: false })
        else if (h % 13 === 5) out.push({ key: 'rocher-petit', x, y, originY: 1, solid: true })
        else if (h % 19 === 1 && (x <= 2 || x >= level.width - 3 || y <= 2 || y >= level.height - 3)) {
          out.push({ key: h % 2 ? 'arbre-grand-1' : 'arbre-grand-2', x, y, originY: 1, solid: true, canopy: true })
        }
      }
      if (ch === '#' && h % 3 === 0) {
        out.push({ key: h % 2 ? 'arbre-grand-1' : 'arbre-grand-2', x, y, originY: 1, solid: true, canopy: true })
      }
      if ((isPathChar(ch) || isBridgeChar(ch)) && h % 17 === 7) {
        out.push({ key: 'fougere-1', x, y, originY: 1, scale: 0.75, solid: false })
      }
      if (!isWaterChar(ch) && !isBridgeChar(ch) && !isPathChar(ch) && ch !== '#' && h % 29 === 0) {
        out.push({ key: 'buisson-2', x, y, originY: 1, solid: false })
      }
    }
  }
  return out
}
