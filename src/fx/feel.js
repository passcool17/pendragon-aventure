/** Combat feel helpers (pure) — texture keys: melee-arc, light-orb, wind-puff */

export const FACING_DELTA = {
  N: { x: 0, y: -1 },
  S: { x: 0, y: 1 },
  E: { x: 1, y: 0 },
  W: { x: -1, y: 0 },
}

export const FACING_ANGLE = {
  E: 0,
  S: Math.PI / 2,
  W: Math.PI,
  N: -Math.PI / 2,
}

export function meleeTargetTile(tile, facing) {
  const d = FACING_DELTA[facing] || FACING_DELTA.S
  return { x: tile.x + d.x, y: tile.y + d.y }
}

export function knockbackTile(tile, facing, isFree) {
  const d = FACING_DELTA[facing] || FACING_DELTA.S
  const next = { x: tile.x + d.x, y: tile.y + d.y }
  if (!isFree(next.x, next.y)) return null
  return next
}

export function lightOrbVelocity(facing, speedPx = 180) {
  const d = FACING_DELTA[facing] || FACING_DELTA.S
  return { vx: d.x * speedPx, vy: d.y * speedPx }
}

export function forwardOffset(facing, distPx = 10) {
  const d = FACING_DELTA[facing] || FACING_DELTA.S
  return { x: d.x * distPx, y: d.y * distPx }
}

export function windGustTiles(origin, facing) {
  const d = FACING_DELTA[facing] || FACING_DELTA.S
  return [
    { x: origin.x + d.x, y: origin.y + d.y },
    { x: origin.x + d.x * 2, y: origin.y + d.y * 2 },
  ]
}

export function shouldFlipMerlin(facing) {
  return facing === 'W'
}
