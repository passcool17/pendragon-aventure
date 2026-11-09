/** PNG keys delivered by Créa (public/assets/sprites/<key>.png). */
export const CREA_SPRITE_KEYS = [
  'tile-floor', 'tile-wall', 'tile-water',
  'merlin', 'npc', 'enemy-shadow', 'boss',
  'spell-light', 'heart', 'mana-pip',
  'icon-light', 'icon-wind', 'icon-nature',
  'block', 'brazier-off', 'brazier-on', 'bridge',
  'totem-off', 'totem-on',
  'tree', 'fern', 'ruin-column',
]

/** Generated FX keys (no Créa PNG yet). */
export const FX_PLACEHOLDER_KEYS = [
  'melee-arc', 'light-orb', 'wind-puff', 'mist-puff',
]

export function spriteUrl(key) {
  return `assets/sprites/${key}.png`
}
