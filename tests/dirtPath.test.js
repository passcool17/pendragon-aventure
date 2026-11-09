import { describe, it, expect } from 'vitest'
import fs from 'node:fs'

describe('dirt path fill', () => {
  it('does not stamp chemin-terre on the path blob', () => {
    const src = fs.readFileSync(new URL('../src/scenes/WorldScene.js', import.meta.url), 'utf8')
    expect(src).toMatch(/drawDirtPath/)
    expect(src).not.toMatch(/stampMaskedTexture\(\s*this,\s*'chemin-terre'/)
  })
})
