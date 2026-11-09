import { describe, it, expect } from 'vitest'
import { windGustFxSpec } from '../src/fx/windFx.js'

describe('windGustFxSpec', () => {
  it('stays visible ~700ms and travels in front of Merlin (short on-screen travel)', () => {
    const s = windGustFxSpec({ x: 100, y: 200 }, 'E')
    expect(s.holdMs + s.fadeMs).toBeGreaterThanOrEqual(650)
    expect(s.travelPx).toBeGreaterThanOrEqual(60)
    expect(s.travelPx).toBeLessThanOrEqual(90)
    expect(s.scale).toBeGreaterThanOrEqual(2)
    expect(s.x).toBeGreaterThan(100)
    expect(s.y).toBe(200)
  })
})
