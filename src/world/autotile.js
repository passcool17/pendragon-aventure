/** Autotile chemin / eau from neighbor mask (Créa manifest rules). */

const N = 1, E = 2, S = 4, W = 8

export function isPathChar(ch) {
  return ch === '=' || ch === 'B' || ch === 'D' || ch === 'X' || ch === 'N' || ch === 'C' || ch === 'T' || ch === 'G'
}

export function isWaterChar(ch) {
  return ch === '~'
}

export function isBridgeChar(ch) {
  return ch === 'P'
}

export function isGrassChar(ch) {
  return ch === '.' || ch === ','
}

function neighborMask(tiles, x, y, pred) {
  let m = 0
  const h = tiles.length
  const w = tiles[0]?.length || 0
  const at = (tx, ty) => (ty >= 0 && ty < h && tx >= 0 && tx < w ? tiles[ty][tx] : null)
  if (pred(at(x, y - 1))) m |= N
  if (pred(at(x + 1, y))) m |= E
  if (pred(at(x, y + 1))) m |= S
  if (pred(at(x - 1, y))) m |= W
  return m
}

/** Pick chemin texture key for a path cell. */
export function cheminKey(tiles, x, y) {
  const path = (ch) => ch && (isPathChar(ch) || isBridgeChar(ch))
  const m = neighborMask(tiles, x, y, path)
  // 4-connected fill
  if (m === (N | E | S | W)) return 'chemin-terre'
  // single edges
  if (m === (E | S | W)) return 'chemin-bord-n'
  if (m === (N | E | W)) return 'chemin-bord-s'
  if (m === (N | S | W)) return 'chemin-bord-e'
  if (m === (N | E | S)) return 'chemin-bord-o'
  // outer corners (two neighbors)
  if (m === (E | S)) return 'chemin-coin-ext-no'
  if (m === (S | W)) return 'chemin-coin-ext-ne'
  if (m === (N | E)) return 'chemin-coin-ext-so'
  if (m === (N | W)) return 'chemin-coin-ext-se'
  // T junctions / ends → nearest edge or fill
  if (m === (N | S)) return 'chemin-terre'
  if (m === (E | W)) return 'chemin-terre'
  if (m === N) return 'chemin-bord-s'
  if (m === S) return 'chemin-bord-n'
  if (m === E) return 'chemin-bord-o'
  if (m === W) return 'chemin-bord-e'
  if (m === 0) return 'chemin-terre'
  return 'chemin-terre'
}

export function eauKey(tiles, x, y) {
  const water = (ch) => ch && (isWaterChar(ch) || isBridgeChar(ch))
  const m = neighborMask(tiles, x, y, water)
  if (m === (N | E | S | W)) return 'eau-ruisseau'
  if (m === (E | S | W)) return 'eau-berge-n'
  if (m === (N | E | W)) return 'eau-berge-s'
  if (m === (N | S | W)) return 'eau-berge-e'
  if (m === (N | E | S)) return 'eau-berge-o'
  if (m === (E | S)) return 'eau-coin-ext-no'
  if (m === (S | W)) return 'eau-coin-ext-ne'
  if (m === (N | E)) return 'eau-coin-ext-so'
  if (m === (N | W)) return 'eau-coin-ext-se'
  if (m === (N | S) || m === (E | W)) return 'eau-ruisseau'
  if (m === N) return 'eau-berge-s'
  if (m === S) return 'eau-berge-n'
  if (m === E) return 'eau-berge-o'
  if (m === W) return 'eau-berge-e'
  return 'eau-ruisseau'
}

export function herbeKey(x, y) {
  const h = Math.abs((x * 374761 + y * 668265) | 0) % 3
  return ['herbe-1', 'herbe-2', 'herbe-3'][h]
}

export function textureForCell(tiles, x, y) {
  const ch = tiles[y][x]
  if (isBridgeChar(ch)) return 'pont-pierre' // overlay handled separately; base under
  if (isWaterChar(ch)) return eauKey(tiles, x, y)
  if (isPathChar(ch)) return cheminKey(tiles, x, y)
  if (ch === '#') return herbeKey(x, y) // blocked grass under canopy
  return herbeKey(x, y)
}
