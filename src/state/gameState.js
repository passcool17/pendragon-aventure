export function createNewGame() {
  return {
    version: 1,
    hearts: 3,
    heartsMax: 3,
    mana: 1,
    spellsUnlocked: [],
    activeSpell: null,
    fragments: [],
    flags: {},
    position: { scene: 'hub', x: 8, y: 10 },
    checkpoints: ['hub-fire'],
  }
}

export function applyDamage(state, amount) {
  return { ...state, hearts: Math.max(0, state.hearts - amount) }
}

export function regenMana(state, dtSec) {
  const next = Math.min(1, state.mana + dtSec / 6)
  return next === state.mana ? state : { ...state, mana: next }
}

export function unlockSpell(state, id) {
  if (state.spellsUnlocked.includes(id)) return state
  return {
    ...state,
    spellsUnlocked: [...state.spellsUnlocked, id],
    activeSpell: state.activeSpell ?? id,
  }
}

export function addFragment(state, id) {
  if (state.fragments.includes(id)) return state
  return { ...state, fragments: [...state.fragments, id] }
}

export function setFlag(state, key, value = true) {
  if (state.flags[key] === value) return state
  return { ...state, flags: { ...state.flags, [key]: value } }
}

export function spendMana(state, cost) {
  if (state.mana + 1e-9 < cost) return null
  return { ...state, mana: Math.max(0, state.mana - cost) }
}

export function healFull(state) {
  return state.hearts === state.heartsMax ? state : { ...state, hearts: state.heartsMax }
}

export function setActiveSpell(state, id) {
  if (!state.spellsUnlocked.includes(id)) return state
  return { ...state, activeSpell: id }
}

export function bumpHeartsMax(state, by = 1) {
  const heartsMax = Math.min(5, state.heartsMax + by)
  return { ...state, heartsMax, hearts: Math.min(heartsMax, state.hearts + by) }
}

export function setPosition(state, position) {
  return { ...state, position: { ...state.position, ...position } }
}
