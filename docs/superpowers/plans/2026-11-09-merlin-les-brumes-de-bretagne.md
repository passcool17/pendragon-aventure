# Merlin : Les Brumes de Bretagne — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construire et publier (quand autorisé) un Zelda-like Phaser 3 jouable de bout en bout : hub → forêt → ruines → sanctuaire → gardien, avec sorts Lumière/Vent/Nature, sauvegarde locale et Pages HTTPS.

**Architecture:** Logique pure (état, combat, énigmes) testée sous Vitest, indépendante de Phaser. Scènes Phaser lisent des JSON de niveaux et des placeholders dessinés en code. HUD dans une scène parallèle. Déploiement GitHub Pages depuis la branche `gh-pages` (contenu de `dist/`), sans exiger de fusion dans `main` pour publier une build.

**Tech Stack:** JavaScript ESM, Phaser 3 (bundlé Vite, pas de CDN runtime), Vite, Vitest, GitHub Pages (`passcool17`), localStorage `merlin-brumes-bretagne:v1`.

## Global Constraints

- Spec approuvée : `docs/superpowers/specs/2026-11-09-merlin-zelda-like-design.md` (9 nov. 2026). Ne pas élargir le hors-scope.
- Titre provisoire : **Merlin : Les Brumes de Bretagne**. Personnages et lieux **fictifs** ; aucun acteur, aucun spoiler d’œuvre protégée.
- Stack figée : JS (pas TypeScript), Phaser 3, Vite, Vitest, Pages sur `dist/`.
- Cœurs 3→5 ; mana plein en ~6 s ; mêlée 1 dégât ; sorts light/wind/nature ; clé `merlin-brumes-bretagne:v1`.
- Énigmes exactes : 3 braseros ; Vent = 1 case orthogonale ; Nature = pont 3 cases ; boss = 3 totems → vulnérable 8 s → 6 mêlées ou 3 Lumière.
- HUD sans texte permanent ; messages système FR 2 s ; dialogues FR courts.
- Placeholders graphiques **générés par code** OK en v1 ; **ne pas** demander Créa/Voix/SUNO dans ce plan.
- Travail sous `/workspace/games/pendragon-aventure`. Réclamation `local pendragon-aventure | Arcade 3 (2dd6c80a)`. Aucun autre jeu modifié.
- Git : pushes **normaux** uniquement vers `passcool17` ; **interdit** force-push et suppression de branches. Publier via branche `gh-pages` (voir Task 12). **Toute fusion dans `main` exige l’accord explicite de Pascal.** Création du dépôt distant et premier push seulement après autorisation de publication.
- Vérification Chrome **INTERNET OK** sur l’URL Pages : capture + test des contrôles (Task 12).

---

## Structure de fichiers

| Chemin | Responsabilité |
|--------|----------------|
| `package.json`, `vite.config.js`, `vitest.config.js`, `index.html` | Outillage Vite/Vitest |
| `src/main.js` | Boot Phaser, enregistrement des scènes |
| `src/state/gameState.js` | État sérialisable, newGame, applyDamage, regen |
| `src/state/save.js` | load/save localStorage, erreurs FR |
| `src/combat/combat.js` | Mêlée, coûts de sorts, hitboxes logiques |
| `src/puzzles/braziers.js` | Allumage / extinction braseros, unlock fog-gate |
| `src/puzzles/windPush.js` | Poussée d’une case orthogonale |
| `src/puzzles/natureBridge.js` | Pont de 3 cases depuis graine |
| `src/puzzles/bossTotems.js` | Totems + fenêtre de vulnérabilité |
| `src/data/*.json` | hub, forest, ruins, sanctuary, boss-final |
| `src/data/validateLevel.js` | Contrat JSON niveaux |
| `src/gfx/placeholders.js` | Textures Phaser générées (palette concept) |
| `src/input/controls.js` | Clavier + pad tactile |
| `src/scenes/BootScene.js` | Registre clés |
| `src/scenes/PreloadScene.js` | Charge / timeout 15 s / Réessayer |
| `src/scenes/TitleScene.js` | Continuer / Nouvelle partie |
| `src/scenes/HubScene.js` | Village, 4 PNJ, portes |
| `src/scenes/RegionScene.js` | Overworld paramétré par regionId |
| `src/scenes/DungeonScene.js` | Mini-donjon 3–5 salles |
| `src/scenes/BossScene.js` | Boss région ou final |
| `src/scenes/UIScene.js` | Cœurs, mana, 3 icônes sorts, messages |
| `src/scenes/PauseScene.js` | Reprendre / Nouvelle partie / Muet |
| `tests/*.test.js` | Vitest unitaires + contrats + parcours headless |
| `.github/workflows/pages.yml` | Build → push normal vers `gh-pages` |
| `README.md`, `GAME.md` | Livraison et état honnête |

### Contrats partagés (noms figés)

```js
/** @typedef {'light'|'wind'|'nature'} SpellId */
/** @typedef {'forest'|'ruins'|'sanctuary'} FragmentId */

/**
 * @typedef {Object} GameState
 * @property {1} version
 * @property {number} hearts
 * @property {number} heartsMax
 * @property {number} mana          // 0..1
 * @property {SpellId[]} spellsUnlocked
 * @property {SpellId|null} activeSpell
 * @property {FragmentId[]} fragments
 * @property {Record<string, boolean>} flags
 * @property {{scene:string, regionId?:string, x:number, y:number}} position
 * @property {string[]} checkpoints
 */

// gameState.js
export function createNewGame(): GameState
export function applyDamage(state: GameState, amount: number): GameState
export function regenMana(state: GameState, dtSec: number): GameState  // plein en 6 s
export function unlockSpell(state: GameState, id: SpellId): GameState
export function addFragment(state: GameState, id: FragmentId): GameState
export function setFlag(state: GameState, key: string, value?: boolean): GameState
export function spendMana(state: GameState, cost: number): GameState|null  // null si insuffisant
export function healFull(state: GameState): GameState

// save.js
export const SAVE_KEY = 'merlin-brumes-bretagne:v1'
export function serialize(state: GameState): string
export function deserialize(raw: string): GameState  // throw si invalide
export function saveToStorage(state: GameState, storage=localStorage): {ok:boolean, message?:string}
export function loadFromStorage(storage=localStorage): {ok:true, state:GameState}|{ok:false, message:string, recover:'new-game'|'memory-only'}

// combat.js
export const MELEE_DAMAGE = 1
export const SPELL_COST = { light: 0.25, wind: 0.2, nature: 0.3 }
export function canMelee(state, nowMs, lastMeleeMs): boolean  // cooldown 300 ms
export function meleeHit(attackerFacing, attackerTile, targetTile): boolean  // adjacent + même direction

// puzzles
export function lightBrazier(lit:boolean[], index:number): boolean[]
export function allBraziersLit(lit:boolean[]): boolean
export function extinguishBrazier(lit:boolean[], index:number): boolean[]
export function pushBlock(gridWalkable:boolean[][], block:{x:number,y:number}, dir:'N'|'S'|'E'|'W'): {x:number,y:number}|null
export function growBridge(seed:{x:number,y:number}, dir:'N'|'S'|'E'|'W'): {x:number,y:number}[]  // 3 tiles
export function createBossPhase(): {totems:{light:boolean,wind:boolean,nature:boolean}, vulnerableUntil:number|null, hits:number}
export function strikeTotem(phase, spell:SpellId, nowMs): typeof phase
export function bossHit(phase, kind:'melee'|'light', nowMs): typeof phase
export function bossDefeated(phase): boolean
```

---

### Task 1: Scaffold Vite + Vitest + Phaser

**Files:**
- Create: `package.json`, `vite.config.js`, `vitest.config.js`, `index.html`, `src/main.js`, `.gitignore`
- Test: `tests/smoke.test.js`

**Interfaces:**
- Consumes: rien
- Produces: scripts `dev`, `build`, `test` ; `src/main.js` exporte `createGame(parent)` pour tests ultérieurs

- [ ] **Step 1: Écrire le test smoke**

```js
// tests/smoke.test.js
import { describe, it, expect } from 'vitest'
describe('scaffold', () => {
  it('node env runs vitest', () => {
    expect(1 + 1).toBe(2)
  })
})
```

- [ ] **Step 2: Lancer le test (doit échouer faute de config)**

Run: `cd /workspace/games/pendragon-aventure && npm test`
Expected: FAIL (pas de script test / vitest manquant)

- [ ] **Step 3: Créer package et configs**

```json
{
  "name": "merlin-les-brumes-de-bretagne",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest run"
  },
  "dependencies": {
    "phaser": "^3.80.1"
  },
  "devDependencies": {
    "vite": "^5.4.0",
    "vitest": "^2.0.0"
  }
}
```

```js
// vite.config.js
import { defineConfig } from 'vite'
export default defineConfig({
  base: '/pendragon-aventure/',
  build: { outDir: 'dist', emptyOutDir: true },
})
```

```js
// vitest.config.js
import { defineConfig } from 'vitest/config'
export default defineConfig({
  test: { environment: 'node', include: ['tests/**/*.test.js'] },
})
```

```html
<!doctype html>
<html lang="fr">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
    <title>Merlin : Les Brumes de Bretagne</title>
    <style>html,body,#game{margin:0;height:100%;background:#0b1210;overflow:hidden}</style>
  </head>
  <body>
    <div id="game"></div>
    <script type="module" src="/src/main.js"></script>
  </body>
</html>
```

```js
// src/main.js
import Phaser from 'phaser'
export function createGame(parent = 'game') {
  return new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    width: 384,
    height: 288,
    pixelArt: true,
    backgroundColor: '#0b1210',
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
    scene: [],
  })
}
if (typeof document !== 'undefined' && document.getElementById('game')) {
  createGame()
}
```

```gitignore
node_modules/
dist/
.DS_Store
*.log
```

Puis : `npm install`

- [ ] **Step 4: Relancer les tests**

Run: `npm test`
Expected: PASS (1 test)

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json vite.config.js vitest.config.js index.html src/main.js tests/smoke.test.js .gitignore
git commit -m "chore: scaffold Vite Phaser Vitest"
```

---

### Task 2: GameState + sauvegarde

**Files:**
- Create: `src/state/gameState.js`, `src/state/save.js`
- Test: `tests/gameState.test.js`, `tests/save.test.js`

**Interfaces:**
- Consumes: rien
- Produces: `createNewGame`, `applyDamage`, `regenMana`, `unlockSpell`, `addFragment`, `setFlag`, `spendMana`, `healFull`, `SAVE_KEY`, `serialize`, `deserialize`, `saveToStorage`, `loadFromStorage`

- [ ] **Step 1: Tests GameState (rouge)**

```js
// tests/gameState.test.js
import { describe, it, expect } from 'vitest'
import {
  createNewGame, applyDamage, regenMana, unlockSpell,
  addFragment, spendMana, healFull,
} from '../src/state/gameState.js'

describe('createNewGame', () => {
  it('starts with 3 hearts, empty spells and fragments', () => {
    const s = createNewGame()
    expect(s.version).toBe(1)
    expect(s.hearts).toBe(3)
    expect(s.heartsMax).toBe(3)
    expect(s.mana).toBe(1)
    expect(s.spellsUnlocked).toEqual([])
    expect(s.activeSpell).toBe(null)
    expect(s.fragments).toEqual([])
    expect(s.position.scene).toBe('hub')
  })
})

describe('applyDamage', () => {
  it('reduces hearts and floors at 0', () => {
    let s = createNewGame()
    s = applyDamage(s, 1)
    expect(s.hearts).toBe(2)
    s = applyDamage(s, 10)
    expect(s.hearts).toBe(0)
  })
})

describe('regenMana', () => {
  it('fills in 6 seconds from empty', () => {
    let s = { ...createNewGame(), mana: 0 }
    s = regenMana(s, 6)
    expect(s.mana).toBe(1)
  })
  it('does not exceed 1', () => {
    expect(regenMana(createNewGame(), 10).mana).toBe(1)
  })
})

describe('spells and fragments', () => {
  it('unlocks light and sets active', () => {
    const s = unlockSpell(createNewGame(), 'light')
    expect(s.spellsUnlocked).toEqual(['light'])
    expect(s.activeSpell).toBe('light')
  })
  it('adds unique fragments', () => {
    let s = addFragment(createNewGame(), 'forest')
    s = addFragment(s, 'forest')
    expect(s.fragments).toEqual(['forest'])
  })
})

describe('spendMana', () => {
  it('returns null if not enough', () => {
    const s = { ...createNewGame(), mana: 0.1 }
    expect(spendMana(s, 0.25)).toBe(null)
  })
  it('subtracts cost', () => {
    const s = spendMana(createNewGame(), 0.25)
    expect(s.mana).toBeCloseTo(0.75)
  })
})

describe('healFull', () => {
  it('restores hearts to max', () => {
    const hurt = applyDamage(createNewGame(), 2)
    expect(healFull(hurt).hearts).toBe(3)
  })
})
```

- [ ] **Step 2: Run rouge**

Run: `npm test -- tests/gameState.test.js`
Expected: FAIL module not found

- [ ] **Step 3: Implémenter gameState.js**

```js
// src/state/gameState.js
export function createNewGame() {
  return {
    version: 1,
    hearts: 3,
    heartsMax: 3,
    mana: 1,
    spellsUnlocked: [],
    activeSpell: null,
    fragments: [],
    flags: {},
    position: { scene: 'hub', x: 8, y: 10 },
    checkpoints: ['hub-fire'],
  }
}

export function applyDamage(state, amount) {
  return { ...state, hearts: Math.max(0, state.hearts - amount) }
}

export function regenMana(state, dtSec) {
  const next = Math.min(1, state.mana + dtSec / 6)
  return next === state.mana ? state : { ...state, mana: next }
}

export function unlockSpell(state, id) {
  if (state.spellsUnlocked.includes(id)) return state
  return {
    ...state,
    spellsUnlocked: [...state.spellsUnlocked, id],
    activeSpell: state.activeSpell ?? id,
  }
}

export function addFragment(state, id) {
  if (state.fragments.includes(id)) return state
  return { ...state, fragments: [...state.fragments, id] }
}

export function setFlag(state, key, value = true) {
  if (state.flags[key] === value) return state
  return { ...state, flags: { ...state.flags, [key]: value } }
}

export function spendMana(state, cost) {
  if (state.mana + 1e-9 < cost) return null
  return { ...state, mana: Math.max(0, state.mana - cost) }
}

export function healFull(state) {
  return state.hearts === state.heartsMax ? state : { ...state, hearts: state.heartsMax }
}

export function setActiveSpell(state, id) {
  if (!state.spellsUnlocked.includes(id)) return state
  return { ...state, activeSpell: id }
}

export function bumpHeartsMax(state, by = 1) {
  const heartsMax = Math.min(5, state.heartsMax + by)
  return { ...state, heartsMax, hearts: Math.min(heartsMax, state.hearts + by) }
}
```

- [ ] **Step 4: Tests save (rouge puis vert)**

```js
// tests/save.test.js
import { describe, it, expect } from 'vitest'
import { createNewGame, addFragment, unlockSpell } from '../src/state/gameState.js'
import {
  SAVE_KEY, serialize, deserialize, saveToStorage, loadFromStorage,
} from '../src/state/save.js'

function memStorage(map = new Map()) {
  return {
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => { map.set(k, String(v)) },
    removeItem: (k) => { map.delete(k) },
  }
}

describe('serialize round-trip', () => {
  it('keeps fragments and spells', () => {
    let s = unlockSpell(createNewGame(), 'light')
    s = addFragment(s, 'forest')
    const again = deserialize(serialize(s))
    expect(again.fragments).toEqual(['forest'])
    expect(again.spellsUnlocked).toEqual(['light'])
  })
})

describe('deserialize', () => {
  it('rejects bad version', () => {
    expect(() => deserialize(JSON.stringify({ version: 99 }))).toThrow()
  })
  it('rejects garbage', () => {
    expect(() => deserialize('{')).toThrow()
  })
})

describe('storage', () => {
  it('saves and loads under fixed key', () => {
    const storage = memStorage()
    const s = addFragment(createNewGame(), 'ruins')
    expect(saveToStorage(s, storage).ok).toBe(true)
    expect(storage.getItem(SAVE_KEY)).toBeTruthy()
    const loaded = loadFromStorage(storage)
    expect(loaded.ok).toBe(true)
    expect(loaded.state.fragments).toEqual(['ruins'])
  })
  it('signals new-game on corrupt data', () => {
    const storage = memStorage(new Map([[SAVE_KEY, 'nope']]))
    const r = loadFromStorage(storage)
    expect(r.ok).toBe(false)
    expect(r.recover).toBe('new-game')
    expect(r.message).toMatch(/Nouvelle partie|illisible|corrompue/i)
  })
  it('signals memory-only when setItem throws', () => {
    const storage = {
      getItem: () => null,
      setItem: () => { throw new Error('quota') },
      removeItem: () => {},
    }
    const r = saveToStorage(createNewGame(), storage)
    expect(r.ok).toBe(false)
    expect(r.message).toMatch(/Reprise indisponible/)
  })
})
```

```js
// src/state/save.js
import { createNewGame } from './gameState.js'

export const SAVE_KEY = 'merlin-brumes-bretagne:v1'

export function serialize(state) {
  return JSON.stringify(state)
}

export function deserialize(raw) {
  const data = JSON.parse(raw)
  if (!data || data.version !== 1) throw new Error('version')
  if (typeof data.hearts !== 'number' || !Array.isArray(data.fragments)) {
    throw new Error('shape')
  }
  return data
}

export function saveToStorage(state, storage = globalThis.localStorage) {
  try {
    storage.setItem(SAVE_KEY, serialize(state))
    return { ok: true }
  } catch {
    return { ok: false, message: 'Reprise indisponible sur cet appareil' }
  }
}

export function loadFromStorage(storage = globalThis.localStorage) {
  let raw
  try {
    raw = storage.getItem(SAVE_KEY)
  } catch {
    return { ok: false, message: 'Reprise indisponible sur cet appareil', recover: 'memory-only' }
  }
  if (raw == null) {
    return { ok: false, message: 'Aucune sauvegarde', recover: 'new-game' }
  }
  try {
    return { ok: true, state: deserialize(raw) }
  } catch {
    return {
      ok: false,
      message: 'Sauvegarde illisible. Nouvelle partie ?',
      recover: 'new-game',
    }
  }
}

export function clearSave(storage = globalThis.localStorage) {
  try { storage.removeItem(SAVE_KEY) } catch { /* ignore */ }
}

export { createNewGame }
```

Run: `npm test`
Expected: PASS all gameState + save tests

- [ ] **Step 5: Commit**

```bash
git add src/state tests/gameState.test.js tests/save.test.js
git commit -m "feat: game state and localStorage save"
```

---

### Task 3: Combat et énigmes purs

**Files:**
- Create: `src/combat/combat.js`, `src/puzzles/braziers.js`, `src/puzzles/windPush.js`, `src/puzzles/natureBridge.js`, `src/puzzles/bossTotems.js`
- Test: `tests/combat.test.js`, `tests/puzzles.test.js`

**Interfaces:**
- Consumes: `SpellId` convention Task 2
- Produces: fonctions listées dans « Contrats partagés »

- [ ] **Step 1: Tests combat + puzzles (rouge)**

```js
// tests/combat.test.js
import { describe, it, expect } from 'vitest'
import { MELEE_DAMAGE, SPELL_COST, canMelee, meleeHit } from '../src/combat/combat.js'
import { createNewGame, spendMana } from '../src/state/gameState.js'

describe('combat constants', () => {
  it('melee deals 1 and spell costs match spec', () => {
    expect(MELEE_DAMAGE).toBe(1)
    expect(SPELL_COST.light).toBe(0.25)
    expect(SPELL_COST.wind).toBe(0.2)
    expect(SPELL_COST.nature).toBe(0.3)
  })
})

describe('canMelee', () => {
  it('respects 300ms cooldown', () => {
    expect(canMelee(createNewGame(), 1000, 800)).toBe(false)
    expect(canMelee(createNewGame(), 1000, 700)).toBe(true)
  })
})

describe('meleeHit', () => {
  it('hits adjacent tile in facing direction only', () => {
    expect(meleeHit('E', { x: 2, y: 2 }, { x: 3, y: 2 })).toBe(true)
    expect(meleeHit('E', { x: 2, y: 2 }, { x: 1, y: 2 })).toBe(false)
    expect(meleeHit('E', { x: 2, y: 2 }, { x: 4, y: 2 })).toBe(false)
  })
})

describe('spell afford', () => {
  it('light costs 0.25 mana', () => {
    const s = spendMana(createNewGame(), SPELL_COST.light)
    expect(s.mana).toBeCloseTo(0.75)
  })
})
```

```js
// tests/puzzles.test.js
import { describe, it, expect } from 'vitest'
import { lightBrazier, allBraziersLit, extinguishBrazier } from '../src/puzzles/braziers.js'
import { pushBlock } from '../src/puzzles/windPush.js'
import { growBridge } from '../src/puzzles/natureBridge.js'
import { createBossPhase, strikeTotem, bossHit, bossDefeated } from '../src/puzzles/bossTotems.js'

describe('braziers', () => {
  it('needs three lit to unlock', () => {
    let lit = [false, false, false]
    lit = lightBrazier(lit, 0)
    lit = lightBrazier(lit, 1)
    expect(allBraziersLit(lit)).toBe(false)
    lit = lightBrazier(lit, 2)
    expect(allBraziersLit(lit)).toBe(true)
  })
  it('can be extinguished then relit', () => {
    let lit = [true, true, true]
    lit = extinguishBrazier(lit, 1)
    expect(allBraziersLit(lit)).toBe(false)
    lit = lightBrazier(lit, 1)
    expect(allBraziersLit(lit)).toBe(true)
  })
})

describe('windPush', () => {
  it('moves one orthogonal tile onto walkable empty cell', () => {
    const grid = [
      [true, true, true],
      [true, true, true],
      [true, true, true],
    ]
    expect(pushBlock(grid, { x: 1, y: 1 }, 'E')).toEqual({ x: 2, y: 1 })
  })
  it('returns null if blocked or out of bounds', () => {
    const grid = [
      [true, false, true],
      [true, true, true],
    ]
    expect(pushBlock(grid, { x: 0, y: 0 }, 'E')).toBe(null)
    expect(pushBlock(grid, { x: 0, y: 0 }, 'N')).toBe(null)
  })
})

describe('natureBridge', () => {
  it('grows exactly 3 tiles from seed', () => {
    const tiles = growBridge({ x: 2, y: 4 }, 'E')
    expect(tiles).toEqual([
      { x: 3, y: 4 },
      { x: 4, y: 4 },
      { x: 5, y: 4 },
    ])
  })
})

describe('bossTotems', () => {
  it('becomes vulnerable 8s after three totems down', () => {
    let p = createBossPhase()
    p = strikeTotem(p, 'light', 1000)
    p = strikeTotem(p, 'wind', 1000)
    p = strikeTotem(p, 'nature', 1000)
    expect(p.vulnerableUntil).toBe(9000)
    expect(bossDefeated(p)).toBe(false)
  })
  it('defeats after 6 melee hits during vulnerability', () => {
    let p = createBossPhase()
    p = strikeTotem(p, 'light', 0)
    p = strikeTotem(p, 'wind', 0)
    p = strikeTotem(p, 'nature', 0)
    for (let i = 0; i < 6; i++) p = bossHit(p, 'melee', 100)
    expect(bossDefeated(p)).toBe(true)
  })
  it('defeats after 3 light hits during vulnerability', () => {
    let p = createBossPhase()
    p = strikeTotem(p, 'light', 0)
    p = strikeTotem(p, 'wind', 0)
    p = strikeTotem(p, 'nature', 0)
    p = bossHit(p, 'light', 100)
    p = bossHit(p, 'light', 100)
    p = bossHit(p, 'light', 100)
    expect(bossDefeated(p)).toBe(true)
  })
  it('ignores hits outside vulnerability window', () => {
    let p = createBossPhase()
    p = bossHit(p, 'melee', 50)
    expect(p.hits).toBe(0)
  })
})
```

- [ ] **Step 2: Run rouge** — `npm test -- tests/combat.test.js tests/puzzles.test.js` → FAIL missing modules

- [ ] **Step 3: Implémenter**

```js
// src/combat/combat.js
export const MELEE_DAMAGE = 1
export const SPELL_COST = { light: 0.25, wind: 0.2, nature: 0.3 }
export const MELEE_COOLDOWN_MS = 300

export function canMelee(_state, nowMs, lastMeleeMs) {
  return nowMs - lastMeleeMs >= MELEE_COOLDOWN_MS
}

const DELTA = { N: [0, -1], S: [0, 1], E: [1, 0], W: [-1, 0] }

export function meleeHit(facing, attackerTile, targetTile) {
  const [dx, dy] = DELTA[facing] || [0, 0]
  return (
    targetTile.x === attackerTile.x + dx &&
    targetTile.y === attackerTile.y + dy
  )
}
```

```js
// src/puzzles/braziers.js
export function lightBrazier(lit, index) {
  const next = lit.slice()
  next[index] = true
  return next
}
export function extinguishBrazier(lit, index) {
  const next = lit.slice()
  next[index] = false
  return next
}
export function allBraziersLit(lit) {
  return lit.length > 0 && lit.every(Boolean)
}
```

```js
// src/puzzles/windPush.js
const DELTA = { N: [0, -1], S: [0, 1], E: [1, 0], W: [-1, 0] }

export function pushBlock(gridWalkable, block, dir) {
  const [dx, dy] = DELTA[dir]
  const x = block.x + dx
  const y = block.y + dy
  if (y < 0 || y >= gridWalkable.length) return null
  if (x < 0 || x >= gridWalkable[0].length) return null
  if (!gridWalkable[y][x]) return null
  return { x, y }
}
```

```js
// src/puzzles/natureBridge.js
const DELTA = { N: [0, -1], S: [0, 1], E: [1, 0], W: [-1, 0] }

export function growBridge(seed, dir) {
  const [dx, dy] = DELTA[dir]
  return [1, 2, 3].map((i) => ({ x: seed.x + dx * i, y: seed.y + dy * i }))
}
```

```js
// src/puzzles/bossTotems.js
export function createBossPhase() {
  return {
    totems: { light: true, wind: true, nature: true },
    vulnerableUntil: null,
    hits: 0,
  }
}

export function strikeTotem(phase, spell, nowMs) {
  if (!phase.totems[spell]) return phase
  const totems = { ...phase.totems, [spell]: false }
  const allDown = !totems.light && !totems.wind && !totems.nature
  return {
    ...phase,
    totems,
    vulnerableUntil: allDown ? nowMs + 8000 : phase.vulnerableUntil,
  }
}

export function bossHit(phase, kind, nowMs) {
  if (phase.vulnerableUntil == null || nowMs > phase.vulnerableUntil) return phase
  const add = kind === 'light' ? 2 : 1  // 3 light ≡ 6 melee
  return { ...phase, hits: phase.hits + add }
}

export function bossDefeated(phase) {
  return phase.hits >= 6
}
```

- [ ] **Step 4: `npm test` → PASS**

- [ ] **Step 5: Commit** `feat: combat and puzzle pure logic`

---

### Task 4: Données de niveaux + validation

**Files:**
- Create: `src/data/hub.json`, `src/data/forest.json`, `src/data/ruins.json`, `src/data/sanctuary.json`, `src/data/boss-final.json`, `src/data/validateLevel.js`, `src/data/index.js`
- Test: `tests/levels.test.js`

**Interfaces:**
- Consumes: schéma spec (id, spawn, exits, enemies, puzzles, chests, checkpoints)
- Produces: `validateLevel(data)`, `levels` map id→data ; `loadLevel(id)`

- [ ] **Step 1: Test contrats**

```js
// tests/levels.test.js
import { describe, it, expect } from 'vitest'
import { levels, validateLevel, loadLevel } from '../src/data/index.js'

const REQUIRED = ['hub', 'forest', 'ruins', 'sanctuary', 'boss-final']

describe('levels', () => {
  it('exposes all five ids', () => {
    expect(Object.keys(levels).sort()).toEqual([...REQUIRED].sort())
  })
  for (const id of REQUIRED) {
    it(`${id} passes schema`, () => {
      expect(() => validateLevel(levels[id])).not.toThrow()
      expect(loadLevel(id).id).toBe(id)
    })
  }
  it('forest has braziers puzzle count 3', () => {
    const p = levels.forest.puzzles.find((x) => x.type === 'braziers')
    expect(p.count).toBe(3)
    expect(p.unlock).toBe('fog-gate')
  })
  it('ruins has push-blocks puzzle', () => {
    expect(levels.ruins.puzzles.some((p) => p.type === 'push-blocks')).toBe(true)
  })
  it('sanctuary has vine-bridges puzzle', () => {
    expect(levels.sanctuary.puzzles.some((p) => p.type === 'vine-bridges')).toBe(true)
  })
})
```

- [ ] **Step 2: Rouge** puis écrire JSON + validateLevel

Chaque JSON inclut au minimum : `id`, `width`, `height`, `spawn`, `tiles` (tableau de strings : `#` mur, `.` sol, `~` eau/fossé, `D` dalle, `B` brasero, `G` graine, `E` exit marker), `exits`, `enemies`, `puzzles`, `chests`, `checkpoints`, `npcs` (hub seulement).

Exemple forêt 24×18 : dans cette tâche, écrire les 18 rangées complètes (pas de `tiles` vide). Schéma :

```json
{
  "id": "forest",
  "width": 24,
  "height": 18,
  "spawn": { "x": 5, "y": 10 },
  "tiles": [],
  "exits": [{ "to": "hub", "tile": [2, 10], "spawnId": "from-forest" }],
  "enemies": [{ "type": "shadow-blob", "x": 12, "y": 7 }],
  "puzzles": [{ "type": "braziers", "count": 3, "unlock": "fog-gate", "tiles": [[8,6],[10,6],[12,6]] }],
  "chests": [{ "id": "forest-heart", "x": 20, "y": 4, "item": "heart-piece" }],
  "checkpoints": [{ "id": "forest-entry", "x": 5, "y": 10 }],
  "npcs": []
}
```

`tiles` : générer dans le fichier un tableau de 18 strings de longueur 24 (murs périphériques `#`, clairière `.`, 3 `B`, exit `X`). Ne pas laisser `tiles: []` dans le commit final de cette tâche.

```js
// src/data/validateLevel.js
export function validateLevel(data) {
  if (!data?.id || typeof data.width !== 'number') throw new Error('id/width')
  if (!data.spawn || !Array.isArray(data.exits)) throw new Error('spawn/exits')
  if (!Array.isArray(data.enemies) || !Array.isArray(data.puzzles)) throw new Error('enemies/puzzles')
  if (!Array.isArray(data.checkpoints)) throw new Error('checkpoints')
  if (!Array.isArray(data.tiles) || data.tiles.length !== data.height) throw new Error('tiles h')
  for (const row of data.tiles) {
    if (typeof row !== 'string' || row.length !== data.width) throw new Error('tiles w')
  }
  return true
}
```

```js
// src/data/index.js
import hub from './hub.json'
import forest from './forest.json'
import ruins from './ruins.json'
import sanctuary from './sanctuary.json'
import bossFinal from './boss-final.json'
import { validateLevel } from './validateLevel.js'

export const levels = {
  hub,
  forest,
  ruins,
  sanctuary,
  'boss-final': bossFinal,
}

export function loadLevel(id) {
  const data = levels[id]
  if (!data) throw new Error(`unknown level ${id}`)
  validateLevel(data)
  return data
}

export { validateLevel }
```

Configurer Vite/Vitest pour importer JSON (défaut OK).

- [ ] **Step 3: `npm test` → PASS**

- [ ] **Step 4: Commit** `feat: level JSON data and validation`

---

### Task 5: Placeholders graphiques + Boot/Preload/Title

**Files:**
- Create: `src/gfx/placeholders.js`, `src/scenes/BootScene.js`, `src/scenes/PreloadScene.js`, `src/scenes/TitleScene.js`
- Modify: `src/main.js`
- Test: `tests/placeholders.test.js` (fonctions pures de couleurs / clés)

**Interfaces:**
- Consumes: `createNewGame`, `loadFromStorage`, `saveToStorage`
- Produces: clés texture `tile-floor`, `tile-wall`, `tile-water`, `merlin`, `enemy-shadow`, `spell-light`, `heart`, `mana-pip`, `icon-light`, `icon-wind`, `icon-nature` ; scènes Boot/Preload/Title

- [ ] **Step 1: Test clés palette**

```js
// tests/placeholders.test.js
import { describe, it, expect } from 'vitest'
import { PALETTE, TEXTURE_KEYS } from '../src/gfx/placeholders.js'

describe('placeholders', () => {
  it('uses dark forest palette with gold spell', () => {
    expect(PALETTE.floor).toMatch(/^#/)
    expect(PALETTE.gold).toBe('#e8c547')
    expect(TEXTURE_KEYS).toContain('merlin')
    expect(TEXTURE_KEYS).toContain('icon-light')
  })
})
```

- [ ] **Step 2: Implémenter placeholders** (génération via `graphics.generateTexture` appelée depuis Preload ; exporter PALETTE/KEYS pour tests Node sans Phaser)

```js
// src/gfx/placeholders.js
export const PALETTE = {
  floor: '#2f4a3a',
  wall: '#1a2420',
  water: '#3a5f7a',
  mist: '#7a9bb0',
  merlin: '#3a5ea8',
  gold: '#e8c547',
  heart: '#c23b3b',
  mana: '#4a8fd4',
  enemy: '#2a1535',
  nature: '#5a9e4a',
  wind: '#7ec8e3',
}

export const TEXTURE_KEYS = [
  'tile-floor', 'tile-wall', 'tile-water', 'merlin', 'enemy-shadow',
  'spell-light', 'heart', 'mana-pip', 'icon-light', 'icon-wind', 'icon-nature',
  'npc', 'block', 'brazier-off', 'brazier-on', 'bridge',
]

/** @param {Phaser.Scene} scene */
export function generatePlaceholderTextures(scene) {
  const g = scene.make.graphics({ x: 0, y: 0, add: false })
  const sq = (key, color, w = 16, h = 16) => {
    g.clear()
    g.fillStyle(Phaser.Display.Color.HexStringToColor(color).color, 1)
    g.fillRect(0, 0, w, h)
    g.generateTexture(key, w, h)
  }
  sq('tile-floor', PALETTE.floor)
  sq('tile-wall', PALETTE.wall)
  sq('tile-water', PALETTE.water)
  sq('merlin', PALETTE.merlin, 16, 24)
  sq('enemy-shadow', PALETTE.enemy, 16, 16)
  sq('spell-light', PALETTE.gold, 8, 8)
  sq('heart', PALETTE.heart, 10, 10)
  sq('mana-pip', PALETTE.mana, 4, 8)
  sq('icon-light', PALETTE.gold, 16, 16)
  sq('icon-wind', PALETTE.wind, 16, 16)
  sq('icon-nature', PALETTE.nature, 16, 16)
  sq('npc', '#c4a574', 16, 24)
  sq('block', '#8a7a60', 16, 16)
  sq('brazier-off', '#444', 16, 16)
  sq('brazier-on', PALETTE.gold, 16, 16)
  sq('bridge', PALETTE.nature, 16, 16)
  g.destroy()
}
```

BootScene : `this.scene.start('PreloadScene')`.  
PreloadScene : barre de progression ; `generatePlaceholderTextures(this)` ; timeout 15 s → texte « Chargement impossible » + bouton Réessayer (`this.scene.restart()`).  
TitleScene : titre FR, boutons Continuer (si save ok) / Nouvelle partie → démarre Hub + UI.

Enregistrer les scènes dans `createGame`.

- [ ] **Step 3: `npm test` PASS ; `npm run build` produit `dist/` sans erreur**

- [ ] **Step 4: Commit** `feat: placeholder gfx and boot title flow`

---

### Task 6: Contrôles + UIScene + Pause

**Files:**
- Create: `src/input/controls.js`, `src/scenes/UIScene.js`, `src/scenes/PauseScene.js`
- Test: `tests/controls.test.js`

**Interfaces:**
- Consumes: `GameState`, `SPELL_COST`, texture icons
- Produces: `createControls(scene)` → `{ getVector(), wantsMelee, wantsCast, wantsInteract, spellSlot, tick }` ; UIScene lit un registre Phaser `registry` clé `gameState`

- [ ] **Step 1: Test mapping clavier pur**

```js
// tests/controls.test.js
import { describe, it, expect } from 'vitest'
import { vectorFromKeys, cycleSpell } from '../src/input/controls.js'

describe('vectorFromKeys', () => {
  it('wasd and arrows', () => {
    expect(vectorFromKeys({ KeyW: true })).toEqual({ x: 0, y: -1 })
    expect(vectorFromKeys({ ArrowRight: true })).toEqual({ x: 1, y: 0 })
  })
})

describe('cycleSpell', () => {
  it('cycles unlocked only', () => {
    expect(cycleSpell(['light', 'wind'], 'light', 1)).toBe('wind')
    expect(cycleSpell(['light', 'wind'], 'wind', 1)).toBe('light')
  })
})
```

- [ ] **Step 2: Implémenter controls + UI**

`controls.js` : écoute Phaser.Input.Keyboard pour WASD/flèches/Espace/E/F/1/2/3/Échap ; sur `pointer` coarse, créer pad virtuel 96×96 bas-gauche et 3 boutons ≥48 px bas-droite ; masquer pad si `window.matchMedia('(pointer:fine)').matches`.

`UIScene` : affiche `hearts` cœurs, barre mana (largeur ∝ mana), 3 icônes (grisées si non débloquées, bordure dorée sur `activeSpell`) ; `showMessage(text)` centre 2 s.

`PauseScene` : pause la scène monde ; Reprendre / Nouvelle partie (confirm) / Muet (flag registry `muted`).

- [ ] **Step 3: Tests PASS + commit** `feat: controls HUD and pause`

---

### Task 7: Hub + PNJ + transitions

**Files:**
- Create: `src/scenes/HubScene.js`, `src/world/dialogue.js`, `src/world/tilemap.js`
- Modify: `src/data/hub.json`, `src/main.js`
- Test: `tests/dialogue.test.js`, `tests/tilemap.test.js`

**Interfaces:**
- Consumes: `loadLevel('hub')`, `healFull`, `saveToStorage`, `setFlag`
- Produces: `buildGround(scene, level)`, `isWalkable(level, x, y)`, `DIALOGUES`, `getDialogue(id)`, portes `canEnter(regionId, state)`

- [ ] **Step 1: Tests**

```js
// tests/tilemap.test.js
import { describe, it, expect } from 'vitest'
import { isWalkable } from '../src/world/tilemap.js'

const level = {
  width: 3, height: 2,
  tiles: ['#.#', '#~#'],
}
describe('isWalkable', () => {
  it('floor yes, wall and water no', () => {
    expect(isWalkable(level, 1, 0)).toBe(true)
    expect(isWalkable(level, 0, 0)).toBe(false)
    expect(isWalkable(level, 1, 1)).toBe(false)
  })
})
```

```js
// tests/dialogue.test.js
import { describe, it, expect } from 'vitest'
import { DIALOGUES, getDialogue } from '../src/world/dialogue.js'

describe('DIALOGUES', () => {
  it('has four hub NPCs with 2–4 french lines', () => {
    for (const id of ['branoc', 'mael', 'siofra', 'tegen']) {
      const d = getDialogue(id)
      expect(d.lines.length).toBeGreaterThanOrEqual(2)
      expect(d.lines.length).toBeLessThanOrEqual(4)
      expect(d.lines.every((l) => /[a-zA-Zàâäéèêëïîôùûüç]/i.test(l))).toBe(true)
    }
  })
})
```

```js
// also in tests/dialogue.test.js
import { canEnter } from '../src/world/dialogue.js'
import { createNewGame, addFragment } from '../src/state/gameState.js'

describe('canEnter', () => {
  it('gates regions by fragments', () => {
    let s = createNewGame()
    expect(canEnter('forest', s)).toBe(false) // needs branoc quest flag
    s = { ...s, flags: { ...s.flags, questStarted: true } }
    expect(canEnter('forest', s)).toBe(true)
    expect(canEnter('ruins', s)).toBe(false)
    s = addFragment(s, 'forest')
    expect(canEnter('ruins', s)).toBe(true)
    s = addFragment(addFragment(s, 'ruins'), 'sanctuary')
    expect(canEnter('boss-final', s)).toBe(true)
  })
})
```

- [ ] **Step 2: Rouge** `npm test -- tests/dialogue.test.js tests/tilemap.test.js`

- [ ] **Step 3: Implémenter**

```js
// src/world/tilemap.js
export function isWalkable(level, x, y, extraWalkable = new Set()) {
  if (y < 0 || y >= level.height || x < 0 || x >= level.width) return false
  const key = `${x},${y}`
  if (extraWalkable.has(key)) return true
  const ch = level.tiles[y][x]
  return ch === '.' || ch === 'D' || ch === 'B' || ch === 'G' || ch === 'X' || ch === 'C'
}

export function tileToWorld(tx, ty, tile = 16) {
  return { x: tx * tile + tile / 2, y: ty * tile + tile / 2 }
}
```

```js
// src/world/dialogue.js
export const DIALOGUES = {
  branoc: {
    name: 'Branoc',
    lines: [
      'La brume dévore la forêt, Merlin.',
      'Allume les trois braseros anciens.',
      'Reviens avec un fragment de sceau.',
    ],
    onCompleteFlag: 'questStarted',
  },
  mael: {
    name: 'Mael',
    lines: [
      'Le bâton frappe juste devant toi. Espace.',
      'Court, net, sans gaspiller ta magie.',
    ],
  },
  siofra: {
    name: 'Siofra',
    lines: [
      'Approche du feu : je soigne tes blessures.',
      'Une fois par visite au village.',
    ],
    healOnComplete: true,
  },
  tegen: {
    name: 'Tegen',
    lines: [
      'Les ombres soufflent sur les braseros…',
      'Si l’un s’éteint, rallume-le, d’accord ?',
    ],
  },
}

export function getDialogue(id) {
  const d = DIALOGUES[id]
  if (!d) throw new Error(`unknown npc ${id}`)
  return d
}

export function canEnter(regionId, state) {
  if (regionId === 'forest') return !!state.flags.questStarted
  if (regionId === 'ruins') return state.fragments.includes('forest')
  if (regionId === 'sanctuary') return state.fragments.includes('ruins')
  if (regionId === 'boss-final') {
    return ['forest', 'ruins', 'sanctuary'].every((f) => state.fragments.includes(f))
  }
  if (regionId === 'hub') return true
  return false
}
```

HubScene : charge hub.json, place 4 PNJ, interaction E, feu → `healFull` via Siofra une fois (`flags.hubHealToken` remis à true à chaque entrée hub, false après soin), transitions `this.scene.start('RegionScene', { regionId })` si `canEnter`. Autosave entrée + fin dialogue Branoc.

- [ ] **Step 4: PASS + commit** `feat: hub npcs dialogues and door gates`

---

### Task 8: Forêt — Lumière, braseros, ennemis, donjon, boss région

**Files:**
- Create: `src/scenes/RegionScene.js`, `src/scenes/DungeonScene.js`, `src/scenes/BossScene.js`, `src/world/enemies.js`, `src/world/spells.js`
- Modify: `src/main.js`, `src/data/forest.json`
- Test: `tests/headlessForest.test.js`, `tests/enemies.test.js`

**Interfaces:**
- Consumes: `braziers.*`, `combat.*`, `unlockSpell`, `addFragment`, `applyDamage`
- Produces: `spawnEnemy(type, x, y)`, `updateEnemy(e, dt, playerTile)`, `castSpell(state, spell, origin, facing)` → `{ state, projectile? }`

- [ ] **Step 1: Tests**

```js
// tests/enemies.test.js
import { describe, it, expect } from 'vitest'
import { createEnemy, damageEnemy } from '../src/world/enemies.js'

describe('enemies', () => {
  it('shadow-blob dies in one light or two melee', () => {
    let e = createEnemy('shadow-blob', 0, 0)
    expect(e.hp).toBe(2)
    e = damageEnemy(e, 1)
    expect(e.alive).toBe(true)
    e = damageEnemy(e, 1)
    expect(e.alive).toBe(false)
    e = createEnemy('shadow-blob', 0, 0)
    e = damageEnemy(e, 2, 'light')
    expect(e.alive).toBe(false)
  })
})
```

```js
// tests/headlessForest.test.js
import { describe, it, expect } from 'vitest'
import { createNewGame, unlockSpell, addFragment } from '../src/state/gameState.js'
import { serialize, deserialize } from '../src/state/save.js'
import { lightBrazier, allBraziersLit } from '../src/puzzles/braziers.js'

describe('forest progression headless', () => {
  it('new game → light → braziers → fragment persists', () => {
    let s = unlockSpell(createNewGame(), 'light')
    let lit = [false, false, false]
    lit = lightBrazier(lightBrazier(lightBrazier(lit, 0), 1), 2)
    expect(allBraziersLit(lit)).toBe(true)
    s = addFragment(s, 'forest')
    const again = deserialize(serialize(s))
    expect(again.fragments).toEqual(['forest'])
    expect(again.spellsUnlocked).toContain('light')
  })
})
```

- [ ] **Step 2: Rouge puis implémenter enemies/spells + RegionScene forest**
  - Entrée forêt : `unlockSpell(state,'light')` + message « Sort : Lumière ».
  - Projectile doré 8×8, vitesse 120 px/s, détruit brasero-off → on, tue shadow.
  - Ennemi d’ombre adjacent à un brasero allumé : toutes les 4 s `extinguishBrazier` (feedback particule) ; toujours rallumable.
  - 3 braseros allumés → retire obstacle `fog-gate`.
  - Donjon 3 salles (même RegionScene avec `mode:'dungeon'` ou DungeonScene) puis BossScene `region:'forest'` → fragment + hub.

- [ ] **Step 3: Mort** fade 400 ms, respawn checkpoint, reset ennemis salle, `saveToStorage`.

- [ ] **Step 4: PASS + commit** `feat: forest light puzzle dungeon and fragment`

---

### Task 9: Ruines — Vent + blocs

**Files:**
- Modify: `src/data/ruins.json`, `src/world/spells.js`, `src/scenes/RegionScene.js`, `src/scenes/BossScene.js`
- Test: `tests/headlessRuins.test.js`

**Interfaces:**
- Consumes: `pushBlock`, `unlockSpell(...,'wind')`, `addFragment(...,'ruins')`
- Produces: même RegionScene avec `regionId:'ruins'` ; dalles enfoncées si bloc.x/y match

```js
// tests/headlessRuins.test.js
import { describe, it, expect } from 'vitest'
import { pushBlock } from '../src/puzzles/windPush.js'
import { createNewGame, unlockSpell, addFragment } from '../src/state/gameState.js'

describe('ruins headless', () => {
  it('two blocks on plates unlock arch then fragment', () => {
    const grid = Array.from({ length: 5 }, () => Array(5).fill(true))
    let b1 = { x: 1, y: 2 }
    let b2 = { x: 3, y: 2 }
    b1 = pushBlock(grid, b1, 'E') // → 2,2 plate
    b2 = pushBlock(grid, b2, 'W') // → 2,2 conflict — use separate plates
    // plates at (2,1) and (2,3):
    b1 = { x: 1, y: 1 }
    b2 = { x: 1, y: 3 }
    b1 = pushBlock(grid, b1, 'E')
    b2 = pushBlock(grid, b2, 'E')
    expect(b1).toEqual({ x: 2, y: 1 })
    expect(b2).toEqual({ x: 2, y: 3 })
    let s = unlockSpell(createNewGame(), 'wind')
    s = addFragment(s, 'ruins')
    expect(s.fragments).toContain('ruins')
  })
})
```

Implémentation : sort Vent = onde 1 case (pas de projectile long) ; pousse blocs et ennemis ; 2 dalles → ouvre arche ; boss région → fragment ruins ; commit `feat: ruins wind push puzzle`

---

### Task 10: Sanctuaire — Nature + ponts + boss final

**Files:**
- Modify: `src/data/sanctuary.json`, `src/data/boss-final.json`, `src/world/spells.js`, `src/scenes/BossScene.js`, `src/scenes/HubScene.js`
- Test: `tests/headlessSanctuary.test.js`, `tests/headlessEnding.test.js`

```js
// tests/headlessSanctuary.test.js
import { describe, it, expect } from 'vitest'
import { growBridge } from '../src/puzzles/natureBridge.js'
import { isWalkable } from '../src/world/tilemap.js'
import { createNewGame, unlockSpell, addFragment } from '../src/state/gameState.js'

describe('sanctuary bridges', () => {
  it('marks three bridge tiles walkable', () => {
    const level = { width: 8, height: 5, tiles: Array(5).fill('~~~~~~~~') }
    const tiles = growBridge({ x: 1, y: 2 }, 'E')
    expect(tiles).toHaveLength(3)
    const extra = new Set(tiles.map((t) => `${t.x},${t.y}`))
    expect(isWalkable(level, 2, 2, extra)).toBe(true)
    let s = unlockSpell(createNewGame(), 'nature')
    s = addFragment(s, 'sanctuary')
    expect(s.fragments).toContain('sanctuary')
  })
})
```

```js
// tests/headlessEnding.test.js
import { describe, it, expect } from 'vitest'
import { createBossPhase, strikeTotem, bossHit, bossDefeated } from '../src/puzzles/bossTotems.js'
import { createNewGame, addFragment } from '../src/state/gameState.js'
import { canEnter } from '../src/world/dialogue.js'

describe('ending', () => {
  it('three fragments open final and boss can fall', () => {
    let s = createNewGame()
    s = addFragment(addFragment(addFragment(s, 'forest'), 'ruins'), 'sanctuary')
    expect(canEnter('boss-final', s)).toBe(true)
    let p = createBossPhase()
    p = strikeTotem(p, 'light', 0)
    p = strikeTotem(p, 'wind', 0)
    p = strikeTotem(p, 'nature', 0)
    for (let i = 0; i < 6; i++) p = bossHit(p, 'melee', 10)
    expect(bossDefeated(p)).toBe(true)
  })
})
```

Victoire : `UIScene.showMessage('Les brumes se lèvent.')` puis `TitleScene` avec flag `won`. Commit `feat: sanctuary bridges and final guardian`

---

### Task 11: Polish erreurs, visibilité, README

**Files:**
- Create: `src/util/visibility.js`
- Modify: `src/scenes/PreloadScene.js`, `src/main.js`, `README.md`, `GAME.md`
- Test: `tests/visibility.test.js`

```js
// tests/visibility.test.js
import { describe, it, expect } from 'vitest'
import { shouldFreeze } from '../src/util/visibility.js'

describe('shouldFreeze', () => {
  it('freezes when document hidden', () => {
    expect(shouldFreeze('hidden')).toBe(true)
    expect(shouldFreeze('visible')).toBe(false)
  })
})
```

```js
// src/util/visibility.js
export function shouldFreeze(visibilityState) {
  return visibilityState === 'hidden'
}
```

Preload : timer 15 s → texte FR « Chargement impossible » + bouton Réessayer.  
README : commandes npm, URL Pages (après Task 12), limites placeholders, liens spec/plan.  
GAME.md : contrôles, checklist QA. Commit `docs: readme polish and visibility freeze`

---

### Task 12: Dépôt distant, Pages `gh-pages`, Chrome INTERNET OK

**Files:**
- Create: `.github/workflows/pages.yml`, `docs/qa/.gitkeep`
- Modify: `GAME.md`, `README.md` (URL publique)

**Règles git (obligatoires) :**
- Remote : `https://github.com/passcool17/pendragon-aventure.git` — créer le dépôt **seulement** si Pascal autorise la publication.
- Pushes **normaux** uniquement. **Interdit :** `--force`, `--force-with-lease`, suppression de branche.
- `main` = sources. **Toute fusion vers `main` exige l’accord explicite de Pascal.**
- `gh-pages` = contenu de `dist/` uniquement. Pages : branch `gh-pages`, folder `/`. Publier ≠ fusionner dans `main`.
- Features : branches `wip/…` ; pas de merge `main` sans accord Pascal.

```yaml
# .github/workflows/pages.yml
name: pages
on:
  push:
    branches: [main]
  workflow_dispatch:
permissions:
  contents: write
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: npm
      - run: npm ci
      - run: npm test
      - run: npm run build
      - name: Publish dist to gh-pages
        uses: peaceiris/actions-gh-pages@v4
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
          force_orphan: false
          allow_empty: false
```

Alternative manuelle (si Actions indisponible) : build local, checkout `gh-pages`, remplacer par `dist/`, `git commit`, `git push origin gh-pages` (push normal).

- [ ] **Step 1:** Confirmer autorisation publication. `gh repo create passcool17/pendragon-aventure --public --source=. --remote=origin` puis `git push -u origin main` (normal).

- [ ] **Step 2:** Activer Pages sur `gh-pages`. Déclencher workflow. URL attendue : `https://passcool17.github.io/pendragon-aventure/`.

- [ ] **Step 3: Chrome INTERNET OK**
  1. Ouvrir l’URL dans Chrome (réseau réel).
  2. Network : pas de 404 JS/CSS critiques ; Console propre au Title.
  3. Tester : WASD/flèches, Espace mêlée, 1/2/3 + F sort, E dialogue, Échap pause.
  4. Capture hub/titre → `docs/qa/chrome-pages-hub.png`.
  5. Émulation 360×800 : pad ≥48 px, cœurs visibles.
  6. F5 après fragment forêt : fragment conservé.
  7. Noter vérifié/non vérifié dans `GAME.md`.

- [ ] **Step 4:** Commit docs QA + workflow ; pushes normaux seulement ; **aucun merge `main` sans accord Pascal.**

---

## Auto-revue du plan

### Couverture spec
| Exigence spec | Tâche |
|---------------|-------|
| Hub + 4 PNJ + portes fragments | 7 |
| Forêt / Lumière / braseros | 8 |
| Ruines / Vent / blocs | 9 |
| Sanctuaire / Nature / ponts | 10 |
| Boss final totems | 10 |
| Cœurs, mana 6 s, mêlée, 3 sorts | 2, 3, 6 |
| localStorage autosave + erreurs | 2, 7, 8 |
| Clavier + tactile ≥48 px | 6 |
| Scènes Boot…UI | 5–10 |
| JSON niveaux + validation | 4 |
| Placeholders code | 5 |
| Vitest unitaires + headless | 2–4, 8–10 |
| Pages `dist/` + vérif Chrome | 12 |
| Pas Créa/Voix/SUNO | contrainte globale |
| Softlock braseros rallumables | 3, 8 |

### Placeholders scan
Aucun TBD/TODO/« implémenter plus tard » / « similar to task N » laissé comme instruction vide. Les JSON `tiles` doivent être remplis dans Task 4 (interdiction de livrer `tiles: []`).

### Cohérence des noms
`SpellId` light/wind/nature ; fragments forest/ruins/sanctuary ; `SAVE_KEY` ; scènes BootScene…UIScene ; costs 0.25/0.2/0.3 ; boss hits ≥ 6 ; base Vite `/pendragon-aventure/` alignée repo Pages.

### Risques
- Phaser + Vitest en Node : les tests de scènes restent headless/logique ; le rendu réel se prouve en Task 12 Chrome.
- `base: '/pendragon-aventure/'` casse le `vite preview` racine : documenter ou utiliser `base: './'` si Paths relatifs préférés — **décision figée ici : garder `/pendragon-aventure/`** pour Pages projet ; en local `npm run dev` ignore base.
- peaceiris sur `gh-pages` : vérifier qu’aucun force n’est demandé par la config ; `force_orphan: false`.
- Portée contenu (3 donjons + boss) : risque de dérapage temps ; respecter tailles JSON modestes (24×18).

---

## Prochaine porte

Plan prêt pour revue humaine. **Aucun code de jeu exécuté dans ce commit de plan.** Après approbation du plan + autorisations de build/publication : exécuter task-by-task (subagent-driven ou inline).
