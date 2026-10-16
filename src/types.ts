export type ModelPreference = 'auto' | 'array' | 'dp' | 'segment-tree'
export type ModelKind = Exclude<ModelPreference, 'auto'>
export type TracePath = Array<string | number>

export interface TraceBase {
  seq: number
  line: number
}

export interface TrackEvent extends TraceBase {
  type: 'track'
  target: string
  value: unknown
}

export interface LineEvent extends TraceBase {
  type: 'line'
}

export interface CallEvent extends TraceBase {
  type: 'call'
  name: string
  callId: number
  depth: number
  args: Record<string, unknown>
}

export interface ReturnEvent extends TraceBase {
  type: 'return'
  name: string
  callId: number
  depth: number
  args: Record<string, unknown>
  value: unknown
}

export interface ReadEvent extends TraceBase {
  type: 'read'
  target: string
  path: TracePath
  value: unknown
}

export interface WriteEvent extends TraceBase {
  type: 'write'
  target: string
  path: TracePath
  before: unknown
  after: unknown
}

export interface BranchEvent extends TraceBase {
  type: 'branch'
  expression: string
  result: boolean
}

export interface DoneEvent extends TraceBase {
  type: 'done'
  result: unknown
  duration: number
}

export interface ErrorEvent extends TraceBase {
  type: 'error'
  message: string
}

export type RuntimeEvent =
  | TrackEvent
  | LineEvent
  | CallEvent
  | ReturnEvent
  | ReadEvent
  | WriteEvent
  | BranchEvent
  | DoneEvent
  | ErrorEvent

export interface TracePointer {
  target: string
  path: TracePath
  value: unknown
}

export interface CallFrame {
  name: string
  callId: number
  depth: number
  line: number
  args: Record<string, unknown>
}

export interface VisualSnapshot {
  tracked: Record<string, unknown>
  reads: TracePointer[]
  write: (TracePointer & { before: unknown }) | null
  callStack: CallFrame[]
  branch: { expression: string; result: boolean } | null
  result: unknown
}

export interface VisualStep {
  index: number
  event: RuntimeEvent
  line: number
  title: string
  description: string
  snapshot: VisualSnapshot
}

export interface InstrumentResult {
  code: string
}

export interface RunResult {
  events: RuntimeEvent[]
  result: unknown
  transformedCode: string
  duration: number
}

export interface ExampleDefinition {
  id: string
  title: string
  shortTitle: string
  description: string
  model: ModelKind
  code: string
  input: string
}

export interface TraceRuntime {
  line(line: number): void
  track<T>(name: string, value: T, line?: number): T
  call(name: string, args: Record<string, unknown>, line: number): number
  ret<T>(name: string, value: T, line: number, callId: number): T
  branch(expression: string, value: unknown, line: number): unknown
  complete(result: unknown, duration: number): void
  fail(message: string): void
  getEvents(): RuntimeEvent[]
}
