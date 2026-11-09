import { FACING_ANGLE, FACING_DELTA, forwardOffset } from './feel.js'

/** Shared combat VFX specs (pure). WorldScene plays them via spawnCombatFx + playCombatFx. */

export function meleeFxSpec(player, facing) {
  const off = forwardOffset(facing, 22)
  return {
    kind: 'melee',
    key: 'arc-attaque',
    x: player.x + off.x,
    y: player.y + off.y,
    rotation: FACING_ANGLE[facing] || 0,
    scale: 2,
    holdMs: 200,
    fadeMs: 300,
    endScale: 2,
  }
}

/**
 * Soft golden beam rooted on Merlin (origin left-center).
 * displayH ~18 logical px; texture has soft alpha edges + tip fade.
 */
export function lightBeamFxSpec(player, facing) {
  const off = forwardOffset(facing, 8)
  return {
    kind: 'light',
    key: 'fx-rayon',
    x: player.x + off.x,
    y: player.y + off.y,
    rotation: FACING_ANGLE[facing] || 0,
    scale: 1,
    originX: 0,
    originY: 0.5,
    displayW: 200,
    displayH: 18,
    holdMs: 200,
    fadeMs: 360,
    shimmer: true,
  }
}

/** Wider soft halo behind the core beam. */
export function lightHaloFxSpec(player, facing) {
  const beam = lightBeamFxSpec(player, facing)
  return {
    ...beam,
    kind: 'light-halo',
    key: 'fx-rayon-halo',
    displayW: 210,
    displayH: 32,
    holdMs: 180,
    fadeMs: 400,
  }
}

/** Traveling light orb along the beam. */
export function lightOrbFxSpec(player, facing) {
  const off = forwardOffset(facing, 24)
  const d = FACING_DELTA[facing] || FACING_DELTA.S
  return {
    kind: 'light-orb',
    key: 'fx-orbe',
    x: player.x + off.x,
    y: player.y + off.y,
    rotation: 0,
    scale: 1,
    holdMs: 140,
    fadeMs: 300,
    travelPx: 140,
    endScale: 1,
    dx: d.x,
    dy: d.y,
  }
}

/** Spark particle along the beam. */
export function lightSparkFxSpec(player, facing, index = 0) {
  const d = FACING_DELTA[facing] || FACING_DELTA.S
  const along = 28 + index * 36
  const side = (index % 2 === 0 ? -1 : 1) * (3 + (index % 3))
  const perp = { x: -d.y, y: d.x }
  return {
    kind: 'light-spark',
    key: 'fx-spark',
    x: player.x + d.x * along + perp.x * side,
    y: player.y + d.y * along + perp.y * side,
    rotation: 0,
    scale: 1,
    holdMs: 60 + index * 30,
    fadeMs: 220,
    travelPx: 18,
    endScale: 1,
    dx: d.x,
    dy: d.y,
    staggerMs: index * 40,
  }
}

/**
 * Wind gust: center-origin, integer scale 2 (~1.5–2× Merlin 32×48).
 * For N/S the spawn x equals Merlin.x (off.x === 0) so the FX centre sits on his axis.
 */
export function windGustFxSpec(player, facing) {
  const forward = facing === 'S' ? 10 : 14
  const off = forwardOffset(facing, forward)
  const d = FACING_DELTA[facing] || FACING_DELTA.S
  // Shorter travel when facing camera edge (S) to avoid bottom clip
  const travelPx = facing === 'S' ? 28 : facing === 'N' ? 40 : 52
  return {
    kind: 'wind',
    key: 'fx-vent',
    x: player.x + off.x,
    y: player.y + off.y,
    rotation: FACING_ANGLE[facing] || 0,
    // scale 1 on ~72×48 texture ≈ 1.5–2× Merlin (32×48); avoids chunky upscale
    scale: 1,
    originX: 0.5,
    originY: 0.5,
    holdMs: 200,
    fadeMs: 420,
    travelPx,
    endScale: 1,
    trailDelayMs: 90,
    dx: d.x,
    dy: d.y,
  }
}

export function natureBurstFxSpec(player, facing) {
  const off = forwardOffset(facing, 20)
  return {
    kind: 'nature',
    key: 'fx-nature',
    x: player.x + off.x,
    y: player.y + off.y,
    rotation: FACING_ANGLE[facing] || 0,
    scale: 2,
    holdMs: 200,
    fadeMs: 340,
    endScale: 2,
  }
}

export function windTrailSpecs(base) {
  // One main + one softer trail (avoid huge stacked pixel mess)
  return [
    { ...base, staggerMs: 0, scaleMul: 1, tint: null },
    { ...base, staggerMs: base.trailDelayMs, scaleMul: 1, tint: 0xb8e8ff },
  ]
}

/**
 * Geometric centre of a combat FX sprite in world space (accounts for origin + rotation).
 * For centre-origin images this is simply (x, y). For left-origin beams it is mid-shaft.
 */
export function combatFxCenter(spec) {
  const ox = spec.originX ?? 0.5
  const oy = spec.originY ?? 0.5
  const w = spec.displayW ?? (48 * (spec.scale ?? 1))
  const h = spec.displayH ?? (48 * (spec.scale ?? 1))
  // Local offset from origin to geometric centre
  const lx = (0.5 - ox) * w
  const ly = (0.5 - oy) * h
  const rot = spec.rotation || 0
  const cos = Math.cos(rot)
  const sin = Math.sin(rot)
  return {
    x: spec.x + lx * cos - ly * sin,
    y: spec.y + lx * sin + ly * cos,
  }
}

/** Axis alignment error: for N/S compare x; for E/W compare y. */
export function combatFxAxisError(player, facing, spec) {
  const c = combatFxCenter(spec)
  if (facing === 'N' || facing === 'S') {
    return { axis: 'x', error: Math.abs(c.x - player.x), center: c }
  }
  return { axis: 'y', error: Math.abs(c.y - player.y), center: c }
}
