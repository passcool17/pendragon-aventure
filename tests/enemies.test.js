import { describe, it, expect } from 'vitest'
import { createEnemy, damageEnemy } from '../src/world/enemies.js'

describe('enemies', () => {
  it('shadow-blob dies in one light or two melee', () => {
    let e = createEnemy('shadow-blob', 0, 0)
    expect(e.hp).toBe(2)
    e = damageEnemy(e, 1)
    expect(e.alive).toBe(true)
    e = damageEnemy(e, 1)
    expect(e.alive).toBe(false)
    e = createEnemy('shadow-blob', 0, 0)
    e = damageEnemy(e, 2, 'light')
    expect(e.alive).toBe(false)
  })
})
