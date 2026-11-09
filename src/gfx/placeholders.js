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

  // Break near-identical herbe-1/2/3 tiling with noisy variants
  for (let i = 0; i < 6; i++) {
    const key = `herbe-var-${i}`
    ensure(key, () => {
      g.clear()
      const base = [0x556b28, 0x4f6724, 0x5a702c, 0x4a5e20, 0x627834, 0x536622][i]
      g.fillStyle(base, 1)
      g.fillRect(0, 0, 32, 32)
      for (let n = 0; n < 48; n++) {
        const hx = Math.abs((i * 97 + n * 57) | 0)
        const x = hx % 32
        const y = (hx * 3) % 32
        const lit = (hx % 2) ? 0x6e8a38 : 0x3f5218
        g.fillStyle(lit, 0.45)
        g.fillRect(x, y, 2, 2)
      }
      g.generateTexture(key, 32, 32)
    })
  }
  ensure('dirt-fill', () => {
    g.clear()
    g.fillStyle(0xa8844a, 1)
    g.fillRect(0, 0, 64, 64)
    for (let n = 0; n < 220; n++) {
      const hx = Math.abs((n * 131 + 17) | 0)
      const x = hx % 64
      const y = (hx * 7) % 64
      g.fillStyle((hx % 2) ? 0x8f6e3c : 0xb89555, 0.4)
      g.fillRect(x, y, 1, 1)
    }
    g.generateTexture('dirt-fill', 64, 64)
  })

  g.destroy()
}
