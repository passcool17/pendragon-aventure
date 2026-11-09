const DELTA = { N: [0, -1], S: [0, 1], E: [1, 0], W: [-1, 0] }

export function growBridge(seed, dir) {
  const [dx, dy] = DELTA[dir]
  return [1, 2, 3].map((i) => ({ x: seed.x + dx * i, y: seed.y + dy * i }))
}
