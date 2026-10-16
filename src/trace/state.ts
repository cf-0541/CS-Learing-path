import type { TracePath, TracePointer, VisualSnapshot } from '../types'

export function samePath(a: TracePath, b: TracePath): boolean {
  return a.length === b.length && a.every((part, index) => part === b[index])
}

export function pointerMatches(
  pointer: TracePointer | null | undefined,
  target: string,
  path: TracePath,
): boolean {
  return Boolean(pointer && pointer.target === target && samePath(pointer.path, path))
}

export function readMatches(
  snapshot: VisualSnapshot,
  target: string,
  path: TracePath,
): boolean {
  return snapshot.reads.some((pointer) => pointerMatches(pointer, target, path))
}

export function asArray(value: unknown): unknown[] | null {
  return Array.isArray(value) ? value : null
}

export function formatCell(value: unknown): string {
  if (value === 'undefined' || value === undefined) return '—'
  if (value === null) return 'null'
  if (typeof value === 'object') {
    const text = JSON.stringify(value)
    return text.length > 12 ? `${text.slice(0, 10)}…` : text
  }
  return String(value)
}
