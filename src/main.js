import Phaser from 'phaser'

const GAME_W = 384
const GAME_H = 288

function applyIntegerScale(game) {
  const resize = () => {
    const sx = Math.floor(window.innerWidth / GAME_W)
    const sy = Math.floor(window.innerHeight / GAME_H)
    const s = Math.max(1, Math.min(sx, sy))
    const canvas = game.canvas
    canvas.style.width = `${GAME_W * s}px`
    canvas.style.height = `${GAME_H * s}px`
    canvas.style.imageRendering = 'pixelated'
    canvas.style.imageRendering = 'crisp-edges'
  }
  window.addEventListener('resize', resize)
  resize()
  game.events.on('destroy', () => window.removeEventListener('resize', resize))
}

export function createGame(parent = 'game', sceneList = []) {
  const game = new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    width: GAME_W,
    height: GAME_H,
    pixelArt: true,
    roundPixels: true,
    antialias: false,
    backgroundColor: '#0b1210',
    physics: { default: 'arcade', arcade: { debug: false } },
    scale: {
      mode: Phaser.Scale.NONE,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    callbacks: {
      postBoot: (g) => applyIntegerScale(g),
    },
    scene: sceneList,
  })
  return game
}

if (typeof document !== 'undefined' && document.getElementById('game')) {
  import('./boot.js').then(({ startGame }) => startGame())
}
