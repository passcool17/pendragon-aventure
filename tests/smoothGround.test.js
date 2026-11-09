import { describe, it, expect } from 'vitest'
import {
  pathCells, waterCells, pointInBlob, blobRadius, bridgeCells,
} from '../src/world/smoothGround.js'

describe('smoothGround', () => {
  const tiles = [
    '......',
    '.~~=..',
    '.PP=..',
    '.~~=..',
    '......',
  ]

  it('collects water including bridge marks', () => {
    expect(waterCells(tiles).length).toBe(6)
    expect(bridgeCells(tiles)).toEqual([{ x: 1, y: 2 }, { x: 2, y: 2 }])
  })

  it('path cells include = and P', () => {
    const p = pathCells(tiles)
    expect(p.some((c) => c.x === 3 && c.y === 1)).toBe(true)
    expect(p.some((c) => c.x === 1 && c.y === 2)).toBe(true)
  })

  it('pointInBlob hits water body but carves bridge', () => {
    const water = waterCells(tiles)
    const bridge = bridgeCells(tiles)
    const tile = 32
    // center of water cell (1,1)
    expect(pointInBlob(1 * 32 + 16, 1 * 32 + 16, water, tile, bridge)).toBe(true)
    // center of bridge cell carved out
    expect(pointInBlob(1 * 32 + 16, 2 * 32 + 16, water, tile, bridge)).toBe(false)
  })

  it('blob radius overlaps neighbors', () => {
    expect(blobRadius(32)).toBeGreaterThan(32 * 0.5)
  })
})
