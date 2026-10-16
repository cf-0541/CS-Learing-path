/// <reference lib="webworker" />

import type { RuntimeEvent } from '../types'
import { createTraceRuntime } from './traceRuntime'

interface RunnerRequest {
  code: string
  input: unknown
  maxEvents: number
}

interface RunnerSuccess {
  ok: true
  events: RuntimeEvent[]
  result: unknown
  duration: number
}

interface RunnerFailure {
  ok: false
  events: RuntimeEvent[]
  error: string
}

const scope: DedicatedWorkerGlobalScope = self as unknown as DedicatedWorkerGlobalScope

scope.onmessage = (message: MessageEvent<RunnerRequest>) => {
  const { code, input, maxEvents } = message.data
  const trace = createTraceRuntime(maxEvents)
  const startedAt = performance.now()

  try {
    const execute = new Function(
      '__trace',
      '__input',
      `"use strict";
const window = undefined;
const document = undefined;
const globalThis = undefined;
const fetch = undefined;
const XMLHttpRequest = undefined;
const WebSocket = undefined;
const importScripts = undefined;
${code}
if (typeof solve !== "function") {
  throw new Error("请提供 function solve(input) 作为程序入口。");
}
return solve(__input);`,
    ) as (runtime: ReturnType<typeof createTraceRuntime>, value: unknown) => unknown

    const result = execute(trace, input)
    if (result instanceof Promise) {
      throw new Error('当前原型只支持同步算法，请移除 async/Promise。')
    }

    const duration = performance.now() - startedAt
    trace.complete(result, duration)
    const events = trace.getEvents()
    const doneEvent = events.at(-1)
    const serializableResult = doneEvent?.type === 'done' ? doneEvent.result : result
    const response: RunnerSuccess = {
      ok: true,
      events,
      result: serializableResult,
      duration,
    }
    scope.postMessage(response)
  } catch (error) {
    const text = error instanceof Error ? error.message : String(error)
    try {
      trace.fail(text)
    } catch {
      // The event cap may itself be the reason execution stopped.
    }
    const response: RunnerFailure = {
      ok: false,
      events: trace.getEvents(),
      error: text,
    }
    scope.postMessage(response)
  }
}

export {}

