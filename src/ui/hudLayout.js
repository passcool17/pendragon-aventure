/** Pure HUD geometry for the 640×360 logical canvas. */

export function spellIconPositions(width = 640, height = 360, iconSize = 32) {
  const gap = 8
  const ids = ['light', 'wind', 'nature']
  const total = ids.length * iconSize + (ids.length - 1) * gap
  const rightPad = 12
  const bottomPad = 12
  const startX = width - rightPad - total + iconSize / 2
  const y = height - bottomPad - iconSize / 2
  return ids.map((id, i) => ({
    id,
    x: startX + i * (iconSize + gap),
    y,
  }))
}

export function hudLayout(width = 640, height = 360) {
  const icons = spellIconPositions(width, height, 32)
  return {
    width,
    height,
    heartsOrigin: { x: 24, y: 22 },
    heartGap: 28,
    mana: { x: 16, y: 48, w: 96, h: 10 },
    spellIcons: icons,
  }
}
