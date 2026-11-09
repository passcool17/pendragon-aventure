import { generatePlaceholderTextures } from '../gfx/placeholders.js'
import { CREA_SPRITE_KEYS, spriteUrl } from '../gfx/spriteKeys.js'

export class PreloadScene extends Phaser.Scene {
  constructor() { super('PreloadScene') }

  preload() {
    this.failed = new Set()
    this.load.on('loaderror', (file) => {
      console.warn('sprite load failed', file?.key)
      if (file?.key) this.failed.add(file.key)
    })
    for (const key of CREA_SPRITE_KEYS) {
      this.load.image(key, spriteUrl(key))
    }
    const bar = this.add.rectangle(192, 144, 200, 12, 0x1a2420).setOrigin(0.5)
    const fill = this.add.rectangle(92, 144, 0, 8, 0xe8c547).setOrigin(0, 0.5)
    this.load.on('progress', (v) => { fill.width = 200 * v })
    this.bar = bar
    this.fill = fill
  }

  create() {
    const timer = this.time.delayedCall(15000, () => {
      if (this._done) return
      this.bar?.destroy()
      this.fill?.destroy()
      this.add.text(192, 120, 'Chargement impossible', {
        fontFamily: 'monospace', fontSize: '12px', color: '#f0e6c8',
      }).setOrigin(0.5)
      const btn = this.add.text(192, 160, '[ Réessayer ]', {
        fontFamily: 'monospace', fontSize: '12px', color: '#e8c547',
      }).setOrigin(0.5).setInteractive({ useHandCursor: true })
      btn.on('pointerdown', () => this.scene.restart())
    })
    try {
      // Placeholders only for missing PNGs + always for FX keys not in pack
      generatePlaceholderTextures(this, { onlyIfMissing: true })
      this.textures.get('merlin').setFilter(Phaser.Textures.FilterMode.NEAREST)
      this._done = true
      timer.remove(false)
      this.bar?.destroy()
      this.fill?.destroy()
      this.scene.start('TitleScene')
    } catch (err) {
      console.error(err)
    }
  }
}
