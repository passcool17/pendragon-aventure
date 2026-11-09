import { describe, it, expect } from 'vitest'
import { parseDebugParams, applyDebugState } from '../src/util/debug.js'
import { createNewGame } from '../src/state/gameState.js'

describe('debug params', () => {
  it('parses level and flags', () => {
    const p = parseDebugParams('?level=forest&spells=all')
    expect(p.level).toBe('forest')
    expect(p.spellsAll).toBe(true)
  })
  it('unlocks for boss-final jump', () => {
    const s = applyDebugState(createNewGame(), { level: 'boss-final' })
    expect(s.fragments).toHaveLength(3)
    expect(s.spellsUnlocked).toEqual(['light', 'wind', 'nature'])
  })
})
