export const SAVE_KEY = 'merlin-brumes-bretagne:v1'

export function serialize(state) {
  return JSON.stringify(state)
}

export function deserialize(raw) {
  const data = JSON.parse(raw)
  if (!data || data.version !== 1) throw new Error('version')
  if (typeof data.hearts !== 'number' || !Array.isArray(data.fragments)) {
    throw new Error('shape')
  }
  return data
}

export function saveToStorage(state, storage = globalThis.localStorage) {
  try {
    storage.setItem(SAVE_KEY, serialize(state))
    return { ok: true }
  } catch {
    return { ok: false, message: 'Reprise indisponible sur cet appareil' }
  }
}

export function loadFromStorage(storage = globalThis.localStorage) {
  let raw
  try {
    raw = storage.getItem(SAVE_KEY)
  } catch {
    return { ok: false, message: 'Reprise indisponible sur cet appareil', recover: 'memory-only' }
  }
  if (raw == null) {
    return { ok: false, message: 'Aucune sauvegarde', recover: 'new-game' }
  }
  try {
    return { ok: true, state: deserialize(raw) }
  } catch {
    return {
      ok: false,
      message: 'Sauvegarde illisible. Nouvelle partie ?',
      recover: 'new-game',
    }
  }
}

export function clearSave(storage = globalThis.localStorage) {
  try { storage.removeItem(SAVE_KEY) } catch { /* ignore */ }
}
