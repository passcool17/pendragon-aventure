import Phaser from 'phaser'
import { GAME_CONFIG } from './gameConfig.js'

export { GAME_CONFIG }

export function createGame(parent = 'game', sceneList = []) {
  return new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    width: GAME_CONFIG.width,
    height: GAME_CONFIG.height,
    pixelArt: GAME_CONFIG.pixelArt,
    roundPixels: GAME_CONFIG.roundPixels,
    antialias: false,
    backgroundColor: '#1a2a1a',
    physics: { default: 'arcade', arcade: { debug: false } },
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    scene: sceneList,
  })
}

if (typeof document !== 'undefined' && document.getElementById('game')) {
  import('./boot.js').then(({ startGame }) => startGame())
}
