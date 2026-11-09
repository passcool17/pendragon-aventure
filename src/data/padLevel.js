/** Pad a level with solid border tiles so the camera viewport is fully covered. */
export function padLevelToView(level, minW = 20, minH = 12) {
  const w = Math.max(level.width, minW)
  const h = Math.max(level.height, minH)
  if (w === level.width && h === level.height) return level
  const tiles = []
  for (let y = 0; y < h; y++) {
    if (y < level.height) {
      const row = level.tiles[y]
      tiles.push(row + '#'.repeat(w - level.width))
    } else {
      tiles.push('#'.repeat(w))
    }
  }
  return { ...level, width: w, height: h, tiles }
}
