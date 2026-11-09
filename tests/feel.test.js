import { describe, it, expect } from 'vitest'
import {
  meleeTargetTile, knockbackTile, lightOrbVelocity,
  forwardOffset, windGustTiles, shouldFlipMerlin, FACING_ANGLE,
} from '../src/fx/feel.js'

describe('meleeTargetTile', () => {
  it('picks adjacent tile by facing', () => {
    expect(meleeTargetTile({ x: 5, y: 5 }, 'E')).toEqual({ x: 6, y: 5 })
    expect(meleeTargetTile({ x: 5, y: 5 }, 'N')).toEqual({ x: 5, y: 4 })
  })
})

describe('knockbackTile', () => {
  it('returns next tile when free', () => {
    expect(knockbackTile({ x: 2, y: 2 }, 'S', () => true)).toEqual({ x: 2, y: 3 })
  })
  it('returns null when blocked', () => {
    expect(knockbackTile({ x: 2, y: 2 }, 'S', () => false)).toBe(null)
  })
})

describe('lightOrbVelocity', () => {
  it('moves east at speed', () => {
    expect(lightOrbVelocity('E', 180)).toEqual({ vx: 180, vy: 0 })
  })
})

describe('forwardOffset', () => {
  it('offsets toward facing', () => {
    expect(forwardOffset('W', 10)).toEqual({ x: -10, y: 0 })
  })
})

describe('windGustTiles', () => {
  it('covers two tiles ahead', () => {
    expect(windGustTiles({ x: 3, y: 3 }, 'E')).toEqual([
      { x: 4, y: 3 },
      { x: 5, y: 3 },
    ])
  })
})

describe('shouldFlipMerlin', () => {
  it('flips only when facing west', () => {
    expect(shouldFlipMerlin('W')).toBe(true)
    expect(shouldFlipMerlin('E')).toBe(false)
  })
})

describe('FACING_ANGLE', () => {
  it('has four directions', () => {
    expect(Object.keys(FACING_ANGLE).sort()).toEqual(['E', 'N', 'S', 'W'])
  })
})
