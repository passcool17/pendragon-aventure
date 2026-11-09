import { describe, it, expect } from 'vitest'
import { createNewGame, unlockSpell, setActiveSpell } from '../src/state/gameState.js'
import { trySelectSpell } from '../src/input/spellSelect.js'

describe('trySelectSpell', () => {
  it('selects unlocked spell by slot 1/2/3', () => {
    let s = createNewGame()
    s = unlockSpell(s, 'light')
    s = unlockSpell(s, 'wind')
    const r = trySelectSpell(s, 2)
    expect(r.ok).toBe(true)
    expect(r.state.activeSpell).toBe('wind')
  })

  it('rejects locked Nature (slot 3) but reports locked', () => {
    let s = createNewGame()
    s = unlockSpell(s, 'light')
    s = unlockSpell(s, 'wind')
    s = setActiveSpell(s, 'wind')
    const r = trySelectSpell(s, 3)
    expect(r.ok).toBe(false)
    expect(r.locked).toBe(true)
    expect(r.spellId).toBe('nature')
    expect(r.state.activeSpell).toBe('wind')
  })

  it('selects Nature when unlocked', () => {
    let s = createNewGame()
    s = unlockSpell(s, 'light')
    s = unlockSpell(s, 'wind')
    s = unlockSpell(s, 'nature')
    expect(trySelectSpell(s, 3).state.activeSpell).toBe('nature')
  })
})
