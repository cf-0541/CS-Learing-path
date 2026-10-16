import type {
  RuntimeEvent,
  TracePath,
  TraceRuntime,
} from '../types'

interface ProxyMeta {
  target: string
  path: TracePath
  raw: object
}

interface RuntimeCall {
  callId: number
  name: string
  depth: number
  args: Record<string, unknown>
}

const MAX_SNAPSHOT_DEPTH = 7
const MAX_COLLECTION_SIZE = 120

type RuntimeEventInput = {
  [Kind in RuntimeEvent['type']]: Omit<Extract<RuntimeEvent, { type: Kind }>, 'seq'>
}[RuntimeEvent['type']]

function isObject(value: unknown): value is object {
  return typeof value === 'object' && value !== null
}

function displayKey(key: PropertyKey): string | number | null {
  if (typeof key === 'symbol') return null
  const text = String(key)
  if (/^(0|[1-9]\d*)$/.test(text)) return Number(text)
  return text
}

export class TraceLimitError extends Error {
  constructor(limit: number) {
    super(`运行轨迹超过 ${limit.toLocaleString()} 个事件，请缩小输入规模或减少循环次数。`)
    this.name = 'TraceLimitError'
  }
}

export function createTraceRuntime(maxEvents = 20_000): TraceRuntime {
  const events: RuntimeEvent[] = []
  const proxyMeta = new WeakMap<object, ProxyMeta>()
  const proxyCache = new WeakMap<object, Map<string, object>>()
  const trackedNames = new WeakMap<object, Set<string>>()
  const callStack: RuntimeCall[] = []

  let currentLine = 1
  let nextCallId = 1

  const snapshot = (
    input: unknown,
    depth = 0,
    seen = new WeakSet<object>(),
  ): unknown => {
    if (input === undefined) return 'undefined'
    if (input === null || typeof input === 'string' || typeof input === 'boolean') {
      return input
    }
    if (typeof input === 'number') {
      return Number.isFinite(input) ? input : String(input)
    }
    if (typeof input === 'bigint') return `${input.toString()}n`
    if (typeof input === 'function') return `[Function ${input.name || 'anonymous'}]`
    if (!isObject(input)) return String(input)

    const raw = proxyMeta.get(input)?.raw ?? input
    if (depth >= MAX_SNAPSHOT_DEPTH) return '[…]'
    if (seen.has(raw)) return '[Circular]'
    seen.add(raw)

    if (Array.isArray(raw)) {
      const values = raw
        .slice(0, MAX_COLLECTION_SIZE)
        .map((value) => snapshot(value, depth + 1, seen))
      if (raw.length > MAX_COLLECTION_SIZE) values.push(`… +${raw.length - MAX_COLLECTION_SIZE}`)
      return values
    }

    const output: Record<string, unknown> = {}
    const entries = Object.entries(raw).slice(0, MAX_COLLECTION_SIZE)
    for (const [key, value] of entries) output[key] = snapshot(value, depth + 1, seen)
    if (Object.keys(raw).length > entries.length) output['…'] = 'truncated'
    return output
  }

  const emit = (event: RuntimeEventInput): void => {
    if (events.length >= maxEvents) throw new TraceLimitError(maxEvents)
    events.push({ ...event, seq: events.length } as RuntimeEvent)
  }

  const proxyFor = <T extends object>(rawValue: T, target: string, path: TracePath): T => {
    const unwrapped = proxyMeta.get(rawValue)?.raw ?? rawValue
    const cacheKey = `${target}:${path.map(String).join('.')}`
    let cache = proxyCache.get(unwrapped)
    if (!cache) {
      cache = new Map()
      proxyCache.set(unwrapped, cache)
    }
    const cached = cache.get(cacheKey)
    if (cached) return cached as T

    const proxy = new Proxy(unwrapped, {
      get(raw, key, receiver) {
        const value = Reflect.get(raw, key, receiver)
        const part = displayKey(key)
        if (part === null || key === 'length' || typeof value === 'function') return value

        const nextPath = [...path, part]
        if (isObject(value)) return proxyFor(value, target, nextPath)

        emit({
          type: 'read',
          line: currentLine,
          target,
          path: nextPath,
          value: snapshot(value),
        })
        return value
      },
      set(raw, key, value, receiver) {
        const part = displayKey(key)
        const before = Reflect.get(raw, key, receiver)
        const unwrappedValue = isObject(value) ? proxyMeta.get(value)?.raw ?? value : value
        const ok = Reflect.set(raw, key, unwrappedValue, receiver)

        if (ok && part !== null && key !== 'length') {
          emit({
            type: 'write',
            line: currentLine,
            target,
            path: [...path, part],
            before: snapshot(before),
            after: snapshot(unwrappedValue),
          })
        }
        return ok
      },
    })

    proxyMeta.set(proxy, { target, path, raw: unwrapped })
    cache.set(cacheKey, proxy)
    return proxy as T
  }

  const runtime: TraceRuntime = {
    line(line) {
      currentLine = line
      emit({ type: 'line', line })
    },

    track(name, value, line = currentLine) {
      currentLine = line
      if (!isObject(value)) return value

      const raw = proxyMeta.get(value)?.raw ?? value
      let names = trackedNames.get(raw)
      if (!names) {
        names = new Set()
        trackedNames.set(raw, names)
      }

      const alreadyTracked = names.has(name)
      names.add(name)
      const proxy = proxyFor(raw, name, [])

      if (!alreadyTracked) {
        emit({
          type: 'track',
          line,
          target: name,
          value: snapshot(raw),
        })
      }
      return proxy as typeof value
    },

    call(name, args, line) {
      currentLine = line
      const callId = nextCallId++
      const depth = callStack.length
      const safeArgs = snapshot(args) as Record<string, unknown>
      const frame = { callId, name, depth, args: safeArgs }
      callStack.push(frame)
      emit({ type: 'call', line, ...frame })
      return callId
    },

    ret(name, value, line, callId) {
      currentLine = line
      let index = -1
      for (let cursor = callStack.length - 1; cursor >= 0; cursor -= 1) {
        if (callStack[cursor].callId === callId) {
          index = cursor
          break
        }
      }
      const frame = index >= 0 ? callStack[index] : undefined
      const depth = frame?.depth ?? Math.max(0, callStack.length - 1)
      const args = frame?.args ?? {}
      emit({
        type: 'return',
        line,
        name,
        callId,
        depth,
        args,
        value: snapshot(value),
      })
      if (index >= 0) callStack.splice(index)
      return value
    },

    branch(expression, value, line) {
      currentLine = line
      emit({
        type: 'branch',
        line,
        expression,
        result: Boolean(value),
      })
      return value
    },

    complete(result, duration) {
      emit({
        type: 'done',
        line: currentLine,
        result: snapshot(result),
        duration,
      })
    },

    fail(message) {
      emit({ type: 'error', line: currentLine, message })
    },

    getEvents() {
      return events
    },
  }

  return runtime
}


