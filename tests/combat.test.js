import { describe, it, expect } from 'vitest'
import { MELEE_DAMAGE, SPELL_COST, canMelee, meleeHit } from '../src/combat/combat.js'
import { createNewGame, spendMana } from '../src/state/gameState.js'

describe('combat constants', () => {
  it('melee deals 1 and spell costs match spec', () => {
    expect(MELEE_DAMAGE).toBe(1)
    expect(SPELL_COST.light).toBe(0.25)
    expect(SPELL_COST.wind).toBe(0.2)
    expect(SPELL_COST.nature).toBe(0.3)
  })
})

describe('canMelee', () => {
  it('respects 300ms cooldown', () => {
    expect(canMelee(createNewGame(), 1000, 800)).toBe(false)
    expect(canMelee(createNewGame(), 1000, 700)).toBe(true)
  })
})

describe('meleeHit', () => {
  it('hits adjacent tile in facing direction only', () => {
    expect(meleeHit('E', { x: 2, y: 2 }, { x: 3, y: 2 })).toBe(true)
    expect(meleeHit('E', { x: 2, y: 2 }, { x: 1, y: 2 })).toBe(false)
    expect(meleeHit('E', { x: 2, y: 2 }, { x: 4, y: 2 })).toBe(false)
  })
})

describe('spell afford', () => {
  it('light costs 0.25 mana', () => {
    const s = spendMana(createNewGame(), SPELL_COST.light)
    expect(s.mana).toBeCloseTo(0.75)
  })
})
