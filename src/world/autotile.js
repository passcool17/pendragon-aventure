/** Tile char helpers + grass variants. Path/water visuals use smoothGround. */

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
  const h = Math.abs((x * 374761 + y * 668265) | 0)
  return `herbe-var-${h % 6}`
}

/** Ground underlay — noisy grass variants (fallback herbe-1). */
export function textureForCell(tiles, x, y) {
  return herbeKey(x, y)
}

export function cheminKey() { return 'dirt-fill' }
export function eauKey() { return 'herbe-1' }
