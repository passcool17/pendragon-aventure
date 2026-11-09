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
  const add = kind === 'light' ? 2 : 1
  return { ...phase, hits: phase.hits + add }
}

export function bossDefeated(phase) {
  return phase.hits >= 6
}
