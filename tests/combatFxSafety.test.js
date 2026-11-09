import { describe, it, expect } from 'vitest'
import fs from 'node:fs'
import { windGustFxSpec } from '../src/fx/windFx.js'

describe('combat FX safety (WebGL non-regression)', () => {
  const world = fs.readFileSync(new URL('../src/scenes/WorldScene.js', import.meta.url), 'utf8')
  const controls = fs.readFileSync(new URL('../src/input/controls.js', import.meta.url), 'utf8')
  const ui = fs.readFileSync(new URL('../src/scenes/UIScene.js', import.meta.url), 'utf8')
  const main = fs.readFileSync(new URL('../src/main.js', import.meta.url), 'utf8')
  const smooth = fs.readFileSync(new URL('../src/world/smoothGround.js', import.meta.url), 'utf8')

  it('forces WEBGL so Canvas headless cannot hide WebGL-only regressions', () => {
    expect(main).toMatch(/type:\s*Phaser\.WEBGL/)
  })

  it('never stamps GeometryMask / RT over the live ground path', () => {
    expect(world).not.toMatch(/stampMaskedTexture\s*\(/)
    expect(world).not.toMatch(/createGeometryMask/)
    expect(world).not.toMatch(/\.setMask\s*\(/)
    // helper may still exist unused for docs, but WorldScene must not call it
    expect(smooth).toMatch(/export function stampMaskedTexture/)
  })

  it('spawns combat FX above canopy with NORMAL blend and no inherited mask', () => {
    expect(world).toMatch(/spawnCombatFx/)
    expect(world).toMatch(/setDepth\(25000\)/)
    expect(world).toMatch(/BlendModes\.NORMAL/)
    expect(world).toMatch(/clearMask\(true\)/)
  })

  it('UIScene does not clear the WebGL buffer over World FX', () => {
    expect(ui).toMatch(/clearBeforeRender\s*=\s*false/)
  })

  it('melee arc holds opaque long enough for 100–250ms screenshots', () => {
    expect(world).toMatch(/delayedCall\(200/)
    expect(world).toMatch(/duration:\s*300/)
  })

  it('wind FX lasts ~700ms', () => {
    const s = windGustFxSpec({ x: 0, y: 0 }, 'E')
    expect(s.holdMs + s.fadeMs).toBeGreaterThanOrEqual(650)
    expect(s.scale).toBeGreaterThanOrEqual(2.5)
  })

  it('consume is edge-only (does not clear down[])', () => {
    expect(controls).toMatch(/if \(!latched\[code\]\) return false/)
    expect(controls).toMatch(/latched\[code\] = false/)
    const start = controls.indexOf('consume(code)')
    const body = controls.slice(start, start + 200)
    expect(body).not.toMatch(/down\[code\]\s*=\s*false/)
  })
})
