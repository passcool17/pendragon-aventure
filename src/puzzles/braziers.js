export function lightBrazier(lit, index) {
  const next = lit.slice()
  next[index] = true
  return next
}
export function extinguishBrazier(lit, index) {
  const next = lit.slice()
  next[index] = false
  return next
}
export function allBraziersLit(lit) {
  return lit.length > 0 && lit.every(Boolean)
}
