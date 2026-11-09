export function validateLevel(data) {
  if (!data?.id || typeof data.width !== 'number') throw new Error('id/width')
  if (!data.spawn || !Array.isArray(data.exits)) throw new Error('spawn/exits')
  if (!Array.isArray(data.enemies) || !Array.isArray(data.puzzles)) throw new Error('enemies/puzzles')
  if (!Array.isArray(data.checkpoints)) throw new Error('checkpoints')
  if (!Array.isArray(data.tiles) || data.tiles.length !== data.height) throw new Error('tiles h')
  for (const row of data.tiles) {
    if (typeof row !== 'string' || row.length !== data.width) throw new Error('tiles w')
  }
  return true
}
