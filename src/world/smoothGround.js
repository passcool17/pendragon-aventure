/** Smooth path/water blobs from tile marks — circle+capsule union (no wang autotile). */

import { isPathChar, isWaterChar, isBridgeChar } from './autotile.js'

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

/** Soft bank: darker under-blob then main fill. */
export function drawSoftBlob(graphics, cells, tile, fillColor, rimColor) {
  if (!cells.length) return
  const r = blobRadius(tile)
  graphics.fillStyle(rimColor, 0.7)
  paintUnion(graphics, cells, tile, r + 3)
  graphics.fillStyle(fillColor, 1)
  paintUnion(graphics, cells, tile, r)
}

/** Stamp a tile texture into a RenderTexture, clipped by a geometry mask from the blob. */
export function stampMaskedTexture(scene, key, cells, tile, depth, tint = 0xffffff) {
  if (!cells.length || !scene.textures.exists(key)) return null
  const w = Math.max(...cells.map((c) => c.x)) * tile + tile * 2
  const h = Math.max(...cells.map((c) => c.y)) * tile + tile * 2
  const worldW = Math.max(w, (scene.level?.width || 20) * tile)
  const worldH = Math.max(h, (scene.level?.height || 12) * tile)

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
  const mask = g.createGeometryMask()
  rt.setMask(mask)
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
