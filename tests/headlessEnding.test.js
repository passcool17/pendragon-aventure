import { describe, it, expect } from 'vitest'
import { createBossPhase, strikeTotem, bossHit, bossDefeated } from '../src/puzzles/bossTotems.js'
import { createNewGame, addFragment } from '../src/state/gameState.js'
import { canEnter } from '../src/world/dialogue.js'

describe('ending', () => {
  it('three fragments open final and boss can fall', () => {
    let s = createNewGame()
    s = addFragment(addFragment(addFragment(s, 'forest'), 'ruins'), 'sanctuary')
    expect(canEnter('boss-final', s)).toBe(true)
    let p = createBossPhase()
    p = strikeTotem(p, 'light', 0)
    p = strikeTotem(p, 'wind', 0)
    p = strikeTotem(p, 'nature', 0)
    for (let i = 0; i < 6; i++) p = bossHit(p, 'melee', 10)
    expect(bossDefeated(p)).toBe(true)
  })
})
