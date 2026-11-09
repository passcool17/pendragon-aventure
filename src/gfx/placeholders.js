/** Minimal FX fallbacks only when Créa FX missing. */
export function generateFxPlaceholders(scene) {
  const g = scene.make.graphics({ x: 0, y: 0, add: false })
  const hex = (c) => Phaser.Display.Color.HexStringToColor(c).color
  const ensure = (key, draw) => {
    if (scene.textures.exists(key)) return
    draw()
  }
  ensure('rayon-lumiere', () => {
    g.clear()
    g.fillStyle(hex('#e8c547'), 1)
    g.fillRect(0, 4, 128, 8)
    g.fillStyle(hex('#fff6c8'), 0.8)
    g.fillRect(0, 6, 128, 4)
    g.generateTexture('rayon-lumiere', 128, 16)
  })
  ensure('arc-attaque', () => {
    g.clear()
    g.fillStyle(hex('#f0e6c8'), 1)
    g.slice(24, 24, 20, Phaser.Math.DegToRad(-70), Phaser.Math.DegToRad(70), false)
    g.fillPath()
    g.generateTexture('arc-attaque', 48, 48)
  })
  ensure('rafale-vent', () => {
    g.clear()
    g.fillStyle(hex('#7ec8e3'), 0.85)
    g.fillEllipse(24, 24, 40, 24)
    g.generateTexture('rafale-vent', 48, 48)
  })
  ensure('orbe', () => {
    g.clear()
    g.fillStyle(hex('#e8c547'), 1)
    g.fillCircle(8, 8, 7)
    g.generateTexture('orbe', 16, 16)
  })
  ensure('nappe-brume', () => {
    g.clear()
    g.fillStyle(hex('#d8e0d0'), 0.35)
    g.fillEllipse(64, 32, 120, 50)
    g.generateTexture('nappe-brume', 128, 64)
  })
  g.destroy()
}
