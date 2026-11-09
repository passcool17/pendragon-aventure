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


  // Soft luminous combat textures (canvas gradients — readable with NORMAL blend)
  const forceCanvas = (key, w, h, paint) => {
    if (scene.textures.exists(key)) scene.textures.remove(key)
    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')
    paint(ctx, w, h)
    scene.textures.addCanvas(key, canvas)
  }

  // Horizontal soft beam: white-yellow core, golden falloff, transparent edges (~18px logical)
  forceCanvas('fx-rayon', 256, 48, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h)
    const cy = h / 2
    // Outer golden halo (soft)
    for (let y = 0; y < h; y++) {
      const dy = Math.abs(y - cy) / (h / 2)
      const a = Math.max(0, 1 - dy) ** 2.2 * 0.45
      ctx.fillStyle = `rgba(240, 170, 40, ${a})`
      ctx.fillRect(0, y, w, 1)
    }
    // Mid gold band
    for (let y = 0; y < h; y++) {
      const dy = Math.abs(y - cy) / (h * 0.32)
      const a = Math.max(0, 1 - dy) ** 1.5 * 0.95
      ctx.fillStyle = `rgba(255, 205, 55, ${a})`
      ctx.fillRect(0, y, w, 1)
    }
    // Hot white-yellow core
    for (let y = 0; y < h; y++) {
      const dy = Math.abs(y - cy) / (h * 0.14)
      const a = Math.max(0, 1 - dy) ** 1.2
      ctx.fillStyle = `rgba(255, 252, 230, ${a})`
      ctx.fillRect(0, y, w, 1)
    }
    // Tip fade along length (softer toward the tip)
    const tip = ctx.createLinearGradient(0, 0, w, 0)
    tip.addColorStop(0, 'rgba(255,255,255,0)')
    tip.addColorStop(0.08, 'rgba(255,255,255,0)')
    tip.addColorStop(0.85, 'rgba(255,255,255,0)')
    tip.addColorStop(1, 'rgba(0,0,0,0.55)')
    ctx.globalCompositeOperation = 'destination-out'
    ctx.fillStyle = tip
    ctx.fillRect(0, 0, w, h)
    ctx.globalCompositeOperation = 'source-over'
  })

  // Wider soft halo behind the beam
  forceCanvas('fx-rayon-halo', 256, 64, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h)
    const cy = h / 2
    for (let y = 0; y < h; y++) {
      const dy = Math.abs(y - cy) / (h / 2)
      const a = Math.max(0, 1 - dy) ** 2.8 * 0.35
      ctx.fillStyle = `rgba(255, 200, 60, ${a})`
      ctx.fillRect(0, y, w, 1)
    }
    const tip = ctx.createLinearGradient(0, 0, w, 0)
    tip.addColorStop(0.7, 'rgba(0,0,0,0)')
    tip.addColorStop(1, 'rgba(0,0,0,0.7)')
    ctx.globalCompositeOperation = 'destination-out'
    ctx.fillStyle = tip
    ctx.fillRect(0, 0, w, h)
    ctx.globalCompositeOperation = 'source-over'
  })

  forceCanvas('fx-orbe', 32, 32, (ctx, w, h) => {
    const cx = w / 2, cy = h / 2
    const grd = ctx.createRadialGradient(cx, cy, 1, cx, cy, 14)
    grd.addColorStop(0, 'rgba(255,252,230,1)')
    grd.addColorStop(0.35, 'rgba(255,220,80,0.95)')
    grd.addColorStop(0.7, 'rgba(240,160,40,0.45)')
    grd.addColorStop(1, 'rgba(240,160,40,0)')
    ctx.fillStyle = grd
    ctx.fillRect(0, 0, w, h)
  })

  forceCanvas('fx-spark', 12, 12, (ctx, w, h) => {
    const cx = w / 2, cy = h / 2
    const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, 5)
    grd.addColorStop(0, 'rgba(255,255,240,1)')
    grd.addColorStop(0.5, 'rgba(255,220,100,0.9)')
    grd.addColorStop(1, 'rgba(255,180,40,0)')
    ctx.fillStyle = grd
    ctx.fillRect(0, 0, w, h)
  })

  // Soft wind puff at native ~64px so scale 2 stays crisp-ish; drawn soft for NORMAL
  forceCanvas('fx-vent', 72, 48, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h)
    // three soft swirls along +X
    const blobs = [
      [16, 24, 18, 14, 0.8],
      [36, 22, 20, 16, 0.9],
      [56, 24, 16, 14, 0.75],
    ]
    for (const [bx, by, rw, rh, a] of blobs) {
      const grd = ctx.createRadialGradient(bx, by, 1, bx, by, rw)
      grd.addColorStop(0, `rgba(220,245,255,${a})`)
      grd.addColorStop(0.45, `rgba(120,200,230,${a * 0.75})`)
      grd.addColorStop(1, 'rgba(80,160,210,0)')
      ctx.fillStyle = grd
      ctx.beginPath()
      ctx.ellipse(bx, by, rw, rh, 0, 0, Math.PI * 2)
      ctx.fill()
    }
    // motion streaks
    ctx.globalAlpha = 0.35
    ctx.strokeStyle = '#c8ecff'
    ctx.lineWidth = 1.5
    for (let i = 0; i < 5; i++) {
      const yy = 10 + i * 5
      ctx.beginPath()
      ctx.moveTo(4, yy)
      ctx.lineTo(28 + i * 3, yy - 1)
      ctx.stroke()
    }
    ctx.globalAlpha = 1
  })

  ensure('fx-nature', () => {
    g.clear()
    g.fillStyle(hex('#5cb85c'), 1)
    g.fillCircle(12, 12, 11)
    g.fillStyle(hex('#b6e39a'), 1)
    g.fillEllipse(12, 10, 14, 10)
    g.fillStyle(hex('#2f6b2f'), 1)
    g.fillRect(11, 4, 2, 16)
    g.generateTexture('fx-nature', 24, 24)
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
