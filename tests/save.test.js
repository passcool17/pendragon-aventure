import { describe, it, expect } from 'vitest'
import { createNewGame, addFragment, unlockSpell } from '../src/state/gameState.js'
import {
  SAVE_KEY, serialize, deserialize, saveToStorage, loadFromStorage,
} from '../src/state/save.js'

function memStorage(map = new Map()) {
  return {
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => { map.set(k, String(v)) },
    removeItem: (k) => { map.delete(k) },
  }
}

describe('serialize round-trip', () => {
  it('keeps fragments and spells', () => {
    let s = unlockSpell(createNewGame(), 'light')
    s = addFragment(s, 'forest')
    const again = deserialize(serialize(s))
    expect(again.fragments).toEqual(['forest'])
    expect(again.spellsUnlocked).toEqual(['light'])
  })
})

describe('deserialize', () => {
  it('rejects bad version', () => {
    expect(() => deserialize(JSON.stringify({ version: 99 }))).toThrow()
  })
  it('rejects garbage', () => {
    expect(() => deserialize('{')).toThrow()
  })
})

describe('storage', () => {
  it('saves and loads under fixed key', () => {
    const storage = memStorage()
    const s = addFragment(createNewGame(), 'ruins')
    expect(saveToStorage(s, storage).ok).toBe(true)
    expect(storage.getItem(SAVE_KEY)).toBeTruthy()
    const loaded = loadFromStorage(storage)
    expect(loaded.ok).toBe(true)
    expect(loaded.state.fragments).toEqual(['ruins'])
  })
  it('signals new-game on corrupt data', () => {
    const storage = memStorage(new Map([[SAVE_KEY, 'nope']]))
    const r = loadFromStorage(storage)
    expect(r.ok).toBe(false)
    expect(r.recover).toBe('new-game')
    expect(r.message).toMatch(/Nouvelle partie|illisible|corrompue/i)
  })
  it('signals memory-only when setItem throws', () => {
    const storage = {
      getItem: () => null,
      setItem: () => { throw new Error('quota') },
      removeItem: () => {},
    }
    const r = saveToStorage(createNewGame(), storage)
    expect(r.ok).toBe(false)
    expect(r.message).toMatch(/Reprise indisponible/)
  })
})
