import { describe, it, expect } from 'vitest'
import { windGustFxSpec } from '../src/fx/windFx.js'

describe('windGustFxSpec', () => {
  it('places a large hold-then-fade gust in front of Merlin', () => {
    const s = windGustFxSpec({ x: 100, y: 200 }, 'E')
    expect(s.key).toBe('rafale-vent')
    expect(s.x).toBe(128)
    expect(s.y).toBe(200)
    expect(s.scale).toBeGreaterThanOrEqual(2)
    expect(s.depth).toBeGreaterThanOrEqual(10000)
    expect(s.holdMs + s.fadeMs).toBeGreaterThanOrEqual(300)
    expect(s.holdMs).toBeGreaterThanOrEqual(150)
  })

  it('faces south with positive y offset', () => {
    const s = windGustFxSpec({ x: 50, y: 50 }, 'S')
    expect(s.y).toBeGreaterThan(50)
  })
})
