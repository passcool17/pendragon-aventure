import { createNewGame } from '../state/gameState.js'
import { clearSave } from '../state/save.js'
import { setState } from '../state/registry.js'

export class PauseScene extends Phaser.Scene {
  constructor() { super('PauseScene') }

  create() {
    this.add.rectangle(192, 144, 384, 288, 0x000000, 0.65)
    this.add.text(192, 80, 'Pause', { fontFamily: 'monospace', fontSize: '16px', color: '#e8c547' }).setOrigin(0.5)
    const mk = (y, label, fn) => {
      const t = this.add.text(192, y, label, { fontFamily: 'monospace', fontSize: '12px', color: '#f0e6c8' })
        .setOrigin(0.5).setInteractive({ useHandCursor: true })
      t.on('pointerdown', fn)
    }
    mk(120, 'Reprendre', () => {
      this.scene.resume('WorldScene')
      this.scene.stop()
    })
    mk(150, 'Nouvelle partie', () => {
      clearSave()
      setState(this, createNewGame())
      this.scene.stop('WorldScene')
      this.scene.start('TitleScene')
      this.scene.stop()
    })
    mk(180, this.registry.get('muted') ? 'Son : muet' : 'Son : on', () => {
      this.registry.set('muted', !this.registry.get('muted'))
      this.scene.restart()
    })
  }
}
