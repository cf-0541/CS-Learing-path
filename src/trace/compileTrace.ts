import type {
  CallFrame,
  RuntimeEvent,
  TracePath,
  TracePointer,
  VisualSnapshot,
  VisualStep,
} from '../types'

function cloneValue<T>(value: T): T {
  if (value === undefined || value === null || typeof value !== 'object') return value
  if (Array.isArray(value)) return value.map((item) => cloneValue(item)) as T
  const output: Record<string, unknown> = {}
  for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
    output[key] = cloneValue(item)
  }
  return output as T
}

function setAtPath(root: unknown, path: TracePath, value: unknown): unknown {
  if (path.length === 0) return cloneValue(value)
  if (root === null || typeof root !== 'object') return root

  let cursor = root as Record<string | number, unknown>
  for (let index = 0; index < path.length - 1; index += 1) {
    const key = path[index]
    let next = cursor[key]
    if (next === null || typeof next !== 'object') {
      next = typeof path[index + 1] === 'number' ? [] : {}
      cursor[key] = next
    }
    cursor = next as Record<string | number, unknown>
  }
  cursor[path[path.length - 1]] = cloneValue(value)
  return root
}

function formatValue(value: unknown): string {
  if (typeof value === 'string') return value === 'undefined' ? 'undefined' : `“${value}”`
  if (value === null) return 'null'
  if (typeof value === 'object') {
    const json = JSON.stringify(value)
    return json.length > 48 ? `${json.slice(0, 45)}…` : json
  }
  return String(value)
}

function formatPath(target: string, path: TracePath): string {
  return `${target}${path
    .map((part) => (typeof part === 'number' ? `[${part}]` : `.${part}`))
    .join('')}`
}

function formatArgs(args: Record<string, unknown>): string {
  const entries = Object.entries(args)
  if (!entries.length) return '无参数'
  return entries
    .slice(0, 5)
    .map(([key, value]) => `${key}=${formatValue(value)}`)
    .join('，')
}

function describe(event: RuntimeEvent): { title: string; description: string } {
  switch (event.type) {
    case 'line':
      return { title: `执行第 ${event.line} 行`, description: '代码指针移动到下一条语句。' }
    case 'track':
      return {
        title: `观察 ${event.target}`,
        description: `捕获 ${event.target} 的初始状态，后续读写会自动形成动画。`,
      }
    case 'read':
      return {
        title: `读取 ${formatPath(event.target, event.path)}`,
        description: `取得 ${formatValue(event.value)}，作为当前计算的输入。`,
      }
    case 'write':
      return {
        title: `更新 ${formatPath(event.target, event.path)}`,
        description: `${formatValue(event.before)} → ${formatValue(event.after)}，状态已经写回。`,
      }
    case 'branch':
      return {
        title: event.result ? '条件成立' : '条件不成立',
        description: `${event.expression} 的结果为 ${event.result ? 'true' : 'false'}。`,
      }
    case 'call':
      return {
        title: `进入 ${event.name}()` ,
        description: `${formatArgs(event.args)}；递归深度 ${event.depth}。`,
      }
    case 'return':
      return {
        title: `${event.name}() 返回`,
        description: `返回值 ${formatValue(event.value)}，结果回到上一层调用。`,
      }
    case 'done':
      return {
        title: '运行完成',
        description: `最终结果为 ${formatValue(event.result)}，耗时 ${event.duration.toFixed(1)}ms。`,
      }
    case 'error':
      return { title: '运行中止', description: event.message }
  }
}

function pointerKey(pointer: TracePointer): string {
  return `${pointer.target}:${pointer.path.join('.')}`
}

export function compileTrace(events: RuntimeEvent[]): VisualStep[] {
  const tracked: Record<string, unknown> = {}
  const callStack: CallFrame[] = []
  let pendingReads: TracePointer[] = []
  let activeReads: TracePointer[] = []
  let activeWrite: (TracePointer & { before: unknown }) | null = null
  let branch: { expression: string; result: boolean } | null = null
  let result: unknown = undefined

  return events.map((event, index) => {
    if (event.type === 'line') {
      activeWrite = null
      branch = null
    }

    if (event.type === 'track') {
      tracked[event.target] = cloneValue(event.value)
    }

    if (event.type === 'read') {
      const pointer: TracePointer = {
        target: event.target,
        path: [...event.path],
        value: cloneValue(event.value),
      }
      const key = pointerKey(pointer)
      pendingReads = [
        ...pendingReads.filter((item) => pointerKey(item) !== key),
        pointer,
      ].slice(-8)
      activeReads = [...pendingReads]
      activeWrite = null
    }

    if (event.type === 'write') {
      if (!(event.target in tracked)) tracked[event.target] = []
      setAtPath(tracked[event.target], event.path, event.after)
      activeReads = [...pendingReads]
      activeWrite = {
        target: event.target,
        path: [...event.path],
        value: cloneValue(event.after),
        before: cloneValue(event.before),
      }
      // Keep a short dependency tail so adjacent swap writes still read naturally.
      pendingReads = pendingReads.slice(-3)
    }

    if (event.type === 'branch') {
      branch = { expression: event.expression, result: event.result }
    }

    if (event.type === 'call') {
      callStack.push({
        name: event.name,
        callId: event.callId,
        depth: event.depth,
        line: event.line,
        args: cloneValue(event.args),
      })
    }

    if (event.type === 'return') {
      const frameIndex = callStack.findIndex((frame) => frame.callId === event.callId)
      if (frameIndex >= 0) callStack.splice(frameIndex)
    }

    if (event.type === 'done') result = cloneValue(event.result)

    const snapshot: VisualSnapshot = {
      tracked: cloneValue(tracked),
      reads: cloneValue(activeReads),
      write: cloneValue(activeWrite),
      callStack: cloneValue(callStack),
      branch: cloneValue(branch),
      result: cloneValue(result),
    }
    const copy = cloneValue(event)
    const text = describe(copy)

    return {
      index,
      event: copy,
      line: event.line,
      title: text.title,
      description: text.description,
      snapshot,
    }
  })
}
