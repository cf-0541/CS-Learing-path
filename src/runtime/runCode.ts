import { instrumentCode } from '../instrumentation/instrument'
import type { RunResult, RuntimeEvent } from '../types'

interface WorkerSuccess {
  ok: true
  events: RuntimeEvent[]
  result: unknown
  duration: number
}

interface WorkerFailure {
  ok: false
  events: RuntimeEvent[]
  error: string
}

type WorkerResponse = WorkerSuccess | WorkerFailure

export interface RunOptions {
  timeoutMs?: number
  maxEvents?: number
}

export async function runCode(
  source: string,
  input: unknown,
  options: RunOptions = {},
): Promise<RunResult> {
  const timeoutMs = options.timeoutMs ?? 2_500
  const maxEvents = options.maxEvents ?? 20_000
  const transformed = instrumentCode(source)
  const worker = new Worker(new URL('./runner.worker.ts', import.meta.url), {
    type: 'module',
    name: 'algorithm-trace-runner',
  })

  return new Promise<RunResult>((resolve, reject) => {
    let settled = false
    const finish = () => {
      if (settled) return false
      settled = true
      clearTimeout(timer)
      worker.terminate()
      return true
    }

    const timer = window.setTimeout(() => {
      if (!finish()) return
      reject(new Error(`执行超过 ${timeoutMs}ms，已终止。请检查是否存在死循环。`))
    }, timeoutMs)

    worker.onmessage = (message: MessageEvent<WorkerResponse>) => {
      if (!finish()) return
      if (!message.data.ok) {
        reject(new Error(message.data.error))
        return
      }
      resolve({
        events: message.data.events,
        result: message.data.result,
        duration: message.data.duration,
        transformedCode: transformed.code,
      })
    }

    worker.onerror = (event) => {
      if (!finish()) return
      reject(new Error(event.message || 'Worker 执行失败。'))
    }

    worker.postMessage({ code: transformed.code, input, maxEvents })
  })
}
