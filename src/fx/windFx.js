import { FACING_ANGLE, forwardOffset } from './feel.js'

/** Spec for a readable wind gust in front of Merlin (~300ms visible). */
export function windGustFxSpec(player, facing) {
  const off = forwardOffset(facing, 28)
  return {
    key: 'rafale-vent',
    x: player.x + off.x,
    y: player.y + off.y,
    rotation: FACING_ANGLE[facing] || 0,
    scale: 2.6,
    depth: 12000,
    holdMs: 180,
    fadeMs: 140,
    endScale: 3.2,
  }
}
