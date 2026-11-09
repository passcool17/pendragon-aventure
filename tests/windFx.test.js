import { describe, it, expect } from 'vitest'
import { windGustFxSpec } from '../src/fx/windFx.js'

describe('windGustFxSpec', () => {
  it('stays visible ~700ms and travels', () => {
    const s = windGustFxSpec({ x: 100, y: 200 }, 'E')
    expect(s.holdMs + s.fadeMs).toBeGreaterThanOrEqual(650)
    expect(s.travelPx).toBeGreaterThanOrEqual(80)
    expect(s.scale).toBeGreaterThanOrEqual(2)
    expect(s.depth).toBeGreaterThanOrEqual(10000)
  })
})
