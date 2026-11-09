import { describe, it, expect } from 'vitest'
import fs from 'node:fs'
import {
  meleeFxSpec, lightBeamFxSpec, lightOrbFxSpec,
  windGustFxSpec, windTrailSpecs, natureBurstFxSpec,
} from '../src/fx/combatFx.js'
import { FACING_DELTA } from '../src/fx/feel.js'

describe('combat FX safety (WebGL non-regression)', () => {
  const world = fs.readFileSync(new URL('../src/scenes/WorldScene.js', import.meta.url), 'utf8')
  const controls = fs.readFileSync(new URL('../src/input/controls.js', import.meta.url), 'utf8')
  const ui = fs.readFileSync(new URL('../src/scenes/UIScene.js', import.meta.url), 'utf8')
  const main = fs.readFileSync(new URL('../src/main.js', import.meta.url), 'utf8')
  const placeholders = fs.readFileSync(new URL('../src/gfx/placeholders.js', import.meta.url), 'utf8')

  it('defines solid NORMAL-blend combat textures (Créa streaks vanish under NORMAL)', () => {
    expect(placeholders).toMatch(/fx-rayon/)
    expect(placeholders).toMatch(/fx-orbe/)
    expect(placeholders).toMatch(/fx-nature/)
  })

  it('forces WEBGL so Canvas headless cannot hide WebGL-only regressions', () => {
    expect(main).toMatch(/type:\s*Phaser\.WEBGL/)
  })

  it('never stamps GeometryMask / setMask in WorldScene', () => {
    expect(world).not.toMatch(/stampMaskedTexture\s*\(/)
    expect(world).not.toMatch(/createGeometryMask/)
    expect(world).not.toMatch(/\.setMask\s*\(/)
  })

  it('routes ALL combat FX through spawnCombatFx + playCombatFx (no ADD blend)', () => {
    expect(world).toMatch(/spawnCombatFx/)
    expect(world).toMatch(/playCombatFx/)
    expect(world).toMatch(/setDepth\(25000\)/)
    expect(world).toMatch(/BlendModes\.NORMAL/)
    expect(world).toMatch(/clearMask\(true\)/)
    expect(world).not.toMatch(/BlendModes\.ADD/)
    // each spell + melee uses playCombatFx
    expect(world).toMatch(/playCombatFx\(meleeFxSpec/)
    expect(world).toMatch(/lightBeamFxSpec/)
    expect(world).toMatch(/playCombatFx\(beam/)
    expect(world).toMatch(/playCombatFx\(lightOrbFxSpec/)
    expect(world).toMatch(/playCombatFx\(trail/)
    expect(world).toMatch(/playCombatFx\(natureBurstFxSpec/)
    // no raw add.image for combat texture keys outside spawnCombatFx
    const withoutSpawn = world.replace(/spawnCombatFx[\s\S]*?return img\n  }/, '')
    expect(withoutSpawn).not.toMatch(/add\.image\([^)]*'arc-attaque'/)
    expect(withoutSpawn).not.toMatch(/add\.image\([^)]*'rayon-lumiere'/)
    expect(withoutSpawn).not.toMatch(/add\.image\([^)]*'rafale-vent'/)
  })

  it('UIScene does not clear the WebGL buffer over World FX', () => {
    expect(ui).toMatch(/clearBeforeRender\s*=\s*false/)
  })

  it('consume is edge-only (does not clear down[])', () => {
    expect(controls).toMatch(/if \(!latched\[code\]\) return false/)
    const start = controls.indexOf('consume(code)')
    const body = controls.slice(start, start + 200)
    expect(body).not.toMatch(/down\[code\]\s*=\s*false/)
  })

  it('melee arc holds opaque then fades', () => {
    const s = meleeFxSpec({ x: 100, y: 100 }, 'E')
    expect(s.key).toBe('arc-attaque')
    expect(s.holdMs).toBeGreaterThanOrEqual(160)
    expect(s.x).toBeGreaterThan(100)
  })

  it('light beam is a forward golden bar with hold (not instant fade)', () => {
    const s = lightBeamFxSpec({ x: 100, y: 100 }, 'E')
    expect(s.key).toBe('fx-rayon')
    expect(s.originX).toBe(0)
    expect(s.displayW).toBeGreaterThanOrEqual(180)
    expect(s.holdMs).toBeGreaterThanOrEqual(150)
    expect(s.fadeMs).toBeGreaterThanOrEqual(200)
    const orb = lightOrbFxSpec({ x: 100, y: 100 }, 'E')
    expect(orb.key).toBe('fx-orbe')
    expect(orb.travelPx).toBeGreaterThan(0)
  })

  it('wind spawns in front of Merlin with short on-screen travel', () => {
    const s = windGustFxSpec({ x: 320, y: 200 }, 'E')
    expect(s.key).toBe('rafale-vent')
    expect(s.x).toBeGreaterThan(320)
    expect(s.y).toBe(200)
    expect(s.travelPx).toBeLessThanOrEqual(80)
    expect(s.originX).toBe(0)
    expect(s.originY).toBe(0.5)
    expect(s.holdMs + s.fadeMs).toBeGreaterThanOrEqual(650)
    expect(windTrailSpecs(s)).toHaveLength(3)
  })

  it('wind / light / melee / nature all aim with facing in 4 directions', () => {
    const p = { x: 200, y: 200 }
    for (const dir of ['N', 'S', 'E', 'W']) {
      const d = FACING_DELTA[dir]
      const melee = meleeFxSpec(p, dir)
      expect(melee.x).toBe(p.x + d.x * 22)
      expect(melee.y).toBe(p.y + d.y * 22)
      const light = lightBeamFxSpec(p, dir)
      expect(light.x).toBe(p.x + d.x * 10)
      expect(light.y).toBe(p.y + d.y * 10)
      const wind = windGustFxSpec(p, dir)
      expect(wind.x).toBe(p.x + d.x * 18)
      expect(wind.y).toBe(p.y + d.y * 18)
      const nature = natureBurstFxSpec(p, dir)
      expect(nature.x).toBe(p.x + d.x * 20)
      expect(nature.y).toBe(p.y + d.y * 20)
      expect(nature.key).toBe('fx-nature')
    }
  })
})
