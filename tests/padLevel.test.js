import { describe, it, expect } from 'vitest'
import { padLevelToView } from '../src/data/padLevel.js'
import hub from '../src/data/hub.json'
import forest from '../src/data/forest.json'

describe('padLevelToView', () => {
  it('pads hub to at least 20x12 so camera has no empty strip', () => {
    const p = padLevelToView(hub, 20, 12)
    expect(p.width).toBeGreaterThanOrEqual(20)
    expect(p.height).toBeGreaterThanOrEqual(12)
    expect(p.tiles).toHaveLength(p.height)
    expect(p.tiles[0]).toHaveLength(p.width)
    expect(p.spawn).toEqual(hub.spawn)
  })

  it('leaves forest width intact when already 20+', () => {
    const p = padLevelToView(forest, 20, 12)
    expect(p.width).toBe(forest.width)
    expect(p.height).toBe(forest.height)
  })
})
