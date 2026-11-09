import { loadLevel } from '../data/index.js'
import { getState, setState, showMessage } from '../state/registry.js'
import {
  applyDamage, regenMana, unlockSpell, addFragment, setFlag, healFull,
  setActiveSpell, bumpHeartsMax, setPosition,
} from '../state/gameState.js'
import { vectorFromKeys, cycleSpell, createKeyTracker } from '../input/controls.js'
import { trySelectSpell } from '../input/spellSelect.js'
import { facingFromVector, canMelee, MELEE_DAMAGE, SPELL_COST } from '../combat/combat.js'
import { spendMana } from '../state/gameState.js'
import { createEnemy, damageEnemy } from '../world/enemies.js'
import { isWalkable, tileToWorld, worldToTile, buildWalkGrid, isSolidTile } from '../world/tilemap.js'
import { textureForCell } from '../world/autotile.js'
import { getDialogue, canEnter } from '../world/dialogue.js'
import { lightBrazier, extinguishBrazier, allBraziersLit } from '../puzzles/braziers.js'
import { pushBlock } from '../puzzles/windPush.js'
import { growBridge } from '../puzzles/natureBridge.js'
import { createBossPhase, strikeTotem, bossHit, bossDefeated } from '../puzzles/bossTotems.js'
import { shouldFreeze } from '../util/visibility.js'
import {
  meleeTargetTile, knockbackTile, forwardOffset, windGustTiles, FACING_ANGLE,
} from '../fx/feel.js'
import { windGustFxSpec } from '../fx/windFx.js'
import { planDecor } from '../world/decor.js'
import { GAME_CONFIG } from '../gameConfig.js'

const TILE = GAME_CONFIG.tileSize
const SPEED = 110

const ENEMY_TEX = {
  'shadow-blob': 'ombre',
  'mist-wolf': 'ombre',
  'stone-specter': 'ombre',
  crow: 'ombre',
  root: 'ombre',
  fairy: 'ombre',
  'region-boss': 'gardien',
  'final-boss': 'gardien',
}

export class WorldScene extends Phaser.Scene {
  constructor() { super('WorldScene') }

  init(data) { this.levelId = data?.levelId || 'hub' }

  create() {
    this.level = loadLevel(this.levelId)
    this.extraWalk = new Set()
    this.blocks = []
    this.blockSprites = []
    this.brazierLit = []
    this.brazierSprites = []
    this.enemies = []
    this.enemySprites = []
    this.npcs = []
    this.solidProps = []
    this.depthSprites = []
    this.canopySprites = []
    this.facing = 'S'
    this.lastMelee = 0
    this.invulnUntil = 0
    this.dialogue = null
    this.bossPhase = null
    this.totemSprites = []
    this.frozen = false
    this.grown = 0
    this.seeds = []
    this.plates = null
    this.beam = null

    this.drawTiles()
    this.setupPuzzles()
    this.spawnProps()
    this.spawnDecor()
    this.spawnEntities()
    this.addAtmosphere()

    let state = getState(this)
    if (this.level.spellUnlock && !state.spellsUnlocked.includes(this.level.spellUnlock)) {
      state = unlockSpell(state, this.level.spellUnlock)
      const names = { light: 'Lumière', wind: 'Vent', nature: 'Nature' }
      showMessage(this, `Sort : ${names[this.level.spellUnlock]}`)
    }
    if (this.levelId === 'hub') state = setFlag(state, 'hubHealReady', true)
    state = setPosition(state, {
      scene: this.levelId, regionId: this.levelId,
      x: this.level.spawn.x, y: this.level.spawn.y,
    })
    setState(this, state)

    const spawn = tileToWorld(this.level.spawn.x, this.level.spawn.y, TILE)
    this.player = this.physics.add.sprite(spawn.x, spawn.y, 'merlin-face')
    this.player.setCollideWorldBounds(true)
    this.player.body.setSize(14, 12).setOffset(9, 32)
    this.depthSprites.push(this.player)

    const worldW = Math.max(this.level.width * TILE, this.scale.width)
    const worldH = Math.max(this.level.height * TILE, this.scale.height)
    this.cameras.main.setBounds(0, 0, worldW, worldH)
    this.cameras.main.startFollow(this.player, true, 0.12, 0.12)
    this.cameras.main.setRoundPixels(true)
    this.physics.world.setBounds(0, 0, this.level.width * TILE, this.level.height * TILE)

    this.keys = createKeyTracker(this)
    this.visHandler = () => { this.frozen = shouldFreeze(document.visibilityState) }
    document.addEventListener('visibilitychange', this.visHandler)
    this.events.once('shutdown', () => document.removeEventListener('visibilitychange', this.visHandler))

    if (this.level.finalBoss) this.bossPhase = createBossPhase()
  }

  drawTiles() {
    this.walls = this.physics.add.staticGroup()
    for (let y = 0; y < this.level.height; y++) {
      for (let x = 0; x < this.level.width; x++) {
        const ch = this.level.tiles[y][x]
        const key = textureForCell(this.level.tiles, x, y)
        const { x: wx, y: wy } = tileToWorld(x, y, TILE)
        // under bridge draw water then skip pont texture as tile (prop handles bridge art)
        if (ch === 'P') {
          this.add.image(wx, wy, 'eau-ruisseau').setDepth(0)
        } else {
          const tex = this.textures.exists(key) ? key : 'herbe-1'
          this.add.image(wx, wy, tex).setDepth(0)
        }
        if (isSolidTile(ch) && ch !== 'P') {
          const wall = this.walls.create(wx, wy, 'herbe-1')
          wall.setVisible(false)
          wall.refreshBody()
        }
      }
    }
  }

  spawnProps() {
    for (const p of this.level.props || []) {
      const wx = p.x * TILE + TILE / 2
      const wy = p.y * TILE + TILE / 2
      if (!this.textures.exists(p.key)) continue
      const spr = this.add.image(wx, wy, p.key)
      spr.setOrigin(0.5, p.originY ?? 1)
      spr.setDepth(wy)
      this.depthSprites.push(spr)
      if (p.key?.startsWith('arbre-') || p.canopy) {
        spr.setData('canopy', true)
        spr.setData('baseAlpha', 1)
        this.canopySprites.push(spr)
      }
      if (p.solid) {
        this.solidProps.push({
          x: Math.floor(p.x), y: Math.floor(p.y),
          spr,
        })
      }
    }
  }

  spawnDecor() {
    for (const d of planDecor(this.level)) {
      // skip if prop already at tile
      if ((this.level.props || []).some((p) => Math.floor(p.x) === d.x && Math.floor(p.y) === d.y)) continue
      if (!this.textures.exists(d.key)) continue
      const { x: wx, y: wy } = tileToWorld(d.x, d.y, TILE)
      const spr = this.add.image(wx, wy, d.key)
      spr.setOrigin(0.5, d.originY ?? 1)
      if (d.scale) spr.setScale(d.scale)
      spr.setDepth(wy)
      this.depthSprites.push(spr)
      if (d.key?.startsWith('arbre-') || d.canopy) {
        spr.setData('canopy', true)
        spr.setData('baseAlpha', 1)
        this.canopySprites.push(spr)
      }
      if (d.solid) this.solidProps.push({ x: d.x, y: d.y, spr })
    }
    // canopy along top/sides
    for (let x = 0; x < this.level.width; x += 3) {
      if (this.textures.exists('canopee-bord')) {
        this.add.image(x * TILE + 64, 24, 'canopee-bord').setDepth(900).setAlpha(0.7).setScrollFactor(1)
      }
    }
  }

  setupPuzzles() {
    for (const p of this.level.puzzles) {
      if (p.type === 'braziers') {
        this.brazierLit = p.tiles.map(() => false)
        p.tiles.forEach(([tx, ty], i) => {
          const { x, y } = tileToWorld(tx, ty, TILE)
          const s = this.add.image(x, y, 'brasero-off').setDepth(y)
          s.setData('index', i)
          this.brazierSprites.push(s)
          this.depthSprites.push(s)
        })
      }
      if (p.type === 'push-blocks') {
        this.plates = p.plates
        p.blocks.forEach((b) => {
          this.blocks.push({ ...b })
          const { x, y } = tileToWorld(b.x, b.y, TILE)
          const s = this.add.image(x, y, 'bloc-pierre').setDepth(y)
          this.blockSprites.push(s)
          this.depthSprites.push(s)
        })
      }
      if (p.type === 'vine-bridges') {
        this.seeds = p.seeds
        this.grown = 0
      }
      if (p.type === 'totems') {
        p.tiles.forEach(([tx, ty], i) => {
          const { x, y } = tileToWorld(tx, ty, TILE)
          const s = this.add.image(x, y, 'totem-on').setOrigin(0.5, 1).setDepth(y)
          s.setData('spell', p.spells[i])
          this.totemSprites.push(s)
          this.depthSprites.push(s)
        })
      }
    }
  }

  spawnEntities() {
    for (const e of this.level.enemies) {
      const enemy = createEnemy(e.type, e.x, e.y, e)
      this.enemies.push(enemy)
      const { x, y } = tileToWorld(e.x, e.y, TILE)
      const tex = ENEMY_TEX[e.type] || 'ombre'
      const spr = this.physics.add.sprite(x, y, tex)
      spr.body.setSize(16, 12).setOffset(8, tex === 'gardien' ? 40 : 16)
      this.enemySprites.push(spr)
      this.depthSprites.push(spr)
    }
    for (const n of this.level.npcs || []) {
      const { x, y } = tileToWorld(n.x, n.y, TILE)
      const spr = this.add.image(x, y, 'villageois').setOrigin(0.5, 1).setDepth(y)
      spr.setData('npcId', n.id)
      this.npcs.push({ ...n, sprite: spr })
      this.depthSprites.push(spr)
    }
  }

  addAtmosphere() {
    // Soft warm vignette ≤10% — no blue wash
    const g = this.add.graphics().setScrollFactor(0).setDepth(850)
    const w = this.scale.width
    const h = this.scale.height
    g.fillStyle(0x000000, 0.08)
    g.fillRect(0, 0, w, 16)
    g.fillRect(0, h - 18, w, 18)
    g.fillRect(0, 0, 14, h)
    g.fillRect(w - 14, 0, 14, h)

    this.mist = []
    for (let i = 0; i < 4; i++) {
      if (!this.textures.exists('nappe-brume')) break
      const m = this.add.image(
        (i * 140) % (this.level.width * TILE),
        40 + i * 50,
        'nappe-brume',
      ).setDepth(70).setAlpha(0.22)
      this.mist.push({ spr: m, vx: 4 + i, baseY: m.y, t: i })
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

    this.movePlayer()
    this.updateMist(dt)
    this.handleActions()
    this.updateEnemies(dt)
    this.sortDepth()
    this.updateCanopyFade?.()
    this.checkExits()
  }

  sortDepth() {
    for (const s of this.depthSprites) {
      if (s?.active) s.setDepth(s.y)
    }
  }

  updateMist(dt) {
    if (!this.mist) return
    const maxX = this.level.width * TILE + 80
    for (const m of this.mist) {
      m.t += dt
      m.spr.x += m.vx * dt
      m.spr.y = m.baseY + Math.sin(m.t * 0.6) * 6
      if (m.spr.x > maxX) m.spr.x = -80
    }
  }

  propBlocks(tx, ty) {
    return this.solidProps.some((p) => p.x === tx && p.y === ty)
  }

  blockAt(x, y) {
    return this.blocks.some((b) => b.x === x && b.y === y) || this.propBlocks(x, y)
  }

  movePlayer() {
    const touch = this.registry.get('touchVec') || { x: 0, y: 0 }
    const v = vectorFromKeys(this.keys.down)
    let x = v.x || touch.x
    let y = v.y || touch.y
    if (x || y) this.facing = facingFromVector(x, y)
    this.updateMerlinTexture()
    this.player.body.setVelocity(x * SPEED, y * SPEED)

    const tile = worldToTile(this.player.x, this.player.y, TILE)
    if (!isWalkable(this.level, tile.x, tile.y, this.extraWalk) || this.blockAt(tile.x, tile.y)) {
      this.player.x -= x * 6
      this.player.y -= y * 6
    }
  }

  updateMerlinTexture() {
    if (this.facing === 'N') this.player.setTexture('merlin-dos')
    else if (this.facing === 'S') this.player.setTexture('merlin-face')
    else this.player.setTexture('merlin-profil-droite')
    this.player.setFlipX(this.facing === 'W')
  }

  handleActions() {
    const touch = this.registry.get('touchAction')
    if (touch) this.registry.set('touchAction', null)

    if (this.keys.consume('Escape')) {
      this.scene.pause()
      this.scene.launch('PauseScene')
      return
    }

    let state = getState(this)
    for (const [code, slot] of [['Digit1', 1], ['Digit2', 2], ['Digit3', 3]]) {
      if (!this.keys.consume(code)) continue
      const r = trySelectSpell(getState(this), slot)
      if (r.ok) setState(this, r.state)
      else if (r.locked) {
        const names = { light: 'Lumière', wind: 'Vent', nature: 'Nature' }
        showMessage(this, `${names[r.spellId]} verrouillé`)
      }
    }
    if (touch === 'cycle' || this.keys.consume('Tab')) {
      state = getState(this)
      setState(this, setActiveSpell(state, cycleSpell(state.spellsUnlocked, state.activeSpell, 1)))
    }

    const now = this.time.now
    state = getState(this)
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
      if (this.dialogue.i >= this.dialogue.lines.length) this.finishDialogue()
      else showMessage(this, this.dialogue.lines[this.dialogue.i])
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
    const off = forwardOffset(this.facing, 20)
    // Root cause of invisible arc: depth ≈ player.y (~300) sat under trees/canopy (higher y / depth 900).
    // Keep FX on a UI-like layer above all world decor for ~250ms.
    const arc = this.add.image(this.player.x + off.x, this.player.y + off.y, 'arc-attaque')
      .setDepth(12000)
      .setRotation(FACING_ANGLE[this.facing] || 0)
      .setScale(1.6)
      .setAlpha(1)
    this.tweens.add({
      targets: arc, alpha: 0, scale: 2.1, duration: 260,
      onComplete: () => arc.destroy(),
    })
    this.cameras.main.shake(50, 0.003)
    this.enemies.forEach((e, i) => {
      if (e.alive && e.x === target.x && e.y === target.y) {
        this.hurtEnemy(i, MELEE_DAMAGE, 'melee', this.facing)
      }
    })
    if (this.bossPhase) {
      this.bossPhase = bossHit(this.bossPhase, 'melee', this.time.now)
      this.checkFinalBoss()
    }
  }

  doCast() {
    let state = getState(this)
    if (!state.activeSpell) return
    const cost = SPELL_COST[state.activeSpell]
    const next = spendMana(state, cost)
    if (!next) {
      showMessage(this, 'Mana insuffisant')
      return
    }
    setState(this, next)
    const tile = worldToTile(this.player.x, this.player.y, TILE)

    if (state.activeSpell === 'light') this.castLightBeam(tile)
    else if (state.activeSpell === 'wind') this.castWind(tile)
    else this.castNature(tile)

    if (this.bossPhase) {
      this.bossPhase = strikeTotem(this.bossPhase, state.activeSpell, this.time.now)
      this.totemSprites.forEach((s) => {
        if (s.getData('spell') === state.activeSpell) s.setTexture('totem-off')
      })
      if (this.bossPhase.vulnerableUntil) showMessage(this, 'Le Gardien est vulnérable !')
    }
  }

  castLightBeam(tile) {
    const off = forwardOffset(this.facing, 12)
    const beam = this.add.image(this.player.x + off.x, this.player.y + off.y, 'rayon-lumiere')
      .setOrigin(0, 0.5)
      .setRotation(FACING_ANGLE[this.facing] || 0)
      .setBlendMode(Phaser.BlendModes.ADD)
      .setDepth(12000)
      .setDisplaySize(200, 22)
      .setAlpha(1)
    this.tweens.add({
      targets: beam, alpha: 0, displayY: 0.4, duration: 380,
      onComplete: () => beam.destroy(),
    })
    this.cameras.main.shake(40, 0.002)

    // hit along 6 tiles
    const DELTA = { N: [0, -1], S: [0, 1], E: [1, 0], W: [-1, 0] }
    const [dx, dy] = DELTA[this.facing]
    for (let i = 1; i <= 6; i++) {
      const tx = tile.x + dx * i
      const ty = tile.y + dy * i
      const bp = this.level.puzzles.find((q) => q.type === 'braziers')
      if (bp) {
        bp.tiles.forEach(([bx, by], bi) => {
          if (bx === tx && by === ty && !this.brazierLit[bi]) {
            this.brazierLit = lightBrazier(this.brazierLit, bi)
            this.brazierSprites[bi].setTexture('brasero-on')
            this.checkBraziers()
          }
        })
      }
      this.enemies.forEach((e, ei) => {
        if (e.alive && e.x === tx && e.y === ty) this.hurtEnemy(ei, 2, 'light', this.facing)
      })
      if (this.level.tiles[ty]?.[tx] === '#') break
    }
    if (this.bossPhase) {
      this.bossPhase = bossHit(this.bossPhase, 'light', this.time.now)
      this.checkFinalBoss()
    }
  }

  castWind(origin) {
    const dir = this.facing
    const tiles = windGustTiles(origin, dir)
    // Root cause of invisible Vent: tiny puffs faded alpha from t=0 (~280ms),
    // so captures "just after" F showed nothing. Hold a large gust opaque then fade.
    const spec = windGustFxSpec(this.player, dir)
    const gust = this.add.image(spec.x, spec.y, spec.key)
      .setDepth(spec.depth)
      .setRotation(spec.rotation)
      .setScale(spec.scale)
      .setAlpha(1)
    const trail = this.add.image(spec.x, spec.y, spec.key)
      .setDepth(spec.depth)
      .setRotation(spec.rotation)
      .setScale(spec.scale * 0.75)
      .setAlpha(0.85)
      .setTint(0xa8e8ff)
    const d = { N: [0, -1], S: [0, 1], E: [1, 0], W: [-1, 0] }[dir]
    this.tweens.add({
      targets: [gust, trail],
      x: gust.x + d[0] * 36,
      y: gust.y + d[1] * 36,
      scale: spec.endScale,
      alpha: 0,
      duration: spec.fadeMs,
      delay: spec.holdMs,
      onComplete: () => { gust.destroy(); trail.destroy() },
    })
    this.cameras.main.shake(60, 0.004)
    const grid = buildWalkGrid(this.level, this.extraWalk)
    const hit = new Set(tiles.map((t) => `${t.x},${t.y}`))
    this.blocks.forEach((b, i) => {
      if (!hit.has(`${b.x},${b.y}`)) return
      this.blocks.forEach((o, j) => { if (i !== j) grid[o.y][o.x] = false })
      const next = pushBlock(grid, b, dir)
      if (next) {
        this.blocks[i] = next
        const { x, y } = tileToWorld(next.x, next.y, TILE)
        this.tweens.add({ targets: this.blockSprites[i], x, y, duration: 100 })
        this.checkPlates()
      }
    })
    this.enemies.forEach((e, i) => {
      if (!e.alive || !hit.has(`${e.x},${e.y}`)) return
      const next = pushBlock(grid, e, dir)
      if (next) {
        e.x = next.x; e.y = next.y
        const { x, y } = tileToWorld(next.x, next.y, TILE)
        this.tweens.add({ targets: this.enemySprites[i], x, y, duration: 100 })
        this.blinkSprite(this.enemySprites[i])
      }
    })
  }

  castNature(origin) {
    const seed = (this.seeds || []).find((s) => {
      const tile = worldToTile(this.player.x, this.player.y, TILE)
      return Math.abs(s.x - tile.x) + Math.abs(s.y - tile.y) <= 1
    })
    const use = seed || { x: origin.x, y: origin.y, dir: this.facing }
    const tiles = growBridge({ x: use.x, y: use.y }, use.dir || this.facing)
    tiles.forEach((t) => {
      this.extraWalk.add(`${t.x},${t.y}`)
      const { x, y } = tileToWorld(t.x, t.y, TILE)
      const spr = this.add.image(x, y, 'pont-lianes').setDepth(y - 1)
      this.depthSprites.push(spr)
    })
    this.grown = (this.grown || 0) + 1
    if (this.grown >= (this.seeds?.length || 1)) {
      setState(this, setFlag(getState(this), 'bridges-ready', true))
      showMessage(this, 'Les lianes forment un pont.')
    }
  }

  checkBraziers() {
    if (!allBraziersLit(this.brazierLit)) return
    setState(this, setFlag(getState(this), 'fog-gate', true))
    showMessage(this, 'La brume se dissipe.')
  }

  checkPlates() {
    if (!this.plates) return
    const ok = this.plates.every(([px, py]) => this.blocks.some((b) => b.x === px && b.y === py))
    if (!ok) return
    setState(this, setFlag(getState(this), 'arch-open', true))
    showMessage(this, 'L’arche s’ouvre.')
  }

  blinkSprite(spr) {
    if (!spr) return
    let n = 0
    this.time.addEvent({
      delay: 60, repeat: 5,
      callback: () => { n += 1; spr.setAlpha(n % 2 ? 0.3 : 1) },
    })
    spr.setTint(0xff8888)
    this.time.delayedCall(360, () => spr.clearTint())
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
        next.x = kb.x; next.y = kb.y
        this.enemies[index] = next
        const { x, y } = tileToWorld(kb.x, kb.y, TILE)
        this.tweens.add({ targets: spr, x, y, duration: 90 })
      }
    }
  }

  checkFinalBoss() {
    if (!this.bossPhase || !bossDefeated(this.bossPhase)) return
    setState(this, setFlag(getState(this), 'won', true))
    showMessage(this, 'Les brumes se lèvent.')
    this.enemies.forEach((e, i) => { e.alive = false; this.enemySprites[i]?.destroy() })
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
      let dx = Math.sign(pt.x - e.x)
      let dy = Math.sign(pt.y - e.y)
      const nx = e.x + (Math.random() < e.speed * dt * 0.022 ? dx : 0)
      const ny = e.y + (Math.random() < e.speed * dt * 0.022 ? dy : 0)
      if (isWalkable(this.level, nx, ny, this.extraWalk) && !this.blockAt(nx, ny)) {
        e.x = nx; e.y = ny
        const { x, y } = tileToWorld(e.x, e.y, TILE)
        this.enemySprites[i].setPosition(x, y)
      }
      if (e.x === pt.x && e.y === pt.y && now > this.invulnUntil) {
        this.invulnUntil = now + 1000
        let state = applyDamage(getState(this), 1)
        setState(this, state)
        this.cameras.main.flash(80, 100, 30, 20)
        if (state.hearts <= 0) this.respawn()
      }
      if (e.type === 'shadow-blob') {
        const bp = this.level.puzzles.find((q) => q.type === 'braziers')
        if (bp) {
          e._extTimer = (e._extTimer || 0) + dt
          if (e._extTimer > 4) {
            e._extTimer = 0
            bp.tiles.forEach(([bx, by], bi) => {
              if (Math.abs(bx - e.x) + Math.abs(by - e.y) <= 1 && this.brazierLit[bi]) {
                this.brazierLit = extinguishBrazier(this.brazierLit, bi)
                this.brazierSprites[bi].setTexture('brasero-off')
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
    state = { ...state, hearts: state.heartsMax }
    setState(this, state)
    showMessage(this, 'Tu reprends tes esprits…')
    const { x, y } = tileToWorld(cp.x, cp.y, TILE)
    this.player.setPosition(x, y)
  }

  checkExits() {
    const tile = worldToTile(this.player.x, this.player.y, TILE)
    for (const ex of this.level.exits) {
      const [exx, exy] = ex.tile
      if (tile.x !== exx || tile.y !== exy) continue
      const state = getState(this)
      if (ex.requires && !state.flags[ex.requires]) {
        showMessage(this, 'Pas encore…')
        this.player.y += this.facing === 'N' ? 16 : -16
        return
      }
      if (this.levelId === 'hub' && !canEnter(ex.to, state)) {
        showMessage(this, 'Pas encore accessible.')
        this.player.y -= 16
        return
      }
      if (!canEnter(ex.to, state) && ex.to !== 'hub' && !ex.to.includes('dungeon') && !ex.to.includes('boss')) {
        showMessage(this, 'Il te faut parler à Branoc.')
        this.player.y -= 16
        return
      }
      this.travel(ex.to)
      return
    }
  }


  updateCanopyFade() {
    if (!this.player || !this.canopySprites?.length) return
    const px = this.player.x
    const py = this.player.y
    for (const spr of this.canopySprites) {
      if (!spr.active) continue
      const top = spr.y - spr.displayHeight
      const under =
        px > spr.x - spr.displayWidth * 0.45 &&
        px < spr.x + spr.displayWidth * 0.45 &&
        py < spr.y - 8 &&
        py > top + spr.displayHeight * 0.15
      const base = spr.getData('baseAlpha') ?? 1
      spr.setAlpha(under ? Math.min(base, 0.38) : base)
    }
  }

  travel(levelId) {
    setState(this, setPosition(getState(this), { scene: levelId, regionId: levelId, x: 0, y: 0 }))
    this.scene.start('WorldScene', { levelId })
  }
}
