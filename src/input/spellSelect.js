import { setActiveSpell } from '../state/gameState.js'

export const SPELL_SLOTS = ['light', 'wind', 'nature']

/** Try select spell by slot number 1..3. Locked spells do not change activeSpell. */
export function trySelectSpell(state, slot) {
  const spellId = SPELL_SLOTS[slot - 1]
  if (!spellId) return { ok: false, locked: false, spellId: null, state }
  if (!state.spellsUnlocked.includes(spellId)) {
    return { ok: false, locked: true, spellId, state }
  }
  return { ok: true, locked: false, spellId, state: setActiveSpell(state, spellId) }
}
