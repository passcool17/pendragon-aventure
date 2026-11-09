/** Autotile chemin / eau — Créa PNG orientation.
 * eau-berge-n / chemin-bord-n: material on the NORTH half of the tile.
 * eau-coin-ext-ne: material in the NE quadrant.
 * Therefore a water cell on the south rim (no south neighbor) uses eau-berge-n.
 */

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

function at(tiles, x, y) {
  const h = tiles.length
  const w = tiles[0]?.length || 0
  if (y < 0 || y >= h || x < 0 || x >= w) return null
  return tiles[y][x]
}

function neighborMask(tiles, x, y, pred) {
  let m = 0
  if (pred(at(tiles, x, y - 1))) m |= N
  if (pred(at(tiles, x + 1, y))) m |= E
  if (pred(at(tiles, x, y + 1))) m |= S
  if (pred(at(tiles, x - 1, y))) m |= W
  return m
}

function diag(tiles, x, y, pred) {
  return {
    ne: !!pred(at(tiles, x + 1, y - 1)),
    no: !!pred(at(tiles, x - 1, y - 1)),
    se: !!pred(at(tiles, x + 1, y + 1)),
    so: !!pred(at(tiles, x - 1, y + 1)),
  }
}

function pickKey(kind, tiles, x, y, pred) {
  const fill = kind === 'eau' ? 'eau-ruisseau' : 'chemin-terre'
  const edge = (missing) => {
    // grass toward `missing` ⇒ material on the opposite side of the PNG
    const map = kind === 'eau'
      ? { N: 'eau-berge-s', S: 'eau-berge-n', E: 'eau-berge-o', W: 'eau-berge-e' }
      : { N: 'chemin-bord-s', S: 'chemin-bord-n', E: 'chemin-bord-o', W: 'chemin-bord-e' }
    return map[missing]
  }
  const ext = (quad) => (kind === 'eau' ? `eau-coin-ext-${quad}` : `chemin-coin-ext-${quad}`)
  const inn = (quad) => (kind === 'eau' ? `eau-coin-int-${quad}` : `chemin-coin-int-${quad}`)

  const m = neighborMask(tiles, x, y, pred)
  const ALL = N | E | S | W

  if (m === ALL) {
    const d = diag(tiles, x, y, pred)
    if (!d.ne) return inn('ne')
    if (!d.no) return inn('no')
    if (!d.se) return inn('se')
    if (!d.so) return inn('so')
    return fill
  }

  if (m === (E | S | W)) return edge('N')
  if (m === (N | E | W)) return edge('S')
  if (m === (N | S | W)) return edge('E')
  if (m === (N | E | S)) return edge('W')

  // Outer corner: material fills the quadrant toward both neighbors
  if (m === (E | S)) return ext('se')
  if (m === (S | W)) return ext('so')
  if (m === (N | E)) return ext('ne')
  if (m === (N | W)) return ext('no')

  if (m === (N | S) || m === (E | W)) return fill
  if (m === N) return edge('S')
  if (m === S) return edge('N')
  if (m === E) return edge('W')
  if (m === W) return edge('E')
  return fill
}

export function cheminKey(tiles, x, y) {
  return pickKey('chemin', tiles, x, y, (ch) => ch && (isPathChar(ch) || isBridgeChar(ch)))
}

export function eauKey(tiles, x, y) {
  return pickKey('eau', tiles, x, y, (ch) => ch && (isWaterChar(ch) || isBridgeChar(ch)))
}

export function herbeKey(x, y) {
  const h = Math.abs((x * 374761 + y * 668265) | 0) % 3
  return ['herbe-1', 'herbe-2', 'herbe-3'][h]
}

export function textureForCell(tiles, x, y) {
  const ch = tiles[y][x]
  if (isBridgeChar(ch)) return 'pont-pierre'
  if (isWaterChar(ch)) return eauKey(tiles, x, y)
  if (isPathChar(ch)) return cheminKey(tiles, x, y)
  return herbeKey(x, y)
}
