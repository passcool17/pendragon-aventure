const STATS = {
  'shadow-blob': { hp: 2, lightWeak: true, speed: 30 },
  'mist-wolf': { hp: 3, lightWeak: false, speed: 45 },
  'stone-specter': { hp: 3, lightWeak: false, speed: 25 },
  crow: { hp: 2, lightWeak: false, speed: 50 },
  root: { hp: 3, lightWeak: false, speed: 20 },
  fairy: { hp: 2, lightWeak: false, speed: 40 },
  'region-boss': { hp: 6, lightWeak: false, speed: 35 },
  'final-boss': { hp: 99, lightWeak: false, speed: 40 },
}

export function createEnemy(type, x, y, overrides = {}) {
  const base = STATS[type] || { hp: 2, lightWeak: false, speed: 30 }
  return {
    type,
    x,
    y,
    hp: overrides.hp ?? base.hp,
    maxHp: overrides.hp ?? base.hp,
    lightWeak: base.lightWeak,
    speed: base.speed,
    alive: true,
  }
}

export function damageEnemy(enemy, amount, kind = 'melee') {
  if (!enemy.alive) return enemy
  let dmg = amount
  if (kind === 'light' && enemy.lightWeak) dmg = Math.max(dmg, enemy.hp)
  const hp = enemy.hp - dmg
  return { ...enemy, hp, alive: hp > 0 }
}
