import { describe, it, expect } from 'vitest'
import {
  createNewGame, applyDamage, regenMana, unlockSpell,
  addFragment, spendMana, healFull,
} from '../src/state/gameState.js'

describe('createNewGame', () => {
  it('starts with 3 hearts, empty spells and fragments', () => {
    const s = createNewGame()
    expect(s.version).toBe(1)
    expect(s.hearts).toBe(3)
    expect(s.heartsMax).toBe(3)
    expect(s.mana).toBe(1)
    expect(s.spellsUnlocked).toEqual([])
    expect(s.activeSpell).toBe(null)
    expect(s.fragments).toEqual([])
    expect(s.position.scene).toBe('hub')
  })
})

describe('applyDamage', () => {
  it('reduces hearts and floors at 0', () => {
    let s = createNewGame()
    s = applyDamage(s, 1)
    expect(s.hearts).toBe(2)
    s = applyDamage(s, 10)
    expect(s.hearts).toBe(0)
  })
})

describe('regenMana', () => {
  it('fills in 6 seconds from empty', () => {
    let s = { ...createNewGame(), mana: 0 }
    s = regenMana(s, 6)
    expect(s.mana).toBe(1)
  })
  it('does not exceed 1', () => {
    expect(regenMana(createNewGame(), 10).mana).toBe(1)
  })
})

describe('spells and fragments', () => {
  it('unlocks light and sets active', () => {
    const s = unlockSpell(createNewGame(), 'light')
    expect(s.spellsUnlocked).toEqual(['light'])
    expect(s.activeSpell).toBe('light')
  })
  it('adds unique fragments', () => {
    let s = addFragment(createNewGame(), 'forest')
    s = addFragment(s, 'forest')
    expect(s.fragments).toEqual(['forest'])
  })
})

describe('spendMana', () => {
  it('returns null if not enough', () => {
    const s = { ...createNewGame(), mana: 0.1 }
    expect(spendMana(s, 0.25)).toBe(null)
  })
  it('subtracts cost', () => {
    const s = spendMana(createNewGame(), 0.25)
    expect(s.mana).toBeCloseTo(0.75)
  })
})

describe('healFull', () => {
  it('restores hearts to max', () => {
    const hurt = applyDamage(createNewGame(), 2)
    expect(healFull(hurt).hearts).toBe(3)
  })
})
