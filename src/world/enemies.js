const STATS = {
  'shadow-blob': { hp: 2, lightWeak: true, speed: 14 },
  'mist-wolf': { hp: 3, lightWeak: false, speed: 18 },
  'stone-specter': { hp: 3, lightWeak: false, speed: 12 },
  crow: { hp: 2, lightWeak: false, speed: 22 },
  root: { hp: 3, lightWeak: false, speed: 10 },
  fairy: { hp: 2, lightWeak: false, speed: 16 },
  'region-boss': { hp: 6, lightWeak: false, speed: 16 },
  'final-boss': { hp: 99, lightWeak: false, speed: 18 },
}

export function createEnemy(type, x, y, overrides = {}) {
  const base = STATS[type] || { hp: 2, lightWeak: false, speed: 14 }
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
