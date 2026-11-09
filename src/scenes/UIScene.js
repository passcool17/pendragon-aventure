import { hudLayout } from '../ui/hudLayout.js'
import { SPELL_SLOTS } from '../input/spellSelect.js'
import { GAME_CONFIG } from '../gameConfig.js'

export class UIScene extends Phaser.Scene {
  constructor() { super('UIScene') }

  create() {
    this.cameras.main.setBackgroundColor('rgba(0,0,0,0)')
    this.cameras.main.clearBeforeRender = false
    this.layout = hudLayout(GAME_CONFIG.width, GAME_CONFIG.height)
    this.hearts = []
    const m = this.layout.mana
    this.manaBar = this.add.image(m.x, m.y, 'barre-mana').setOrigin(0, 0.5).setScrollFactor(0).setDepth(1000)
    this.manaFill = this.add.rectangle(m.x + 2, m.y, m.w - 6, 6, 0x4a8fd4).setOrigin(0, 0.5).setScrollFactor(0).setDepth(1001)
    this.icons = {}
    this.locks = {}
    this.layout.spellIcons.forEach(({ id, x, y }, i) => {
      const tex = ['icon-lumiere', 'icon-vent', 'icon-nature'][i]
      const img = this.add.image(x, y, tex).setScrollFactor(0).setDepth(1000)
      this.icons[id] = img
      const lock = this.add.text(x + 10, y + 8, '🔒', {
        fontFamily: 'monospace', fontSize: '10px',
      }).setOrigin(0.5).setScrollFactor(0).setDepth(1002).setVisible(false)
      this.locks[id] = lock
    })
    this.msg = this.add.text(GAME_CONFIG.width / 2, 56, '', {
      fontFamily: 'monospace', fontSize: '12px', color: '#f0e6c8', backgroundColor: '#00000066',
      padding: { x: 6, y: 3 },
    }).setOrigin(0.5).setScrollFactor(0).setDepth(1100).setAlpha(0)

    this.game.events.on('game-state', this.redraw, this)
    this.game.events.on('ui-message', this.flash, this)
    this.events.once('shutdown', () => {
      this.game.events.off('game-state', this.redraw, this)
      this.game.events.off('ui-message', this.flash, this)
    })
    this.redraw(this.registry.get('gameState'))
    this.buildTouch()
  }

  flash(text) {
    this.msg.setText(text).setAlpha(1)
    this.tweens.add({ targets: this.msg, alpha: 0, delay: 1600, duration: 400 })
  }

  redraw(state) {
    if (!state) return
    this.hearts.forEach((h) => h.destroy())
    this.hearts = []
    const ho = this.layout.heartsOrigin
    for (let i = 0; i < state.heartsMax; i++) {
      const h = this.add.image(ho.x + i * this.layout.heartGap, ho.y, 'coeur')
        .setScrollFactor(0).setDepth(1000).setScale(0.7)
      h.setAlpha(i < state.hearts ? 1 : 0.25)
      this.hearts.push(h)
    }
    this.manaFill.width = Math.max(0, (this.layout.mana.w - 6) * state.mana)
    for (const id of SPELL_SLOTS) {
      const img = this.icons[id]
      if (!img) continue
      const unlocked = state.spellsUnlocked.includes(id)
      img.setAlpha(unlocked ? 1 : 0.35)
      img.setTint(state.activeSpell === id ? 0xffffff : unlocked ? 0xbbbbbb : 0x555555)
      img.setScale(state.activeSpell === id ? 1.1 : 1)
      this.locks[id]?.setVisible(!unlocked)
    }
  }

  buildTouch() {
    const coarse = typeof window !== 'undefined' && window.matchMedia?.('(pointer: coarse)').matches
    if (!coarse) return
    this.registry.set('touchVec', { x: 0, y: 0 })
    this.registry.set('touchAction', null)
    const pad = this.add.circle(70, 290, 42, 0xffffff, 0.12).setScrollFactor(0).setDepth(900).setInteractive()
    pad.on('pointerdown', (p) => this.nudge(p, pad))
    pad.on('pointermove', (p) => { if (p.isDown) this.nudge(p, pad) })
    pad.on('pointerup', () => this.registry.set('touchVec', { x: 0, y: 0 }))
    const mk = (x, label, action) => {
      const b = this.add.rectangle(x, 310, 52, 52, 0xe8c547, 0.3).setScrollFactor(0).setDepth(900).setInteractive()
      this.add.text(x, 310, label, { fontFamily: 'monospace', fontSize: '12px', color: '#fff' })
        .setOrigin(0.5).setScrollFactor(0).setDepth(901)
      b.on('pointerdown', () => this.registry.set('touchAction', action))
    }
    mk(480, 'A', 'melee')
    mk(540, 'F', 'cast')
    mk(600, '↻', 'cycle')
  }

  nudge(pointer, pad) {
    const dx = pointer.x - pad.x
    const dy = pointer.y - pad.y
    const len = Math.hypot(dx, dy) || 1
    this.registry.set('touchVec', { x: dx / len, y: dy / len })
  }
}
