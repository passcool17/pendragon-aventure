/** Pure title-screen keyboard mapping. */
export function titleActionFromKey(code) {
  if (code === 'Enter' || code === 'NumpadEnter' || code === 'Space') return 'start'
  return null
}
