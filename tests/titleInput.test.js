import { describe, it, expect } from 'vitest'
import { titleActionFromKey } from '../src/ui/titleInput.js'

describe('titleActionFromKey', () => {
  it('starts on Enter and Space', () => {
    expect(titleActionFromKey('Enter')).toBe('start')
    expect(titleActionFromKey('Space')).toBe('start')
    expect(titleActionFromKey('NumpadEnter')).toBe('start')
  })
  it('ignores unrelated keys', () => {
    expect(titleActionFromKey('KeyW')).toBe(null)
    expect(titleActionFromKey('Escape')).toBe(null)
  })
})
