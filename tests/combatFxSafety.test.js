import { describe, it, expect } from 'vitest'
import fs from 'node:fs'
import {
  meleeFxSpec, lightBeamFxSpec, lightHaloFxSpec, lightOrbFxSpec, lightSparkFxSpec,
  windGustFxSpec, windTrailSpecs, natureBurstFxSpec,
  combatFxCenter, combatFxAxisError,
} from '../src/fx/combatFx.js'
import { FACING_DELTA } from '../src/fx/feel.js'

describe('combat FX safety (WebGL non-regression)', () => {
  const world = fs.readFileSync(new URL('../src/scenes/WorldScene.js', import.meta.url), 'utf8')
  const controls = fs.readFileSync(new URL('../src/input/controls.js', import.meta.url), 'utf8')
  const ui = fs.readFileSync(new URL('../src/scenes/UIScene.js', import.meta.url), 'utf8')
  const main = fs.readFileSync(new URL('../src/main.js', import.meta.url), 'utf8')
  const placeholders = fs.readFileSync(new URL('../src/gfx/placeholders.js', import.meta.url), 'utf8')

  it('defines soft gradient light textures (not hard rects)', () => {
    expect(placeholders).toMatch(/fx-rayon/)
    expect(placeholders).toMatch(/fx-rayon-halo/)
    expect(placeholders).toMatch(/fx-spark/)
    expect(placeholders).toMatch(/createLinearGradient|createRadialGradient|forceCanvas/)
    expect(placeholders).toMatch(/fx-vent/)
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
    expect(world).toMatch(/FilterMode\.LINEAR/)
    expect(world).not.toMatch(/BlendModes\.ADD/)
    expect(world).toMatch(/lightBeamFxSpec/)
    expect(world).toMatch(/lightHaloFxSpec/)
    expect(world).toMatch(/lightSparkFxSpec/)
    expect(world).toMatch(/playCombatFx\(meleeFxSpec/)
    expect(world).toMatch(/natureBurstFxSpec/)
  })

  it('light beam is thin (~16–20px) with soft halo and hold/fade', () => {
    const s = lightBeamFxSpec({ x: 100, y: 100 }, 'E')
    expect(s.key).toBe('fx-rayon')
    expect(s.displayH).toBeGreaterThanOrEqual(16)
    expect(s.displayH).toBeLessThanOrEqual(20)
    expect(s.shimmer).toBe(true)
    expect(s.holdMs).toBeGreaterThanOrEqual(160)
    const halo = lightHaloFxSpec({ x: 100, y: 100 }, 'E')
    expect(halo.key).toBe('fx-rayon-halo')
    expect(halo.displayH).toBeGreaterThan(s.displayH)
    expect(lightOrbFxSpec({ x: 100, y: 100 }, 'E').key).toBe('fx-orbe')
    expect(lightSparkFxSpec({ x: 100, y: 100 }, 'E', 0).key).toBe('fx-spark')
  })

  it('wind uses centre origin, integer scale ~2, soft fx-vent texture', () => {
    const s = windGustFxSpec({ x: 320, y: 200 }, 'E')
    expect(s.key).toBe('fx-vent')
    expect(s.originX).toBe(0.5)
    expect(s.originY).toBe(0.5)
    expect(s.scale).toBe(1)
    expect(Number.isInteger(s.scale)).toBe(true)
    expect(s.endScale).toBe(1)
    expect(s.travelPx).toBeLessThanOrEqual(60)
    expect(windTrailSpecs(s).length).toBeLessThanOrEqual(2)
  })

  it('aligns FX centre on Merlin axis in all 4 directions', () => {
    const p = { x: 200, y: 300 }
    for (const dir of ['N', 'S', 'E', 'W']) {
      const wind = windGustFxSpec(p, dir)
      const { error, axis, center } = combatFxAxisError(p, dir, wind)
      expect(error, `${dir} wind ${axis}`).toBeLessThan(0.01)
      if (dir === 'S' || dir === 'N') {
        expect(wind.x).toBe(p.x)
        expect(center.x).toBe(p.x)
      } else {
        expect(wind.y).toBe(p.y)
        expect(center.y).toBe(p.y)
      }
      // forward of Merlin
      const d = FACING_DELTA[dir]
      expect((center.x - p.x) * d.x + (center.y - p.y) * d.y).toBeGreaterThan(0)

      const beam = lightBeamFxSpec(p, dir)
      // Beam origin is left-centre; geometric centre should sit on the facing axis
      const bc = combatFxCenter(beam)
      if (dir === 'S' || dir === 'N') {
        expect(Math.abs(bc.x - p.x)).toBeLessThan(0.01)
      } else {
        expect(Math.abs(bc.y - p.y)).toBeLessThan(0.01)
      }
    }
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
})
