export const MELEE_DAMAGE = 1
export const SPELL_COST = { light: 0.25, wind: 0.2, nature: 0.3 }
export const MELEE_COOLDOWN_MS = 300

export function canMelee(_state, nowMs, lastMeleeMs) {
  return nowMs - lastMeleeMs >= MELEE_COOLDOWN_MS
}

const DELTA = { N: [0, -1], S: [0, 1], E: [1, 0], W: [-1, 0] }

export function meleeHit(facing, attackerTile, targetTile) {
  const [dx, dy] = DELTA[facing] || [0, 0]
  return (
    targetTile.x === attackerTile.x + dx &&
    targetTile.y === attackerTile.y + dy
  )
}

export function facingFromVector(x, y) {
  if (Math.abs(x) > Math.abs(y)) return x > 0 ? 'E' : 'W'
  if (y !== 0) return y > 0 ? 'S' : 'N'
  return 'S'
}
