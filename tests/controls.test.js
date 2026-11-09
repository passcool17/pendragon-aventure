import { describe, it, expect } from 'vitest'
import { vectorFromKeys, cycleSpell } from '../src/input/controls.js'

describe('vectorFromKeys', () => {
  it('wasd and arrows', () => {
    expect(vectorFromKeys({ KeyW: true })).toEqual({ x: 0, y: -1 })
    expect(vectorFromKeys({ ArrowRight: true })).toEqual({ x: 1, y: 0 })
  })
})

describe('cycleSpell', () => {
  it('cycles unlocked only', () => {
    expect(cycleSpell(['light', 'wind'], 'light', 1)).toBe('wind')
    expect(cycleSpell(['light', 'wind'], 'wind', 1)).toBe('light')
  })
})
