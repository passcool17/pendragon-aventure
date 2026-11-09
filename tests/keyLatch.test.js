import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createKeyTracker } from '../src/input/controls.js'

describe('createKeyTracker latch', () => {
  let scene
  let listeners
  beforeEach(() => {
    listeners = {}
    globalThis.window = {
      addEventListener: (type, fn) => { listeners[type] = fn },
      removeEventListener: (type) => { delete listeners[type] },
    }
    scene = { events: { once: vi.fn() } }
  })
  afterEach(() => {
    const cb = scene.events.once.mock.calls.find((c) => c[0] === 'shutdown')?.[1]
    cb?.()
    delete globalThis.window
  })

  it('registers a brief keydown/keyup before consume', () => {
    const keys = createKeyTracker(scene)
    listeners.keydown({ code: 'KeyF', preventDefault() {} })
    listeners.keyup({ code: 'KeyF' })
    expect(keys.consume('KeyF')).toBe(true)
    expect(keys.consume('KeyF')).toBe(false)
  })
})
