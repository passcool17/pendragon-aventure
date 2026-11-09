import { SPELL_COST } from '../combat/combat.js'
import { spendMana } from '../state/gameState.js'

const DELTA = { N: [0, -1], S: [0, 1], E: [1, 0], W: [-1, 0] }

export function castSpell(state, spell, origin, facing) {
  if (!state.spellsUnlocked.includes(spell)) return { state, effect: null }
  const cost = SPELL_COST[spell]
  const next = spendMana(state, cost)
  if (!next) return { state, effect: null }
  const [dx, dy] = DELTA[facing] || [0, 1]
  if (spell === 'light') {
    return {
      state: next,
      effect: { type: 'projectile', spell, x: origin.x, y: origin.y, dx, dy, speed: 140 },
    }
  }
  if (spell === 'wind') {
    return {
      state: next,
      effect: { type: 'push', spell, x: origin.x + dx, y: origin.y + dy, dir: facing },
    }
  }
  return {
    state: next,
    effect: { type: 'grow', spell, x: origin.x, y: origin.y, dir: facing },
  }
}
