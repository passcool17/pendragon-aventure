import { describe, it, expect } from 'vitest'
import { windGustFxSpec, combatFxAxisError } from '../src/fx/windFx.js'

describe('windGustFxSpec', () => {
  it('stays visible ~600ms, integer scale, axis-aligned', () => {
    const p = { x: 100, y: 200 }
    const s = windGustFxSpec(p, 'E')
    expect(s.holdMs + s.fadeMs).toBeGreaterThanOrEqual(600)
    expect(s.scale).toBe(1)
    expect(s.key).toBe('fx-vent')
    expect(combatFxAxisError(p, 'E', s).error).toBeLessThan(0.01)
    const south = windGustFxSpec(p, 'S')
    expect(south.x).toBe(p.x)
    expect(south.travelPx).toBeLessThanOrEqual(40)
    expect(combatFxAxisError(p, 'S', south).error).toBeLessThan(0.01)
  })
})
