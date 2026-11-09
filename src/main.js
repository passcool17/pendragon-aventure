import Phaser from 'phaser'

export function createGame(parent = 'game', sceneList = []) {
  return new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    width: 384,
    height: 288,
    pixelArt: true,
    backgroundColor: '#0b1210',
    physics: { default: 'arcade', arcade: { debug: false } },
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
    scene: sceneList,
  })
}

if (typeof document !== 'undefined' && document.getElementById('game')) {
  import('./boot.js').then(({ startGame }) => startGame())
}
