import { describe, it, expect } from 'vitest'
import { createNewGame, unlockSpell, addFragment } from '../src/state/gameState.js'
import { serialize, deserialize } from '../src/state/save.js'
import { lightBrazier, allBraziersLit } from '../src/puzzles/braziers.js'

describe('forest progression headless', () => {
  it('new game → light → braziers → fragment persists', () => {
    let s = unlockSpell(createNewGame(), 'light')
    let lit = [false, false, false]
    lit = lightBrazier(lightBrazier(lightBrazier(lit, 0), 1), 2)
    expect(allBraziersLit(lit)).toBe(true)
    s = addFragment(s, 'forest')
    const again = deserialize(serialize(s))
    expect(again.fragments).toEqual(['forest'])
    expect(again.spellsUnlocked).toContain('light')
  })
})
