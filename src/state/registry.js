import { createNewGame } from './gameState.js'
import { saveToStorage } from './save.js'

export function getState(scene) {
  return scene.registry.get('gameState') || createNewGame()
}

export function setState(scene, state, { save = true } = {}) {
  scene.registry.set('gameState', state)
  scene.game.events.emit('game-state', state)
  if (save) saveToStorage(state)
  return state
}

export function showMessage(scene, text) {
  scene.game.events.emit('ui-message', text)
}
