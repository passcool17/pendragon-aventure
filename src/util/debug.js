import { createNewGame, unlockSpell, addFragment, setFlag, bumpHeartsMax } from '../state/gameState.js'

/** Parse ?level=forest&debug=1&spells=all&fragments=all */
export function parseDebugParams(search = '') {
  const q = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search)
  return {
    level: q.get('level') || q.get('debug') || null,
    spellsAll: q.get('spells') === 'all',
    fragmentsAll: q.get('fragments') === 'all',
    god: q.get('god') === '1',
  }
}

export function applyDebugState(base, opts) {
  let s = base || createNewGame()
  s = setFlag(s, 'questStarted', true)
  if (opts.spellsAll || opts.level) {
    s = unlockSpell(s, 'light')
    s = unlockSpell(s, 'wind')
    s = unlockSpell(s, 'nature')
  }
  if (opts.fragmentsAll) {
    s = addFragment(s, 'forest')
    s = addFragment(s, 'ruins')
    s = addFragment(s, 'sanctuary')
  }
  // partial unlocks by target level
  if (opts.level === 'ruins' || opts.level?.startsWith('ruins')) {
    s = addFragment(s, 'forest')
    s = unlockSpell(s, 'light')
    s = unlockSpell(s, 'wind')
  }
  if (opts.level === 'sanctuary' || opts.level?.startsWith('sanctuary')) {
    s = addFragment(s, 'forest')
    s = addFragment(s, 'ruins')
    s = unlockSpell(s, 'light')
    s = unlockSpell(s, 'wind')
    s = unlockSpell(s, 'nature')
  }
  if (opts.level === 'boss-final') {
    s = addFragment(s, 'forest')
    s = addFragment(s, 'ruins')
    s = addFragment(s, 'sanctuary')
    s = unlockSpell(s, 'light')
    s = unlockSpell(s, 'wind')
    s = unlockSpell(s, 'nature')
  }
  if (opts.god) s = bumpHeartsMax({ ...s, hearts: 5, heartsMax: 5 }, 0)
  return s
}

export const DEBUG_LEVELS = [
  'hub', 'forest', 'forest-dungeon', 'forest-boss',
  'ruins', 'ruins-dungeon', 'ruins-boss',
  'sanctuary', 'sanctuary-dungeon', 'sanctuary-boss',
  'boss-final',
]
