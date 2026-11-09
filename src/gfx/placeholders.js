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
  'tree', 'fern', 'ruin-column',
  'melee-arc', 'light-orb', 'wind-puff', 'mist-puff',
]

/** @param {Phaser.Scene} scene @param {{ onlyIfMissing?: boolean }} [opts] */
export function generatePlaceholderTextures(scene, opts = {}) {
  const onlyIfMissing = !!opts.onlyIfMissing
  const g = scene.make.graphics({ x: 0, y: 0, add: false })
  const hex = (c) => Phaser.Display.Color.HexStringToColor(c).color
  const sq = (key, color, w = 16, h = 16) => {
    if (onlyIfMissing && scene.textures.exists(key)) return
    g.clear()
    g.fillStyle(hex(color), 1)
    g.fillRect(0, 0, w, h)
    if (key.startsWith('icon-') || key === 'merlin' || key === 'npc') {
      g.lineStyle(1, hex('#f0e6c8'), 1)
      g.strokeRect(1, 1, w - 2, h - 2)
    }
    g.generateTexture(key, w, h)
  }
  const gen = (key, fn) => {
    if (onlyIfMissing && scene.textures.exists(key)) return
    fn()
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
  sq('tree', '#1e3d28', 32, 32)
  sq('fern', '#3d6b45', 16, 16)
  sq('ruin-column', '#8a7a60', 16, 32)
  // FX keys (Créa may replace later by same names)
  gen('light-orb', () => {
    g.clear()
    g.fillStyle(hex(PALETTE.gold), 1)
    g.fillCircle(8, 8, 7)
    g.fillStyle(hex('#fff6c8'), 0.9)
    g.fillCircle(8, 8, 3)
    g.generateTexture('light-orb', 16, 16)
  })
  gen('melee-arc', () => {
    g.clear()
    g.fillStyle(hex('#f0e6c8'), 1)
    g.slice(12, 12, 11, Phaser.Math.DegToRad(-70), Phaser.Math.DegToRad(70), false)
    g.fillPath()
    g.generateTexture('melee-arc', 24, 24)
  })
  gen('wind-puff', () => {
    g.clear()
    g.fillStyle(hex(PALETTE.wind), 0.85)
    g.fillEllipse(8, 6, 14, 8)
    g.fillStyle(hex('#d8f4ff'), 0.5)
    g.fillEllipse(8, 6, 8, 4)
    g.generateTexture('wind-puff', 16, 12)
  })
  gen('mist-puff', () => {
    g.clear()
    g.fillStyle(hex(PALETTE.mist), 0.35)
    g.fillEllipse(16, 10, 28, 16)
    g.generateTexture('mist-puff', 32, 20)
  })
  g.destroy()
}
