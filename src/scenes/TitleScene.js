import { createNewGame } from '../state/gameState.js'
import { loadFromStorage, clearSave } from '../state/save.js'
import { setState } from '../state/registry.js'
import { parseDebugParams, applyDebugState, DEBUG_LEVELS } from '../util/debug.js'

export class TitleScene extends Phaser.Scene {
  constructor() { super('TitleScene') }

  create() {
    this.add.text(192, 60, 'Merlin : Les Brumes\nde Bretagne', {
      fontFamily: 'monospace', fontSize: '16px', color: '#e8c547', align: 'center',
    }).setOrigin(0.5)

    const save = loadFromStorage()
    const mk = (y, label, fn) => {
      const t = this.add.text(192, y, label, { fontFamily: 'monospace', fontSize: '12px', color: '#f0e6c8' })
        .setOrigin(0.5).setInteractive({ useHandCursor: true })
      t.on('pointerover', () => t.setColor('#e8c547'))
      t.on('pointerout', () => t.setColor('#f0e6c8'))
      t.on('pointerdown', fn)
      return t
    }

    mk(130, 'Nouvelle partie', () => this.startFresh())
    if (save.ok) mk(155, 'Continuer', () => this.continueSave(save.state))
    mk(180, 'Effacer la sauvegarde', () => { clearSave(); this.scene.restart() })

    this.add.text(192, 250, 'WASD/Flèches · Espace · E · 1-3 · F · Échap', {
      fontFamily: 'monospace', fontSize: '8px', color: '#7a9bb0',
    }).setOrigin(0.5)

    // Auto-jump via ?level=
    const dbg = parseDebugParams(typeof location !== 'undefined' ? location.search : '')
    if (dbg.level && DEBUG_LEVELS.includes(dbg.level)) {
      const state = applyDebugState(createNewGame(), dbg)
      setState(this, state, { save: false })
      this.scene.launch('UIScene')
      this.scene.start('WorldScene', { levelId: dbg.level })
    }
  }

  startFresh() {
    const dbg = parseDebugParams(typeof location !== 'undefined' ? location.search : '')
    let state = createNewGame()
    if (dbg.spellsAll || dbg.fragmentsAll || dbg.god) state = applyDebugState(state, dbg)
    setState(this, state)
    this.scene.launch('UIScene')
    this.scene.start('WorldScene', { levelId: 'hub' })
  }

  continueSave(state) {
    setState(this, state, { save: false })
    this.scene.launch('UIScene')
    const levelId = state.position?.scene && state.position.scene !== 'title'
      ? (state.position.regionId || state.position.scene)
      : 'hub'
    this.scene.start('WorldScene', { levelId: levelId === 'hub' ? 'hub' : levelId })
  }
}
