import { generatePlaceholderTextures } from '../gfx/placeholders.js'

export class PreloadScene extends Phaser.Scene {
  constructor() { super('PreloadScene') }

  create() {
    const bar = this.add.rectangle(192, 144, 200, 12, 0x1a2420).setOrigin(0.5)
    const fill = this.add.rectangle(92, 144, 0, 8, 0xe8c547).setOrigin(0, 0.5)
    let done = false
    const timer = this.time.delayedCall(15000, () => {
      if (done) return
      bar.destroy()
      fill.destroy()
      this.add.text(192, 120, 'Chargement impossible', { fontFamily: 'monospace', fontSize: '12px', color: '#f0e6c8' }).setOrigin(0.5)
      const btn = this.add.text(192, 160, '[ Réessayer ]', { fontFamily: 'monospace', fontSize: '12px', color: '#e8c547' })
        .setOrigin(0.5).setInteractive({ useHandCursor: true })
      btn.on('pointerdown', () => this.scene.restart())
    })
    try {
      generatePlaceholderTextures(this)
      fill.width = 200
      done = true
      timer.remove(false)
      this.scene.start('TitleScene')
    } catch (err) {
      console.error(err)
    }
  }
}
