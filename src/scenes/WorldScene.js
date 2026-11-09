import { loadLevel } from '../data/index.js'
import { getState, setState, showMessage } from '../state/registry.js'
import {
  applyDamage, regenMana, unlockSpell, addFragment, setFlag, healFull,
  setActiveSpell, bumpHeartsMax, setPosition,
} from '../state/gameState.js'
import { vectorFromKeys, cycleSpell, createKeyTracker } from '../input/controls.js'
import { facingFromVector, canMelee, MELEE_DAMAGE } from '../combat/combat.js'
import { castSpell } from '../world/spells.js'
import { createEnemy, damageEnemy } from '../world/enemies.js'
import { isWalkable, tileToWorld, worldToTile, buildWalkGrid } from '../world/tilemap.js'
import { getDialogue, canEnter } from '../world/dialogue.js'
import { lightBrazier, extinguishBrazier, allBraziersLit } from '../puzzles/braziers.js'
import { pushBlock } from '../puzzles/windPush.js'
import { growBridge } from '../puzzles/natureBridge.js'
import { createBossPhase, strikeTotem, bossHit, bossDefeated } from '../puzzles/bossTotems.js'
import { shouldFreeze } from '../util/visibility.js'
import {
  meleeTargetTile, knockbackTile, lightOrbVelocity, forwardOffset,
  windGustTiles, shouldFlipMerlin, FACING_ANGLE,
} from '../fx/feel.js'

const TILE = 16
const SPEED = 70

export class WorldScene extends Phaser.Scene {
  constructor() { super('WorldScene') }

  init(data) {
    this.levelId = data?.levelId || 'hub'
  }

  create() {
    this.level = loadLevel(this.levelId)
    this.extraWalk = new Set()
    this.blocks = []
    this.blockSprites = []
    this.brazierLit = []
    this.brazierSprites = []
    this.enemies = []
    this.enemySprites = []
    this.projectiles = []
    this.npcs = []
    this.facing = 'S'
    this.lastMelee = 0
    this.invulnUntil = 0
    this.dialogue = null
    this.bossPhase = null
    this.totemSprites = []
    this.fogGateSprites = []
    this.frozen = false

    this.drawTiles()
    this.setupPuzzles()
    this.spawnEntities()

    let state = getState(this)
    if (this.level.spellUnlock && !state.spellsUnlocked.includes(this.level.spellUnlock)) {
      state = unlockSpell(state, this.level.spellUnlock)
      const names = { light: 'Lumière', wind: 'Vent', nature: 'Nature' }
      showMessage(this, `Sort : ${names[this.level.spellUnlock]}`)
    }
    // reset heal token each hub visit
    if (this.levelId === 'hub') state = setFlag(state, 'hubHealReady', true)
    state = setPosition(state, { scene: this.levelId, regionId: this.levelId, x: this.level.spawn.x, y: this.level.spawn.y })
    setState(this, state)

    const spawn = tileToWorld(this.level.spawn.x, this.level.spawn.y, TILE)
    this.player = this.physics.add.sprite(spawn.x, spawn.y, 'merlin')
    this.player.setCollideWorldBounds(true)
    this.player.body.setSize(10, 10).setOffset(3, 12)

    this.cameras.main.setBounds(0, 0, this.level.width * TILE, this.level.height * TILE)
    this.cameras.main.startFollow(this.player, true, 0.15, 0.15)
    this.physics.world.setBounds(0, 0, this.level.width * TILE, this.level.height * TILE)

    this.keys = createKeyTracker(this)
    this.visHandler = () => {
      this.frozen = shouldFreeze(document.visibilityState)
    }
    document.addEventListener('visibilitychange', this.visHandler)
    this.events.once('shutdown', () => {
      document.removeEventListener('visibilitychange', this.visHandler)
    })

    if (this.level.finalBoss) {
      this.bossPhase = createBossPhase()
    }
    this.addAtmosphere()
  }

  addAtmosphere() {
    const w = this.scale.width
    const h = this.scale.height
    const g = this.add.graphics().setScrollFactor(0).setDepth(800)
    g.fillStyle(0x000000, 0.45)
    g.fillRect(0, 0, w, 18)
    g.fillRect(0, h - 22, w, 22)
    g.fillRect(0, 0, 22, h)
    g.fillRect(w - 22, 0, 22, h)
    g.fillStyle(0x000000, 0.2)
    g.fillRect(0, 0, w, 36)
    g.fillRect(0, h - 40, w, 40)
    this.mist = []
    for (let i = 0; i < 6; i++) {
      const m = this.add.image(
        Math.random() * this.level.width * TILE,
        Math.random() * this.level.height * TILE,
        'mist-puff',
      ).setDepth(50).setAlpha(0.22).setBlendMode(Phaser.BlendModes.ADD)
      this.mist.push({ spr: m, vx: 6 + Math.random() * 10, baseY: m.y, t: Math.random() * Math.PI * 2 })
    }
  }

  updateMist(dt) {
    if (!this.mist) return
    const maxX = this.level.width * TILE + 40
    for (const m of this.mist) {
      m.t += dt
      m.spr.x += m.vx * dt
      m.spr.y = m.baseY + Math.sin(m.t) * 4
      if (m.spr.x > maxX) m.spr.x = -40
    }
  }

  drawTiles() {
    this.walls = this.physics.add.staticGroup()
    this.wallAt = new Map()
    this.tileImg = new Map()
    for (let y = 0; y < this.level.height; y++) {
      for (let x = 0; x < this.level.width; x++) {
        const ch = this.level.tiles[y][x]
        let key = 'tile-floor'
        if (ch === '#') key = 'tile-wall'
        else if (ch === '~') key = 'tile-water'
        const { x: wx, y: wy } = tileToWorld(x, y, TILE)
        const img = this.add.image(wx, wy, key)
        this.tileImg.set(`${x},${y}`, img)
        if (ch === '#' || ch === '~') {
          const wall = this.walls.create(wx, wy, key)
          wall.setVisible(false)
          wall.refreshBody()
          this.wallAt.set(`${x},${y}`, wall)
        }
        if (ch === 'N' || ch === 'X') {
          this.add.rectangle(wx, wy, 14, 14, 0xe8c547, 0.25)
        }
      }
    }
  }

  openTile(x, y) {
    const row = this.level.tiles[y]
    if (!row) return
    const a = row.split('')
    a[x] = '.'
    this.level.tiles[y] = a.join('')
    const wall = this.wallAt.get(`${x},${y}`)
    if (wall) {
      wall.destroy()
      this.wallAt.delete(`${x},${y}`)
    }
    const img = this.tileImg.get(`${x},${y}`)
    if (img) img.setTexture('tile-floor')
    else {
      const pos = tileToWorld(x, y, TILE)
      this.add.image(pos.x, pos.y, 'tile-floor')
    }
  }

  setupPuzzles() {
    for (const p of this.level.puzzles) {
      if (p.type === 'braziers') {
        this.brazierLit = p.tiles.map(() => false)
        p.tiles.forEach(([tx, ty], i) => {
          const { x, y } = tileToWorld(tx, ty, TILE)
          const s = this.add.image(x, y, 'brazier-off')
          s.setData('index', i)
          this.brazierSprites.push(s)
        })
        // fog gate visuals on blocked tiles near N
        for (let x = 10; x < 14; x++) {
          if (this.level.tiles[4]?.[x] === '#') {
            const { x: wx, y: wy } = tileToWorld(x, 4, TILE)
            const g = this.add.rectangle(wx, wy, 16, 16, 0x7a9bb0, 0.55)
            this.fogGateSprites.push({ gx: x, gy: 4, sprite: g })
          }
        }
      }
      if (p.type === 'push-blocks') {
        this.plates = p.plates
        p.blocks.forEach((b) => {
          this.blocks.push({ ...b })
          const { x, y } = tileToWorld(b.x, b.y, TILE)
          this.blockSprites.push(this.add.image(x, y, 'block'))
        })
      }
      if (p.type === 'vine-bridges') {
        this.seeds = p.seeds
        this.grown = 0
      }
      if (p.type === 'totems') {
        p.tiles.forEach(([tx, ty], i) => {
          const { x, y } = tileToWorld(tx, ty, TILE)
          const s = this.add.image(x, y, 'totem-on')
          s.setData('spell', p.spells[i])
          this.totemSprites.push(s)
        })
      }
    }
  }

  spawnEntities() {
    for (const e of this.level.enemies) {
      const enemy = createEnemy(e.type, e.x, e.y, e)
      this.enemies.push(enemy)
      const { x, y } = tileToWorld(e.x, e.y, TILE)
      const tex = e.type.includes('boss') || e.type === 'final-boss' ? 'boss' : 'enemy-shadow'
      const spr = this.physics.add.sprite(x, y, tex)
      spr.body.setSize(12, 12)
      this.enemySprites.push(spr)
    }
    for (const n of this.level.npcs || []) {
      const { x, y } = tileToWorld(n.x, n.y, TILE)
      const spr = this.add.image(x, y, 'npc')
      spr.setData('npcId', n.id)
      this.npcs.push({ ...n, sprite: spr })
    }
  }

  update(_t, dtMs) {
    if (this.frozen || this.dialogue) {
      if (this.player?.body) this.player.body.setVelocity(0, 0)
      this.handleDialogueInput()
      return
    }
    const dt = Math.min(0.05, dtMs / 1000)
    let state = getState(this)
    state = regenMana(state, dt)
    setState(this, state, { save: false })

    this.movePlayer(dt)
    this.updateMist(dt)
    this.handleActions()
    this.updateEnemies(dt)
    this.updateProjectiles(dt)
    this.checkExits()
  }

  movePlayer() {
    const touch = this.registry.get('touchVec') || { x: 0, y: 0 }
    const v = vectorFromKeys(this.keys.down)
    let x = v.x || touch.x
    let y = v.y || touch.y
    if (x || y) this.facing = facingFromVector(x, y)
    this.player.setFlipX(shouldFlipMerlin(this.facing))
    this.player.body.setVelocity(x * SPEED, y * SPEED)

    // soft tile collision for water/walls without physics gaps
    const tile = worldToTile(this.player.x, this.player.y, TILE)
    if (!isWalkable(this.level, tile.x, tile.y, this.extraWalk) || this.blockAt(tile.x, tile.y)) {
      this.player.x -= x * 4
      this.player.y -= y * 4
    }
  }

  blockAt(x, y) {
    return this.blocks.some((b) => b.x === x && b.y === y)
  }

  handleActions() {
    const touch = this.registry.get('touchAction')
    if (touch) this.registry.set('touchAction', null)

    if (this.keys.consume('Escape') || this.keys.down.Escape) {
      this.keys.down.Escape = false
      this.scene.pause()
      this.scene.launch('PauseScene')
      return
    }

    let state = getState(this)
    if (this.keys.consume('Digit1') && state.spellsUnlocked.includes('light')) {
      state = setActiveSpell(state, 'light'); setState(this, state)
    }
    if (this.keys.consume('Digit2') && state.spellsUnlocked.includes('wind')) {
      state = setActiveSpell(state, 'wind'); setState(this, state)
    }
    if (this.keys.consume('Digit3') && state.spellsUnlocked.includes('nature')) {
      state = setActiveSpell(state, 'nature'); setState(this, state)
    }
    if (touch === 'cycle' || this.keys.consume('Tab')) {
      state = getState(this)
      const next = cycleSpell(state.spellsUnlocked, state.activeSpell, 1)
      setState(this, setActiveSpell(state, next))
    }

    const now = this.time.now
    if ((this.keys.consume('Space') || touch === 'melee') && canMelee(state, now, this.lastMelee)) {
      this.lastMelee = now
      this.doMelee()
    }
    if (this.keys.consume('KeyF') || touch === 'cast') this.doCast()
    if (this.keys.consume('KeyE')) this.tryInteract()
  }

  handleDialogueInput() {
    if (!this.dialogue) return
    if (this.keys.consume('KeyE') || this.keys.consume('Space') || this.keys.consume('Enter')) {
      this.dialogue.i += 1
      if (this.dialogue.i >= this.dialogue.lines.length) {
        this.finishDialogue()
      } else {
        showMessage(this, this.dialogue.lines[this.dialogue.i])
      }
    }
  }

  finishDialogue() {
    const d = this.dialogue
    this.dialogue = null
    let state = getState(this)
    if (d.onCompleteFlag) state = setFlag(state, d.onCompleteFlag, true)
    if (d.healOnComplete && state.flags.hubHealReady) {
      state = healFull(state)
      state = setFlag(state, 'hubHealReady', false)
      showMessage(this, 'Blessures soignées.')
    }
    setState(this, state)
  }

  tryInteract() {
    const tile = worldToTile(this.player.x, this.player.y, TILE)
    for (const n of this.npcs) {
      if (Math.abs(n.x - tile.x) + Math.abs(n.y - tile.y) <= 1) {
        const d = getDialogue(n.id)
        this.dialogue = { ...d, i: 0 }
        showMessage(this, d.lines[0])
        return
      }
    }
    // chest
    for (const c of this.level.chests || []) {
      if (c.x === tile.x && c.y === tile.y) {
        let state = getState(this)
        if (state.flags[`chest:${c.id}`]) return
        state = setFlag(state, `chest:${c.id}`, true)
        if (c.item === 'heart-piece') {
          state = bumpHeartsMax(state, 1)
          showMessage(this, 'Cœur supplémentaire !')
        }
        setState(this, state)
      }
    }
  }

  doMelee() {
    const tile = worldToTile(this.player.x, this.player.y, TILE)
    const target = meleeTargetTile(tile, this.facing)
    const off = forwardOffset(this.facing, 12)
    const arc = this.add.image(this.player.x + off.x, this.player.y + off.y, 'melee-arc')
      .setDepth(200)
      .setRotation(FACING_ANGLE[this.facing] || 0)
      .setAlpha(0.95)
    this.tweens.add({
      targets: arc,
      alpha: 0,
      scale: 1.35,
      duration: 160,
      onComplete: () => arc.destroy(),
    })
    this.cameras.main.shake(60, 0.004)

    let hitAny = false
    this.enemies.forEach((e, i) => {
      if (!e.alive) return
      if (e.x === target.x && e.y === target.y) {
        hitAny = true
        this.hurtEnemy(i, MELEE_DAMAGE, 'melee', this.facing)
      }
    })
    if (hitAny) this.cameras.main.shake(80, 0.008)
    if (this.bossPhase) {
      this.bossPhase = bossHit(this.bossPhase, 'melee', this.time.now)
      this.checkFinalBoss()
    }
  }

  doCast() {
    let state = getState(this)
    if (!state.activeSpell) return
    const tile = worldToTile(this.player.x, this.player.y, TILE)
    const { state: next, effect } = castSpell(state, state.activeSpell, tile, this.facing)
    if (!effect) {
      showMessage(this, 'Mana insuffisant')
      return
    }
    setState(this, next)
    if (effect.type === 'projectile') this.spawnProjectile(effect)
    if (effect.type === 'push') this.applyWind(effect, tile)
    if (effect.type === 'grow') this.applyNature(effect)
    if (this.bossPhase && state.activeSpell) {
      this.bossPhase = strikeTotem(this.bossPhase, state.activeSpell, this.time.now)
      this.totemSprites.forEach((s) => {
        if (s.getData('spell') === state.activeSpell) s.setTexture('totem-off')
      })
      if (this.bossPhase.vulnerableUntil) showMessage(this, 'Le Gardien est vulnérable !')
    }
  }

  spawnProjectile(effect) {
    const off = forwardOffset(this.facing, 8)
    const { vx, vy } = lightOrbVelocity(this.facing, 180)
    const spr = this.add.image(this.player.x + off.x, this.player.y + off.y, 'light-orb')
      .setDepth(220)
      .setBlendMode(Phaser.BlendModes.ADD)
    const glow = this.add.image(spr.x, spr.y, 'spell-light')
      .setDepth(219)
      .setScale(2)
      .setAlpha(0.55)
      .setBlendMode(Phaser.BlendModes.ADD)
    this.projectiles.push({
      type: 'projectile',
      spell: effect.spell,
      wx: spr.x,
      wy: spr.y,
      vx,
      vy,
      spr,
      glow,
      life: 1.1,
      trail: 0,
    })
    this.cameras.main.shake(40, 0.003)
  }

  updateProjectiles(dt) {
    const remain = []
    for (const p of this.projectiles) {
      p.life -= dt
      p.wx += p.vx * dt
      p.wy += p.vy * dt
      p.spr.setPosition(p.wx, p.wy)
      if (p.glow) p.glow.setPosition(p.wx, p.wy)
      p.trail = (p.trail || 0) + dt
      if (p.trail > 0.04) {
        p.trail = 0
        const spark = this.add.image(p.wx, p.wy, 'spell-light')
          .setDepth(218)
          .setAlpha(0.7)
          .setBlendMode(Phaser.BlendModes.ADD)
        this.tweens.add({
          targets: spark,
          alpha: 0,
          scale: 0.3,
          duration: 180,
          onComplete: () => spark.destroy(),
        })
      }
      const tx = Math.floor(p.wx / TILE)
      const ty = Math.floor(p.wy / TILE)
      const bp = this.level.puzzles.find((q) => q.type === 'braziers')
      if (bp) {
        bp.tiles.forEach(([bx, by], i) => {
          if (bx === tx && by === ty && !this.brazierLit[i]) {
            this.brazierLit = lightBrazier(this.brazierLit, i)
            this.brazierSprites[i].setTexture('brazier-on')
            this.checkBraziers()
            p.life = 0
          }
        })
      }
      this.enemies.forEach((e, i) => {
        if (!e.alive) return
        const pos = tileToWorld(e.x, e.y, TILE)
        if (Math.hypot(pos.x - p.wx, pos.y - p.wy) < 12) {
          this.hurtEnemy(i, 2, 'light', this.facing)
          p.life = 0
        }
      })
      if (this.bossPhase) {
        this.bossPhase = bossHit(this.bossPhase, 'light', this.time.now)
        this.checkFinalBoss()
      }
      const ch = this.level.tiles[ty]?.[tx]
      if (ch === '#') p.life = 0
      if (p.life <= 0) {
        p.spr.destroy()
        p.glow?.destroy()
      } else remain.push(p)
    }
    this.projectiles = remain
  }

  applyWind(effect, originTile) {
    const origin = originTile || worldToTile(this.player.x, this.player.y, TILE)
    const dir = effect.dir
    const tiles = windGustTiles(origin, dir)
    const off = forwardOffset(dir, 14)
    for (let i = 0; i < 5; i++) {
      const puff = this.add.image(
        this.player.x + off.x + (Math.random() - 0.5) * 10,
        this.player.y + off.y + (Math.random() - 0.5) * 10,
        'wind-puff',
      ).setDepth(210).setAlpha(0.85).setRotation(FACING_ANGLE[dir] || 0)
      const d = { N: [0, -1], S: [0, 1], E: [1, 0], W: [-1, 0] }[dir]
      this.tweens.add({
        targets: puff,
        x: puff.x + d[0] * (28 + i * 10),
        y: puff.y + d[1] * (28 + i * 10),
        alpha: 0,
        scaleX: 1.4,
        duration: 220 + i * 30,
        onComplete: () => puff.destroy(),
      })
    }
    this.cameras.main.shake(70, 0.005)

    const grid = buildWalkGrid(this.level, this.extraWalk)
    const hitSet = new Set(tiles.map((t) => `${t.x},${t.y}`))

    this.blocks.forEach((b, i) => {
      if (!hitSet.has(`${b.x},${b.y}`)) return
      this.blocks.forEach((o, j) => {
        if (i !== j) grid[o.y][o.x] = false
      })
      const next = pushBlock(grid, b, dir)
      if (next) {
        this.blocks[i] = next
        const { x, y } = tileToWorld(next.x, next.y, TILE)
        this.tweens.add({
          targets: this.blockSprites[i],
          x, y,
          duration: 100,
        })
        this.checkPlates()
      }
    })
    this.enemies.forEach((e, i) => {
      if (!e.alive) return
      if (!hitSet.has(`${e.x},${e.y}`)) return
      const next = pushBlock(grid, e, dir)
      if (next) {
        e.x = next.x
        e.y = next.y
        const { x, y } = tileToWorld(next.x, next.y, TILE)
        const spr = this.enemySprites[i]
        this.tweens.add({ targets: spr, x, y, duration: 100 })
        this.blinkSprite(spr)
      }
    })
  }

  applyNature(effect) {
    const seed = (this.seeds || []).find((s) => {
      const tile = worldToTile(this.player.x, this.player.y, TILE)
      return Math.abs(s.x - tile.x) + Math.abs(s.y - tile.y) <= 1
    })
    const use = seed || { x: effect.x, y: effect.y, dir: effect.dir }
    const tiles = growBridge({ x: use.x, y: use.y }, use.dir || effect.dir)
    tiles.forEach((t) => {
      this.extraWalk.add(`${t.x},${t.y}`)
      const { x, y } = tileToWorld(t.x, t.y, TILE)
      this.add.image(x, y, 'bridge').setAlpha(0.9)
    })
    this.grown = (this.grown || 0) + 1
    if (this.grown >= (this.seeds?.length || 1)) {
      let state = setFlag(getState(this), 'bridges-ready', true)
      setState(this, state)
      showMessage(this, 'Les lianes forment un pont.')
    }
  }

  checkBraziers() {
    if (!allBraziersLit(this.brazierLit)) return
    let state = setFlag(getState(this), 'fog-gate', true)
    setState(this, state)
    showMessage(this, 'La brume se dissipe.')
    // open fog gate tiles
    this.fogGateSprites.forEach(({ gx, gy, sprite }) => {
      sprite.destroy()
      this.openTile(gx, gy)
    })
    this.fogGateSprites = []
  }

  checkPlates() {
    if (!this.plates) return
    const ok = this.plates.every(([px, py]) => this.blocks.some((b) => b.x === px && b.y === py))
    if (!ok) return
    let state = setFlag(getState(this), 'arch-open', true)
    setState(this, state)
    showMessage(this, 'L’arche s’ouvre.')
    // open arch at row 5
    for (let x = 11; x < 14; x++) {
      if (this.level.tiles[5]?.[x] === '#') this.openTile(x, 5)
    }
  }

  blinkSprite(spr) {
    if (!spr) return
    let n = 0
    const iv = this.time.addEvent({
      delay: 60,
      repeat: 5,
      callback: () => {
        n += 1
        spr.setAlpha(n % 2 ? 0.25 : 1)
        if (n >= 6) spr.setAlpha(1)
      },
    })
    spr.setTint(0xff8888)
    this.time.delayedCall(360, () => spr.clearTint())
    return iv
  }

  hurtEnemy(index, amount, kind, knockFacing = null) {
    const e = this.enemies[index]
    if (!e.alive) return
    const next = damageEnemy(e, amount, kind)
    this.enemies[index] = next
    const spr = this.enemySprites[index]
    if (!next.alive) {
      spr?.destroy()
      if (this.level.fragment && this.level.boss) {
        let state = addFragment(getState(this), this.level.fragment)
        setState(this, state)
        const names = { forest: 'Forêt', ruins: 'Ruines', sanctuary: 'Sanctuaire' }
        showMessage(this, `Fragment : ${names[this.level.fragment]}`)
        this.time.delayedCall(1200, () => this.travel('hub'))
      }
      return
    }
    this.blinkSprite(spr)
    if (knockFacing) {
      const free = (x, y) => isWalkable(this.level, x, y, this.extraWalk) && !this.blockAt(x, y)
      const kb = knockbackTile({ x: e.x, y: e.y }, knockFacing, free)
      if (kb) {
        next.x = kb.x
        next.y = kb.y
        this.enemies[index] = next
        const { x, y } = tileToWorld(kb.x, kb.y, TILE)
        this.tweens.add({ targets: spr, x, y, duration: 90 })
      }
    }
  }

  checkFinalBoss() {
    if (!this.bossPhase || !bossDefeated(this.bossPhase)) return
    let state = setFlag(getState(this), 'won', true)
    setState(this, state)
    showMessage(this, 'Les brumes se lèvent.')
    this.enemies.forEach((e, i) => {
      e.alive = false
      this.enemySprites[i]?.destroy()
    })
    this.time.delayedCall(2000, () => {
      this.scene.stop('UIScene')
      this.scene.start('TitleScene')
    })
  }

  updateEnemies(dt) {
    const now = this.time.now
    const pt = worldToTile(this.player.x, this.player.y, TILE)
    this.enemies.forEach((e, i) => {
      if (!e.alive) return
      // chase simply
      let dx = Math.sign(pt.x - e.x)
      let dy = Math.sign(pt.y - e.y)
      if (Math.random() < 0.02) { dx = 0; dy = 0 }
      const nx = e.x + (Math.random() < e.speed * dt * 0.08 ? dx : 0)
      const ny = e.y + (Math.random() < e.speed * dt * 0.08 ? dy : 0)
      if (isWalkable(this.level, nx, ny, this.extraWalk) && !this.blockAt(nx, ny)) {
        e.x = nx
        e.y = ny
        const { x, y } = tileToWorld(e.x, e.y, TILE)
        this.enemySprites[i].setPosition(x, y)
      }
      // contact damage
      if (e.x === pt.x && e.y === pt.y && now > this.invulnUntil) {
        this.invulnUntil = now + 800
        let state = applyDamage(getState(this), 1)
        setState(this, state)
        this.cameras.main.flash(100, 120, 20, 20)
        if (state.hearts <= 0) this.respawn()
      }
      // shadow extinguishes braziers
      if (e.type === 'shadow-blob') {
        const bp = this.level.puzzles.find((q) => q.type === 'braziers')
        if (bp && !e._extTimer) e._extTimer = 0
        if (bp) {
          e._extTimer = (e._extTimer || 0) + dt
          if (e._extTimer > 4) {
            e._extTimer = 0
            bp.tiles.forEach(([bx, by], bi) => {
              if (Math.abs(bx - e.x) + Math.abs(by - e.y) <= 1 && this.brazierLit[bi]) {
                this.brazierLit = extinguishBrazier(this.brazierLit, bi)
                this.brazierSprites[bi].setTexture('brazier-off')
                showMessage(this, 'Un brasero s’est éteint…')
              }
            })
          }
        }
      }
    })
  }

  respawn() {
    const cp = this.level.checkpoints[0] || this.level.spawn
    let state = getState(this)
    state = { ...state, hearts: Math.max(1, state.heartsMax - 1) }
    // actually spec: respawn with hearts — give at least 3 or heartsMax?
    state = { ...state, hearts: state.heartsMax }
    setState(this, state)
    showMessage(this, 'Tu reprends tes esprits…')
    const { x, y } = tileToWorld(cp.x, cp.y, TILE)
    this.player.setPosition(x, y)
    // reset room enemies
    this.enemies.forEach((e, i) => {
      if (!e.alive && !this.level.boss && !this.level.finalBoss) {
        const fresh = createEnemy(e.type, this.level.enemies[i].x, this.level.enemies[i].y, this.level.enemies[i])
        this.enemies[i] = fresh
        const pos = tileToWorld(fresh.x, fresh.y, TILE)
        if (!this.enemySprites[i] || !this.enemySprites[i].active) {
          const tex = fresh.type.includes('boss') ? 'boss' : 'enemy-shadow'
          this.enemySprites[i] = this.physics.add.sprite(pos.x, pos.y, tex)
        } else {
          this.enemySprites[i].setPosition(pos.x, pos.y).setActive(true).setVisible(true)
        }
      }
    })
  }

  checkExits() {
    const tile = worldToTile(this.player.x, this.player.y, TILE)
    for (const ex of this.level.exits) {
      const [exx, exy] = ex.tile
      if (tile.x !== exx || tile.y !== exy) continue
      const state = getState(this)
      if (ex.requires && !state.flags[ex.requires]) {
        showMessage(this, 'Pas encore…')
        // bump back
        this.player.y += this.facing === 'N' ? 12 : -12
        this.player.x += this.facing === 'W' ? 12 : this.facing === 'E' ? -12 : 0
        return
      }
      if (!canEnter(ex.to, state) && ex.to !== 'hub' && !ex.to.includes('dungeon') && !ex.to.includes('boss')) {
        showMessage(this, 'Il te faut parler à Branoc.')
        this.player.y -= 12
        return
      }
      // hub doors to regions: check canEnter
      if (this.levelId === 'hub') {
        if (!canEnter(ex.to, state)) {
          showMessage(this, 'Pas encore accessible.')
          this.player.y -= 12
          return
        }
      }
      this.travel(ex.to)
      return
    }
  }

  travel(levelId) {
    const state = setPosition(getState(this), {
      scene: levelId,
      regionId: levelId,
      x: 0,
      y: 0,
    })
    setState(this, state)
    this.scene.start('WorldScene', { levelId })
  }
}

function listReplace(row, x, ch) {
  const a = row.split('')
  a[x] = ch
  return a.join('')
}
