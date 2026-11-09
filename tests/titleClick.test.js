import { describe, it, expect } from 'vitest'
import { titleButtonScreenPos } from '../src/ui/titleClick.js'

describe('titleButtonScreenPos', () => {
  it('maps Nouvelle partie to ~center-x at 1920x1072 FIT', () => {
    const p = titleButtonScreenPos({ viewW: 1920, viewH: 1072 })
    expect(p.x).toBeGreaterThan(900)
    expect(p.x).toBeLessThan(1020)
    expect(p.y).toBeGreaterThan(450)
    expect(p.y).toBeLessThan(520)
  })
})
