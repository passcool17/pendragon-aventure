export class UIScene extends Phaser.Scene {
  constructor() { super('UIScene') }

  create() {
    this.hearts = []
    this.manaPips = []
    this.manaBack = this.add.rectangle(12, 22, 52, 10, 0x1a2420, 0.7)
      .setOrigin(0, 0.5).setScrollFactor(0).setDepth(999)
    this.icons = {}
    const keys = ['light', 'wind', 'nature']
    keys.forEach((k, i) => {
      const x = 320 + i * 22
      const img = this.add.image(x, 260, `icon-${k}`).setScrollFactor(0).setDepth(1000).setAlpha(0.35)
      this.icons[k] = img
    })
    this.msg = this.add.text(192, 40, '', {
      fontFamily: 'monospace', fontSize: '10px', color: '#f0e6c8', backgroundColor: '#00000088',
      padding: { x: 4, y: 2 },
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
      const h = this.add.image(14 + i * 12, 10, 'heart').setScrollFactor(0).setDepth(1000)
      h.setAlpha(i < state.hearts ? 1 : 0.25)
      this.hearts.push(h)
    }
    this.manaPips.forEach((p) => p.destroy())
    this.manaPips = []
    const pipCount = 5
    const filled = Math.round(state.mana * pipCount)
    for (let i = 0; i < pipCount; i++) {
      const pip = this.add.image(16 + i * 9, 22, 'mana-pip')
        .setScrollFactor(0).setDepth(1001)
        .setAlpha(i < filled ? 1 : 0.2)
      this.manaPips.push(pip)
    }
    for (const [k, img] of Object.entries(this.icons)) {
      const unlocked = state.spellsUnlocked.includes(k)
      img.setAlpha(unlocked ? 1 : 0.25)
      img.setTint(state.activeSpell === k ? 0xffffff : 0x888888)
      img.setScale(state.activeSpell === k ? 1.15 : 1)
    }
  }

  buildTouch() {
    const coarse = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(pointer: coarse)').matches
    if (!coarse) return
    this.registry.set('touchVec', { x: 0, y: 0 })
    this.registry.set('touchAction', null)
    const pad = this.add.circle(56, 230, 36, 0xffffff, 0.15).setScrollFactor(0).setDepth(900).setInteractive()
    pad.on('pointerdown', (p) => this.nudgeTouch(p, pad))
    pad.on('pointermove', (p) => { if (p.isDown) this.nudgeTouch(p, pad) })
    pad.on('pointerup', () => this.registry.set('touchVec', { x: 0, y: 0 }))
    const mkBtn = (x, label, action) => {
      const b = this.add.rectangle(x, 250, 48, 48, 0xe8c547, 0.35).setScrollFactor(0).setDepth(900).setInteractive()
      this.add.text(x, 250, label, { fontFamily: 'monospace', fontSize: '10px', color: '#fff' })
        .setOrigin(0.5).setScrollFactor(0).setDepth(901)
      b.on('pointerdown', () => this.registry.set('touchAction', action))
    }
    mkBtn(280, 'A', 'melee')
    mkBtn(330, 'F', 'cast')
    mkBtn(355, '↻', 'cycle')
  }

  nudgeTouch(pointer, pad) {
    const dx = pointer.x - pad.x
    const dy = pointer.y - pad.y
    const len = Math.hypot(dx, dy) || 1
    this.registry.set('touchVec', { x: dx / len, y: dy / len })
  }
}
