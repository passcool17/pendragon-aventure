import { describe, it, expect } from 'vitest'
import {
  pathCells, waterCells, pointInBlob, blobRadius, bridgeCells,
  pathEdgeScatter,
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
  })

  it('pointInBlob hits water body but carves bridge', () => {
    const water = waterCells(tiles)
    const bridge = bridgeCells(tiles)
    const tile = 32
    expect(pointInBlob(1 * 32 + 16, 1 * 32 + 16, water, tile, bridge)).toBe(true)
    expect(pointInBlob(1 * 32 + 16, 2 * 32 + 16, water, tile, bridge)).toBe(false)
  })

  it('blob radius overlaps neighbors', () => {
    expect(blobRadius(32)).toBeGreaterThan(32 * 0.5)
  })

  it('edge scatter only on rim cells and stays sparse', () => {
    const path = [
      { x: 1, y: 1 }, { x: 2, y: 1 }, { x: 3, y: 1 },
      { x: 1, y: 2 }, { x: 2, y: 2 }, { x: 3, y: 2 },
      { x: 1, y: 3 }, { x: 2, y: 3 }, { x: 3, y: 3 },
    ]
    const scatter = pathEdgeScatter(path, 32)
    expect(scatter.length).toBeLessThan(path.length)
    // interior (2,2) should never get scatter
    expect(scatter.every((s) => !(Math.abs(s.x - 80) < 1 && Math.abs(s.y - 80) < 1))).toBe(true)
  })
})
