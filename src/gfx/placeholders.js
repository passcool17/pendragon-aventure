export const PALETTE = {
  floor: '#2f4a3a',
  wall: '#1a2420',
  water: '#3a5f7a',
  mist: '#7a9bb0',
  merlin: '#3a5ea8',
  gold: '#e8c547',
  heart: '#c23b3b',
  mana: '#4a8fd4',
  enemy: '#2a1535',
  nature: '#5a9e4a',
  wind: '#7ec8e3',
}

export const TEXTURE_KEYS = [
  'tile-floor', 'tile-wall', 'tile-water', 'merlin', 'enemy-shadow',
  'spell-light', 'heart', 'mana-pip', 'icon-light', 'icon-wind', 'icon-nature',
  'npc', 'block', 'brazier-off', 'brazier-on', 'bridge', 'totem-on', 'totem-off', 'boss',
]

/** @param {Phaser.Scene} scene */
export function generatePlaceholderTextures(scene) {
  const g = scene.make.graphics({ x: 0, y: 0, add: false })
  const hex = (c) => Phaser.Display.Color.HexStringToColor(c).color
  const sq = (key, color, w = 16, h = 16) => {
    g.clear()
    g.fillStyle(hex(color), 1)
    g.fillRect(0, 0, w, h)
    if (key.startsWith('icon-') || key === 'merlin' || key === 'npc') {
      g.lineStyle(1, hex('#f0e6c8'), 1)
      g.strokeRect(1, 1, w - 2, h - 2)
    }
    g.generateTexture(key, w, h)
  }
  sq('tile-floor', PALETTE.floor)
  sq('tile-wall', PALETTE.wall)
  sq('tile-water', PALETTE.water)
  sq('merlin', PALETTE.merlin, 16, 24)
  sq('enemy-shadow', PALETTE.enemy, 16, 16)
  sq('spell-light', PALETTE.gold, 8, 8)
  sq('heart', PALETTE.heart, 10, 10)
  sq('mana-pip', PALETTE.mana, 4, 8)
  sq('icon-light', PALETTE.gold, 16, 16)
  sq('icon-wind', PALETTE.wind, 16, 16)
  sq('icon-nature', PALETTE.nature, 16, 16)
  sq('npc', '#c4a574', 16, 24)
  sq('block', '#8a7a60', 16, 16)
  sq('brazier-off', '#444444', 16, 16)
  sq('brazier-on', PALETTE.gold, 16, 16)
  sq('bridge', PALETTE.nature, 16, 16)
  sq('totem-on', '#a67c52', 16, 24)
  sq('totem-off', '#555555', 16, 24)
  sq('boss', '#6b1d4a', 24, 24)
  g.destroy()
}
