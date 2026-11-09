/** Tile char helpers + grass variants. Path/water visuals use smoothGround (not wang autotile). */

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

export function herbeKey(x, y) {
  const h = Math.abs((x * 374761 + y * 668265) | 0) % 3
  return ['herbe-1', 'herbe-2', 'herbe-3'][h]
}

/** Ground underlay only — never returns chemin/eau wang tiles. */
export function textureForCell(tiles, x, y) {
  return herbeKey(x, y)
}

/** @deprecated kept for tests that still mention names — map to grass. */
export function cheminKey() { return 'herbe-1' }
export function eauKey() { return 'herbe-1' }
