export class UIScene extends Phaser.Scene {
  constructor() { super('UIScene') }

  create() {
    this.hearts = []
    this.manaBar = this.add.image(16, 48, 'barre-mana').setOrigin(0, 0.5).setScrollFactor(0).setDepth(1000)
    this.manaFill = this.add.rectangle(18, 48, 90, 6, 0x4a8fd4).setOrigin(0, 0.5).setScrollFactor(0).setDepth(1001)
    this.icons = {}
    const keys = [
      ['light', 'icon-lumiere'],
      ['wind', 'icon-vent'],
      ['nature', 'icon-nature'],
    ]
    keys.forEach(([id, tex], i) => {
      const img = this.add.image(560 + i * 36, 330, tex).setScrollFactor(0).setDepth(1000)
      this.icons[id] = img
    })
    this.msg = this.add.text(320, 56, '', {
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
    for (let i = 0; i < state.heartsMax; i++) {
      const h = this.add.image(24 + i * 28, 22, 'coeur').setScrollFactor(0).setDepth(1000).setScale(0.7)
      h.setAlpha(i < state.hearts ? 1 : 0.25)
      this.hearts.push(h)
    }
    this.manaFill.width = Math.max(0, 90 * state.mana)
    for (const [k, img] of Object.entries(this.icons)) {
      const unlocked = state.spellsUnlocked.includes(k)
      img.setAlpha(unlocked ? 1 : 0.3)
      img.setTint(state.activeSpell === k ? 0xffffff : 0x999999)
      img.setScale(state.activeSpell === k ? 1.1 : 1)
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
