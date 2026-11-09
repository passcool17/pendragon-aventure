import { describe, it, expect } from 'vitest'
import { DIALOGUES, getDialogue, canEnter } from '../src/world/dialogue.js'
import { createNewGame, addFragment } from '../src/state/gameState.js'

describe('DIALOGUES', () => {
  it('has four hub NPCs with 2–4 french lines', () => {
    for (const id of ['branoc', 'mael', 'siofra', 'tegen']) {
      const d = getDialogue(id)
      expect(d.lines.length).toBeGreaterThanOrEqual(2)
      expect(d.lines.length).toBeLessThanOrEqual(4)
      expect(d.lines.every((l) => /[a-zA-Zàâäéèêëïîôùûüç]/i.test(l))).toBe(true)
    }
  })
})

describe('canEnter', () => {
  it('gates regions by fragments', () => {
    let s = createNewGame()
    expect(canEnter('forest', s)).toBe(false)
    s = { ...s, flags: { ...s.flags, questStarted: true } }
    expect(canEnter('forest', s)).toBe(true)
    expect(canEnter('ruins', s)).toBe(false)
    s = addFragment(s, 'forest')
    expect(canEnter('ruins', s)).toBe(true)
    s = addFragment(addFragment(s, 'ruins'), 'sanctuary')
    expect(canEnter('boss-final', s)).toBe(true)
  })
})
