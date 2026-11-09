import { FACING_ANGLE, forwardOffset } from './feel.js'

/** Spec for a readable traveling wind gust (~700ms visible). */
export function windGustFxSpec(player, facing) {
  const off = forwardOffset(facing, 32)
  return {
    key: 'rafale-vent',
    x: player.x + off.x,
    y: player.y + off.y,
    rotation: FACING_ANGLE[facing] || 0,
    scale: 2.8,
    depth: 12000,
    holdMs: 200,
    fadeMs: 520,
    travelPx: 140,
    endScale: 3.6,
    trailDelayMs: 110,
  }
}
