export const DIALOGUES = {
  branoc: {
    name: 'Branoc',
    lines: [
      'La brume dévore la forêt, Merlin.',
      'Allume les trois braseros anciens.',
      'Reviens avec un fragment de sceau.',
    ],
    onCompleteFlag: 'questStarted',
  },
  mael: {
    name: 'Mael',
    lines: [
      'Le bâton frappe juste devant toi. Espace.',
      'Court, net, sans gaspiller ta magie.',
    ],
  },
  siofra: {
    name: 'Siofra',
    lines: [
      'Approche : je soigne tes blessures.',
      'Une fois par visite au village.',
    ],
    healOnComplete: true,
  },
  tegen: {
    name: 'Tegen',
    lines: [
      'Les ombres soufflent sur les braseros…',
      'Si l’un s’éteint, rallume-le, d’accord ?',
    ],
  },
}

export function getDialogue(id) {
  const d = DIALOGUES[id]
  if (!d) throw new Error(`unknown npc ${id}`)
  return d
}

export function canEnter(regionId, state) {
  if (regionId === 'forest' || regionId === 'forest-dungeon' || regionId === 'forest-boss') {
    return !!state.flags.questStarted
  }
  if (regionId === 'ruins' || regionId === 'ruins-dungeon' || regionId === 'ruins-boss') {
    return state.fragments.includes('forest')
  }
  if (regionId === 'sanctuary' || regionId === 'sanctuary-dungeon' || regionId === 'sanctuary-boss') {
    return state.fragments.includes('ruins')
  }
  if (regionId === 'boss-final') {
    return ['forest', 'ruins', 'sanctuary'].every((f) => state.fragments.includes(f))
  }
  if (regionId === 'hub') return true
  return false
}
