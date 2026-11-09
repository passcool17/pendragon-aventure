import { CREA_SPRITE_KEYS, spriteUrl } from '../gfx/spriteKeys.js'
import { generateFxPlaceholders } from '../gfx/placeholders.js'

export class PreloadScene extends Phaser.Scene {
  constructor() { super('PreloadScene') }

  preload() {
    this.load.on('loaderror', (file) => console.warn('sprite fail', file?.key))
    for (const key of CREA_SPRITE_KEYS) {
      if (key === 'preview' || key.startsWith('scene-')) continue
      this.load.image(key, spriteUrl(key))
    }
    const bar = this.add.rectangle(320, 180, 240, 12, 0x1a2420).setOrigin(0.5)
    const fill = this.add.rectangle(200, 180, 0, 8, 0xe8c547).setOrigin(0, 0.5)
    this.load.on('progress', (v) => { fill.width = 240 * v })
    this._bar = bar
    this._fill = fill
  }

  create() {
    generateFxPlaceholders(this)
    this._bar?.destroy()
    this._fill?.destroy()
    this.scene.start('TitleScene')
  }
}
