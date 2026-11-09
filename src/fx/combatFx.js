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
    scale: 2.4,
    holdMs: 200,
    fadeMs: 300,
    endScale: 3.0,
  }
}

/** Golden light beam: rooted at Merlin, extends forward (origin left-center). */
export function lightBeamFxSpec(player, facing) {
  const off = forwardOffset(facing, 10)
  return {
    kind: 'light',
    key: 'fx-rayon',
    x: player.x + off.x,
    y: player.y + off.y,
    rotation: FACING_ANGLE[facing] || 0,
    scale: 1,
    originX: 0,
    originY: 0.5,
    displayW: 240,
    displayH: 36,
    holdMs: 220,
    fadeMs: 320,
    // no endScale shrink — keeps the golden bar readable
  }
}

/** Optional light orb that travels forward along the beam. */
export function lightOrbFxSpec(player, facing) {
  const off = forwardOffset(facing, 36)
  const d = FACING_DELTA[facing] || FACING_DELTA.S
  return {
    kind: 'light-orb',
    key: 'fx-orbe',
    x: player.x + off.x,
    y: player.y + off.y,
    rotation: 0,
    scale: 2.4,
    holdMs: 160,
    fadeMs: 280,
    travelPx: 120,
    endScale: 1.6,
    dx: d.x,
    dy: d.y,
  }
}

/** Wind gust in front of Merlin, short travel so it stays on-screen. */
const WIND_ORIGIN = {
  E: { originX: 0, originY: 0.5 },
  W: { originX: 1, originY: 0.5 },
  S: { originX: 0.5, originY: 0 },
  N: { originX: 0.5, originY: 1 },
}

/** Wind gust rooted on Merlin, growing forward (origin avoids bottom-edge clip). */
export function windGustFxSpec(player, facing) {
  const off = forwardOffset(facing, 18)
  const d = FACING_DELTA[facing] || FACING_DELTA.S
  const origin = WIND_ORIGIN[facing] || WIND_ORIGIN.S
  return {
    kind: 'wind',
    key: 'rafale-vent',
    x: player.x + off.x,
    y: player.y + off.y,
    rotation: FACING_ANGLE[facing] || 0,
    scale: 2.4,
    ...origin,
    holdMs: 220,
    fadeMs: 480,
    travelPx: 64,
    endScale: 3.0,
    trailDelayMs: 100,
    dx: d.x,
    dy: d.y,
  }
}

/** Nature cast burst (leaves/orb) in front of Merlin. */
export function natureBurstFxSpec(player, facing) {
  const off = forwardOffset(facing, 20)
  return {
    kind: 'nature',
    key: 'fx-nature',
    x: player.x + off.x,
    y: player.y + off.y,
    rotation: FACING_ANGLE[facing] || 0,
    scale: 2.6,
    holdMs: 200,
    fadeMs: 340,
    endScale: 3.4,
  }
}

export function windTrailSpecs(base) {
  return [
    { ...base, staggerMs: 0, scaleMul: 1, tint: null },
    { ...base, staggerMs: base.trailDelayMs, scaleMul: 0.9, tint: 0xa8e8ff },
    { ...base, staggerMs: base.trailDelayMs * 2, scaleMul: 0.75, tint: 0xd0f0ff },
  ]
}
