import hub from './hub.json'
import forest from './forest.json'
import forestDungeon from './forest-dungeon.json'
import forestBoss from './forest-boss.json'
import ruins from './ruins.json'
import ruinsDungeon from './ruins-dungeon.json'
import ruinsBoss from './ruins-boss.json'
import sanctuary from './sanctuary.json'
import sanctuaryDungeon from './sanctuary-dungeon.json'
import sanctuaryBoss from './sanctuary-boss.json'
import bossFinal from './boss-final.json'
import { validateLevel } from './validateLevel.js'

export const levels = {
  hub,
  forest,
  'forest-dungeon': forestDungeon,
  'forest-boss': forestBoss,
  ruins,
  'ruins-dungeon': ruinsDungeon,
  'ruins-boss': ruinsBoss,
  sanctuary,
  'sanctuary-dungeon': sanctuaryDungeon,
  'sanctuary-boss': sanctuaryBoss,
  'boss-final': bossFinal,
}

export function loadLevel(id) {
  const data = levels[id]
  if (!data) throw new Error(`unknown level ${id}`)
  validateLevel(data)
  return data
}

export { validateLevel }
