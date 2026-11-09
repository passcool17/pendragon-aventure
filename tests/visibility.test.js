import { describe, it, expect } from 'vitest'
import { shouldFreeze } from '../src/util/visibility.js'

describe('shouldFreeze', () => {
  it('freezes when document hidden', () => {
    expect(shouldFreeze('hidden')).toBe(true)
    expect(shouldFreeze('visible')).toBe(false)
  })
})
