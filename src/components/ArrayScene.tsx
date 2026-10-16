import type { VisualStep } from '../types'
import { asArray, formatCell, pointerMatches, readMatches } from '../trace/state'

interface ArraySceneProps {
  step: VisualStep
}

function chooseArray(step: VisualStep): [string, unknown[]] | null {
  const entries = Object.entries(step.snapshot.tracked).filter(([, value]) => {
    return Array.isArray(value) && !value.some(Array.isArray)
  }) as Array<[string, unknown[]]>

  const focusedTarget = step.snapshot.write?.target ?? step.snapshot.reads.at(-1)?.target
  return (
    entries.find(([name]) => name === focusedTarget) ??
    entries.find(([name]) => /^(arr|nums|values|array)$/i.test(name)) ??
    entries[0] ??
    null
  )
}

export function ArrayScene({ step }: ArraySceneProps) {
  const selected = chooseArray(step)
  if (!selected) {
    return <div className="scene-empty">等待捕获数组…</div>
  }

  const [target, values] = selected
  const numericValues = values.map((value) => (typeof value === 'number' ? value : 0))
  const max = Math.max(1, ...numericValues.map((value) => Math.abs(value)))
  const visibleValues = values.slice(0, 24)

  return (
    <div className="array-scene">
      <div className="structure-caption">
        <span className="structure-name">{target}</span>
        <span>{values.length} 个元素</span>
      </div>
      <div className="array-bars" style={{ '--items': visibleValues.length } as React.CSSProperties}>
        {visibleValues.map((value, index) => {
          const path = [index]
          const reading = readMatches(step.snapshot, target, path)
          const writing = pointerMatches(step.snapshot.write, target, path)
          const magnitude = typeof value === 'number' ? Math.abs(value) / max : 0.45
          return (
            <div
              className={`array-column${reading ? ' is-reading' : ''}${writing ? ' is-writing' : ''}`}
              key={index}
            >
              <div className="array-value">{formatCell(value)}</div>
              <div className="bar-track">
                <div className="bar-fill" style={{ height: `${24 + magnitude * 76}%` }} />
              </div>
              <div className="array-cell">
                <span>{formatCell(value)}</span>
              </div>
              <div className="array-index">[{index}]</div>
            </div>
          )
        })}
      </div>
      {values.length > visibleValues.length ? (
        <div className="scene-footnote">为保持可读性，仅显示前 {visibleValues.length} 项。</div>
      ) : null}
      <div className="scene-legend">
        <span><i className="legend-dot read" />读取 / 比较</span>
        <span><i className="legend-dot write" />写入 / 交换</span>
      </div>
    </div>
  )
}
