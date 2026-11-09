import { describe, it, expect } from 'vitest'
import { pushBlock } from '../src/puzzles/windPush.js'
import { createNewGame, unlockSpell, addFragment } from '../src/state/gameState.js'

describe('ruins headless', () => {
  it('two blocks on plates then fragment', () => {
    const grid = Array.from({ length: 5 }, () => Array(5).fill(true))
    let b1 = { x: 1, y: 1 }
    let b2 = { x: 1, y: 3 }
    b1 = pushBlock(grid, b1, 'E')
    b2 = pushBlock(grid, b2, 'E')
    expect(b1).toEqual({ x: 2, y: 1 })
    expect(b2).toEqual({ x: 2, y: 3 })
    let s = unlockSpell(createNewGame(), 'wind')
    s = addFragment(s, 'ruins')
    expect(s.fragments).toContain('ruins')
  })
})
