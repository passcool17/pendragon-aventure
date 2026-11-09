import { createGame } from './main.js'
import { BootScene } from './scenes/BootScene.js'
import { PreloadScene } from './scenes/PreloadScene.js'
import { TitleScene } from './scenes/TitleScene.js'
import { WorldScene } from './scenes/WorldScene.js'
import { UIScene } from './scenes/UIScene.js'
import { PauseScene } from './scenes/PauseScene.js'

export function startGame() {
  return createGame('game', [
    BootScene,
    PreloadScene,
    TitleScene,
    WorldScene,
    UIScene,
    PauseScene,
  ])
}
