import type { ModelKind, ModelPreference, RuntimeEvent } from '../types'

export function detectModel(
  events: RuntimeEvent[],
  preference: ModelPreference = 'auto',
): ModelKind {
  if (preference !== 'auto') return preference

  const hasTreeShape = events.some((event) => {
    if ((event.type === 'read' || event.type === 'write') && /tree/i.test(event.target)) {
      return true
    }
    if (event.type !== 'call') return false
    return ['p', 'l', 'r'].every((key) => typeof event.args[key] === 'number')
  })
  if (hasTreeShape) return 'segment-tree'

  const hasDpShape = events.some((event) => {
    if (event.type !== 'track' && event.type !== 'read' && event.type !== 'write') {
      return false
    }
    if (/^(dp|memo|f)$/i.test(event.target)) return true
    return 'path' in event && event.path.length > 1
  })
  if (hasDpShape) return 'dp'

  return 'array'
}
