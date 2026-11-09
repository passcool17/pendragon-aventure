const DELTA = { N: [0, -1], S: [0, 1], E: [1, 0], W: [-1, 0] }

export function pushBlock(gridWalkable, block, dir) {
  const [dx, dy] = DELTA[dir]
  const x = block.x + dx
  const y = block.y + dy
  if (y < 0 || y >= gridWalkable.length) return null
  if (x < 0 || x >= gridWalkable[0].length) return null
  if (!gridWalkable[y][x]) return null
  return { x, y }
}
