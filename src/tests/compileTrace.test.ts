import { describe, expect, it } from 'vitest'
import { compileTrace } from '../trace/compileTrace'
import { detectModel } from '../trace/detectModel'
import type { RuntimeEvent } from '../types'

const events: RuntimeEvent[] = [
  { seq: 0, type: 'track', line: 2, target: 'dp', value: [0, 0, 0] },
  { seq: 1, type: 'line', line: 3 },
  { seq: 2, type: 'read', line: 3, target: 'dp', path: [0], value: 2 },
  { seq: 3, type: 'write', line: 3, target: 'dp', path: [1], before: 0, after: 2 },
  { seq: 4, type: 'done', line: 4, result: 2, duration: 0.5 },
]

describe('trace compiler', () => {
  it('replays writes into immutable visual snapshots', () => {
    const steps = compileTrace(events)
    expect(steps[0].snapshot.tracked.dp).toEqual([0, 0, 0])
    expect(steps[3].snapshot.tracked.dp).toEqual([0, 2, 0])
    expect(steps[3].snapshot.reads[0]).toMatchObject({ target: 'dp', path: [0] })
    expect(steps[3].snapshot.write).toMatchObject({ target: 'dp', path: [1], value: 2 })
    expect(steps[0].snapshot.tracked.dp).toEqual([0, 0, 0])
  })

  it('detects DP and segment tree models from semantic events', () => {
    expect(detectModel(events)).toBe('dp')

    const treeEvents: RuntimeEvent[] = [
      {
        seq: 0,
        type: 'call',
        line: 1,
        name: 'build',
        callId: 1,
        depth: 0,
        args: { p: 1, l: 0, r: 7 },
      },
    ]
    expect(detectModel(treeEvents)).toBe('segment-tree')
    expect(detectModel(events, 'array')).toBe('array')
  })
})
