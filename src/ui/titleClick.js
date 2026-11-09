/** Map logical title button center to screen coords under Scale.FIT + CENTER_BOTH. */
export function titleButtonScreenPos({
  logicalX = 320,
  logicalY = 160,
  gameW = 640,
  gameH = 360,
  viewW = 1920,
  viewH = 1072,
} = {}) {
  const scale = Math.min(viewW / gameW, viewH / gameH)
  const dispW = gameW * scale
  const dispH = gameH * scale
  const ox = (viewW - dispW) / 2
  const oy = (viewH - dispH) / 2
  return { x: ox + logicalX * scale, y: oy + logicalY * scale, scale, ox, oy }
}
