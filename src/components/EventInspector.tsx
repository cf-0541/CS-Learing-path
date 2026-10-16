import { Activity, GitBranch, Layers3 } from 'lucide-react'
import type { VisualStep } from '../types'

interface EventInspectorProps {
  step: VisualStep | null
}

function formatTarget(step: VisualStep): string {
  const event = step.event
  if (event.type === 'read' || event.type === 'write') {
    return `${event.target}${event.path.map((part) => `[${part}]`).join('')}`
  }
  if (event.type === 'call' || event.type === 'return') return `${event.name}()`
  if (event.type === 'branch') return event.result ? 'TRUE' : 'FALSE'
  if (event.type === 'done') return 'RESULT'
  return `LINE ${event.line}`
}

export function EventInspector({ step }: EventInspectorProps) {
  if (!step) {
    return (
      <div className="event-strip empty">
        <Activity size={15} /> 运行代码后，这里会显示当前事件。
      </div>
    )
  }

  return (
    <div className="event-strip" aria-live="polite">
      <div className={`event-kind kind-${step.event.type}`}>
        <Activity size={14} /> {step.event.type.toUpperCase()}
      </div>
      <div className="event-target">{formatTarget(step)}</div>
      <div className="event-metric">
        <Layers3 size={14} /> 调用深度 {step.snapshot.callStack.length}
      </div>
      {step.snapshot.branch ? (
        <div className={`event-metric branch-${step.snapshot.branch.result}`}>
          <GitBranch size={14} /> {step.snapshot.branch.result ? '分支成立' : '分支跳过'}
        </div>
      ) : null}
    </div>
  )
}
