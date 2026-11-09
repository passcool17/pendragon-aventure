/** Smooth path/water blobs — circle+capsule union; path = unified dirt (no tuft tile). */

import { isPathChar, isWaterChar, isBridgeChar } from './autotile.js'
import { cellHash } from './decor.js'

export function collectCells(tiles, pred) {
  const out = []
  for (let y = 0; y < tiles.length; y++) {
    for (let x = 0; x < tiles[y].length; x++) {
      if (pred(tiles[y][x])) out.push({ x, y })
    }
  }
  return out
}

export function pathCells(tiles) {
  return collectCells(tiles, (ch) => isPathChar(ch) || isBridgeChar(ch))
}

export function waterCells(tiles) {
  return collectCells(tiles, (ch) => isWaterChar(ch) || isBridgeChar(ch))
}

export function bridgeCells(tiles) {
  return collectCells(tiles, isBridgeChar)
}

export function blobRadius(tile = 32) {
  return tile * 0.72
}

export function cellCenter(c, tile = 32) {
  return { x: c.x * tile + tile / 2, y: c.y * tile + tile / 2 }
}

function paintUnion(graphics, cells, tile, radius) {
  const set = new Set(cells.map((c) => `${c.x},${c.y}`))
  for (const c of cells) {
    const p = cellCenter(c, tile)
    graphics.fillCircle(p.x, p.y, radius)
    if (set.has(`${c.x + 1},${c.y}`)) graphics.fillRect(p.x, p.y - radius, tile, radius * 2)
    if (set.has(`${c.x},${c.y + 1}`)) graphics.fillRect(p.x - radius, p.y, radius * 2, tile)
  }
}

export function drawSoftBlob(graphics, cells, tile, fillColor, rimColor) {
  if (!cells.length) return
  const r = blobRadius(tile)
  graphics.fillStyle(rimColor, 0.7)
  paintUnion(graphics, cells, tile, r + 3)
  graphics.fillStyle(fillColor, 1)
  paintUnion(graphics, cells, tile, r)
}

/** Unified dirt: solid fill + sparse brown noise (never stamps chemin-terre tufts). */
export function drawDirtPath(graphics, cells, tile) {
  if (!cells.length) return
  drawSoftBlob(graphics, cells, tile, 0xa8844a, 0x7a5e32)
  const set = new Set(cells.map((c) => `${c.x},${c.y}`))
  for (const c of cells) {
    const p = cellCenter(c, tile)
    for (let i = 0; i < 6; i++) {
      const h = cellHash(c.x, c.y, i + 3)
      if (h % 4 === 0) continue
      const ox = ((h % 17) - 8) * 1.2
      const oy = (((h * 3) % 17) - 8) * 1.2
      const shade = h % 2 ? 0x8f6e3c : 0xb89555
      graphics.fillStyle(shade, 0.35)
      graphics.fillCircle(p.x + ox, p.y + oy, 1.1)
    }
    // skip interior noise density — keep surface calm
    const edge = ![
      set.has(`${c.x},${c.y - 1}`),
      set.has(`${c.x + 1},${c.y}`),
      set.has(`${c.x},${c.y + 1}`),
      set.has(`${c.x - 1},${c.y}`),
    ].every(Boolean)
    if (!edge) continue
  }
}

/** Hash-scattered pebbles / ferns only on path rim (no grid). */
export function pathEdgeScatter(pathCellsList, tile = 32) {
  const set = new Set(pathCellsList.map((c) => `${c.x},${c.y}`))
  const out = []
  for (const c of pathCellsList) {
    const n = set.has(`${c.x},${c.y - 1}`)
    const e = set.has(`${c.x + 1},${c.y}`)
    const s = set.has(`${c.x},${c.y + 1}`)
    const w = set.has(`${c.x - 1},${c.y}`)
    if (n && e && s && w) continue
    const h = cellHash(c.x, c.y, 41)
    const p = cellCenter(c, tile)
    if (h % 9 === 0) {
      out.push({ key: 'rocher-petit', x: p.x + (h % 5) - 2, y: p.y + ((h * 2) % 5) - 2, scale: 0.4, depth: 6 })
    } else if (h % 13 === 3) {
      out.push({
        key: h % 2 ? 'fougere-1' : 'fougere-2',
        x: p.x + ((h * 3) % 7) - 3,
        y: p.y + ((h * 5) % 7) - 3,
        scale: 0.55,
        depth: 6,
      })
    }
  }
  return out
}

export function stampMaskedTexture(scene, key, cells, tile, depth, tint = 0xffffff) {
  if (!cells.length || !scene.textures.exists(key)) return null
  const worldW = Math.max((scene.level?.width || 20) * tile, 64)
  const worldH = Math.max((scene.level?.height || 12) * tile, 64)
  const rt = scene.add.renderTexture(0, 0, worldW, worldH).setOrigin(0, 0).setDepth(depth)
  rt.setTint(tint)
  const pad = new Set()
  for (const c of cells) {
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) pad.add(`${c.x + dx},${c.y + dy}`)
    }
  }
  for (const keyPos of pad) {
    const [x, y] = keyPos.split(',').map(Number)
    if (x < 0 || y < 0) continue
    rt.draw(key, x * tile, y * tile)
  }
  const g = scene.make.graphics({ x: 0, y: 0, add: false })
  g.fillStyle(0xffffff)
  paintUnion(g, cells, tile, blobRadius(tile))
  rt.setMask(g.createGeometryMask())
  rt.setData('maskGraphics', g)
  return rt
}

export function pointInBlob(wx, wy, cells, tile, carve = []) {
  if (!cells.length) return false
  const carveSet = new Set(carve.map((c) => `${c.x},${c.y}`))
  const set = new Set(cells.map((c) => `${c.x},${c.y}`))
  const r = blobRadius(tile)
  const r2 = r * r
  for (const c of cells) {
    if (carveSet.has(`${c.x},${c.y}`)) continue
    const p = cellCenter(c, tile)
    const dx = wx - p.x
    const dy = wy - p.y
    if (dx * dx + dy * dy <= r2) return true
    if (set.has(`${c.x + 1},${c.y}`) && !carveSet.has(`${c.x + 1},${c.y}`)) {
      if (wy >= p.y - r && wy <= p.y + r && wx >= p.x && wx <= p.x + tile) return true
    }
    if (set.has(`${c.x},${c.y + 1}`) && !carveSet.has(`${c.x},${c.y + 1}`)) {
      if (wx >= p.x - r && wx <= p.x + r && wy >= p.y && wy <= p.y + tile) return true
    }
  }
  return false
}
