import { describe, it, expect } from 'vitest'
import { lightBrazier, allBraziersLit, extinguishBrazier } from '../src/puzzles/braziers.js'
import { pushBlock } from '../src/puzzles/windPush.js'
import { growBridge } from '../src/puzzles/natureBridge.js'
import { createBossPhase, strikeTotem, bossHit, bossDefeated } from '../src/puzzles/bossTotems.js'

describe('braziers', () => {
  it('needs three lit to unlock', () => {
    let lit = [false, false, false]
    lit = lightBrazier(lit, 0)
    lit = lightBrazier(lit, 1)
    expect(allBraziersLit(lit)).toBe(false)
    lit = lightBrazier(lit, 2)
    expect(allBraziersLit(lit)).toBe(true)
  })
  it('can be extinguished then relit', () => {
    let lit = [true, true, true]
    lit = extinguishBrazier(lit, 1)
    expect(allBraziersLit(lit)).toBe(false)
    lit = lightBrazier(lit, 1)
    expect(allBraziersLit(lit)).toBe(true)
  })
})

describe('windPush', () => {
  it('moves one orthogonal tile onto walkable empty cell', () => {
    const grid = [
      [true, true, true],
      [true, true, true],
      [true, true, true],
    ]
    expect(pushBlock(grid, { x: 1, y: 1 }, 'E')).toEqual({ x: 2, y: 1 })
  })
  it('returns null if blocked or out of bounds', () => {
    const grid = [
      [true, false, true],
      [true, true, true],
    ]
    expect(pushBlock(grid, { x: 0, y: 0 }, 'E')).toBe(null)
    expect(pushBlock(grid, { x: 0, y: 0 }, 'N')).toBe(null)
  })
})

describe('natureBridge', () => {
  it('grows exactly 3 tiles from seed', () => {
    const tiles = growBridge({ x: 2, y: 4 }, 'E')
    expect(tiles).toEqual([
      { x: 3, y: 4 },
      { x: 4, y: 4 },
      { x: 5, y: 4 },
    ])
  })
})

describe('bossTotems', () => {
  it('becomes vulnerable 8s after three totems down', () => {
    let p = createBossPhase()
    p = strikeTotem(p, 'light', 1000)
    p = strikeTotem(p, 'wind', 1000)
    p = strikeTotem(p, 'nature', 1000)
    expect(p.vulnerableUntil).toBe(9000)
    expect(bossDefeated(p)).toBe(false)
  })
  it('defeats after 6 melee hits during vulnerability', () => {
    let p = createBossPhase()
    p = strikeTotem(p, 'light', 0)
    p = strikeTotem(p, 'wind', 0)
    p = strikeTotem(p, 'nature', 0)
    for (let i = 0; i < 6; i++) p = bossHit(p, 'melee', 100)
    expect(bossDefeated(p)).toBe(true)
  })
  it('defeats after 3 light hits during vulnerability', () => {
    let p = createBossPhase()
    p = strikeTotem(p, 'light', 0)
    p = strikeTotem(p, 'wind', 0)
    p = strikeTotem(p, 'nature', 0)
    p = bossHit(p, 'light', 100)
    p = bossHit(p, 'light', 100)
    p = bossHit(p, 'light', 100)
    expect(bossDefeated(p)).toBe(true)
  })
  it('ignores hits outside vulnerability window', () => {
    let p = createBossPhase()
    p = bossHit(p, 'melee', 50)
    expect(p.hits).toBe(0)
  })
})
