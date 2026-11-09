import { describe, it, expect } from 'vitest'
import { growBridge } from '../src/puzzles/natureBridge.js'
import { isWalkable } from '../src/world/tilemap.js'
import { createNewGame, unlockSpell, addFragment } from '../src/state/gameState.js'

describe('sanctuary bridges', () => {
  it('marks three bridge tiles walkable', () => {
    const level = { width: 8, height: 5, tiles: Array(5).fill('~~~~~~~~') }
    const tiles = growBridge({ x: 1, y: 2 }, 'E')
    expect(tiles).toHaveLength(3)
    const extra = new Set(tiles.map((t) => `${t.x},${t.y}`))
    expect(isWalkable(level, 2, 2, extra)).toBe(true)
    let s = unlockSpell(createNewGame(), 'nature')
    s = addFragment(s, 'sanctuary')
    expect(s.fragments).toContain('sanctuary')
  })
})
