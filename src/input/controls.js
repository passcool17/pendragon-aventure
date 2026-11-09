export function vectorFromKeys(keys) {
  let x = 0
  let y = 0
  if (keys.KeyW || keys.ArrowUp) y -= 1
  if (keys.KeyS || keys.ArrowDown) y += 1
  if (keys.KeyA || keys.ArrowLeft) x -= 1
  if (keys.KeyD || keys.ArrowRight) x += 1
  if (x !== 0 && y !== 0) {
    const inv = 1 / Math.SQRT2
    x *= inv
    y *= inv
  }
  return { x, y }
}

export function cycleSpell(unlocked, current, dir) {
  if (!unlocked.length) return current
  const i = Math.max(0, unlocked.indexOf(current))
  const next = (i + dir + unlocked.length) % unlocked.length
  return unlocked[next]
}

/** Edge-only latch: keydown sets a one-shot; held keys do not re-fire consume(). */
export function createKeyTracker(scene) {
  const down = {}
  const latched = {}
  const onDown = (e) => {
    if (!down[e.code]) latched[e.code] = true
    down[e.code] = true
    if (e.code === 'Space' || e.code === 'Tab') e.preventDefault()
  }
  const onUp = (e) => { down[e.code] = false }
  window.addEventListener('keydown', onDown)
  window.addEventListener('keyup', onUp)
  scene.events.once('shutdown', () => {
    window.removeEventListener('keydown', onDown)
    window.removeEventListener('keyup', onUp)
  })
  return {
    down,
    consume(code) {
      if (!latched[code]) return false
      latched[code] = false
      return true
    },
  }
}
