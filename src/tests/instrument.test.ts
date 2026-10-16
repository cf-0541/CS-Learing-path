import { describe, expect, it } from 'vitest'
import { examples } from '../examples'
import { instrumentCode } from '../instrumentation/instrument'
import { createTraceRuntime, TraceLimitError } from '../runtime/traceRuntime'
import type { RuntimeEvent } from '../types'

function execute(source: string, input: unknown): { events: RuntimeEvent[]; result: unknown } {
  const { code } = instrumentCode(source)
  const trace = createTraceRuntime()
  const run = new Function(
    '__trace',
    '__input',
    `"use strict"; ${code}; return solve(__input);`,
  ) as (runtime: ReturnType<typeof createTraceRuntime>, inputValue: unknown) => unknown
  const result = run(trace, input)
  trace.complete(result, 1)
  return { events: trace.getEvents(), result }
}

describe('AST instrumentation', () => {
  it('captures line, read, write, call and return events for DP code', () => {
    const example = examples.find((item) => item.id === 'house-robber')!
    const { events, result } = execute(example.code, JSON.parse(example.input))

    expect(result).toBe(12)
    expect(events.some((event) => event.type === 'line')).toBe(true)
    expect(events.some((event) => event.type === 'track' && event.target === 'dp')).toBe(true)
    expect(events.some((event) => event.type === 'read' && event.target === 'dp')).toBe(true)
    expect(
      events.some(
        (event) =>
          event.type === 'write' && event.target === 'dp' && event.path[0] === 4 && event.after === 12,
      ),
    ).toBe(true)
    expect(events.filter((event) => event.type === 'call' && event.name === 'solve')).toHaveLength(1)
    expect(events.filter((event) => event.type === 'return' && event.name === 'solve')).toHaveLength(1)
  })

  it('pairs recursive calls and returns with stable call ids', () => {
    const source = `function solve(n) {
  function sum(value) {
    if (value === 0) return 0;
    return value + sum(value - 1);
  }
  return sum(n);
}`
    const { events, result } = execute(source, 4)
    const calls = events.filter(
      (event): event is Extract<RuntimeEvent, { type: 'call' }> =>
        event.type === 'call' && event.name === 'sum',
    )
    const returns = events.filter(
      (event): event is Extract<RuntimeEvent, { type: 'return' }> =>
        event.type === 'return' && event.name === 'sum',
    )

    expect(result).toBe(10)
    expect(calls).toHaveLength(5)
    expect(returns).toHaveLength(5)
    expect(new Set(calls.map((event) => event.callId))).toEqual(
      new Set(returns.map((event) => event.callId)),
    )
    expect(Math.max(...calls.map((event) => event.depth))).toBeGreaterThanOrEqual(4)
  })

  it('stores proxied return values as cloneable completion snapshots', () => {
    const example = examples.find((item) => item.id === 'bubble-sort')!
    const { events } = execute(example.code, JSON.parse(example.input))
    const done = events.find(
      (event): event is Extract<RuntimeEvent, { type: 'done' }> => event.type === 'done',
    )

    expect(done?.result).toEqual([1, 2, 3, 5, 6, 7])
    expect(() => structuredClone(done?.result)).not.toThrow()
  })

  it('stops emitting after the configured event limit', () => {
    const trace = createTraceRuntime(3)
    trace.line(1)
    trace.line(2)
    trace.line(3)
    expect(() => trace.line(4)).toThrow(TraceLimitError)
  })
})


