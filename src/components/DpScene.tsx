import type { TracePointer, VisualStep } from '../types'
import { formatCell, pointerMatches, readMatches } from '../trace/state'

interface DpSceneProps {
  step: VisualStep
}

function chooseDp(step: VisualStep): [string, unknown[]] | null {
  const arrays = Object.entries(step.snapshot.tracked).filter(([, value]) => Array.isArray(value)) as Array<[
    string,
    unknown[],
  ]>
  return arrays.find(([name]) => /^(dp|memo|f)$/i.test(name)) ?? arrays.find(([, value]) => value.some(Array.isArray)) ?? null
}

function readIndex(pointer: TracePointer, target: string): number | null {
  if (pointer.target !== target || typeof pointer.path[0] !== 'number') return null
  return pointer.path[0]
}

function OneDimensionalDp({ target, values, step }: { target: string; values: unknown[]; step: VisualStep }) {
  const width = Math.max(680, values.length * 92 + 80)
  const nodeY = 142
  const xFor = (index: number) => 54 + index * 92
  const writeIndex =
    step.snapshot.write?.target === target && typeof step.snapshot.write.path[0] === 'number'
      ? step.snapshot.write.path[0]
      : null
  const dependencyIndices = [...new Set(
    step.snapshot.reads
      .map((pointer) => readIndex(pointer, target))
      .filter((index): index is number => index !== null),
  )]
  const inputEntry = Object.entries(step.snapshot.tracked).find(
    ([name, value]) => name !== target && Array.isArray(value) && !value.some(Array.isArray),
  ) as [string, unknown[]] | undefined

  return (
    <div className="dp-one-dimensional">
      <svg
        className="dp-svg"
        viewBox={`0 0 ${width} 300`}
        role="img"
        aria-label={`${target} 动态规划状态转移图`}
      >
        <defs>
          <marker id="dp-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" />
          </marker>
        </defs>

        <text className="svg-row-label" x="16" y="148">{target}</text>
        {writeIndex !== null
          ? dependencyIndices.map((source, arrowIndex) => {
              if (source === writeIndex || source >= values.length || writeIndex >= values.length) return null
              const sx = xFor(source)
              const tx = xFor(writeIndex)
              const lift = 46 + arrowIndex * 15
              return (
                <path
                  className="dependency-arrow"
                  key={`${source}-${writeIndex}`}
                  d={`M ${sx} ${nodeY - 34} C ${sx} ${nodeY - lift - 22}, ${tx} ${nodeY - lift - 22}, ${tx} ${nodeY - 34}`}
                  markerEnd="url(#dp-arrow)"
                />
              )
            })
          : null}

        {values.map((value, index) => {
          const reading = readMatches(step.snapshot, target, [index])
          const writing = pointerMatches(step.snapshot.write, target, [index])
          return (
            <g
              className={`dp-node${reading ? ' is-reading' : ''}${writing ? ' is-writing' : ''}`}
              transform={`translate(${xFor(index)} ${nodeY})`}
              key={index}
            >
              <rect x="-31" y="-28" width="62" height="56" rx="14" />
              <text className="node-value" textAnchor="middle" y="6">{formatCell(value)}</text>
              <text className="node-index" textAnchor="middle" y="48">[{index}]</text>
            </g>
          )
        })}

        {inputEntry ? (
          <>
            <line className="row-divider" x1="18" y1="211" x2={width - 24} y2="211" />
            <text className="svg-row-label" x="16" y="258">{inputEntry[0]}</text>
            {inputEntry[1].map((value, index) => {
              const reading = readMatches(step.snapshot, inputEntry[0], [index])
              return (
                <g
                  className={`input-node${reading ? ' is-reading' : ''}`}
                  transform={`translate(${xFor(index)} 250)`}
                  key={index}
                >
                  <rect x="-25" y="-22" width="50" height="44" rx="11" />
                  <text textAnchor="middle" y="5">{formatCell(value)}</text>
                </g>
              )
            })}
          </>
        ) : null}
      </svg>
    </div>
  )
}

function TwoDimensionalDp({ target, rows, step }: { target: string; rows: unknown[][]; step: VisualStep }) {
  const columnCount = Math.max(1, ...rows.map((row) => row.length))
  return (
    <div className="dp-grid-wrap">
      <div
        className="dp-grid"
        style={{ gridTemplateColumns: `42px repeat(${columnCount}, minmax(48px, 70px))` }}
        role="grid"
        aria-label={`${target} 二维动态规划表`}
      >
        <div className="grid-corner">{target}</div>
        {Array.from({ length: columnCount }, (_, column) => (
          <div className="grid-axis" key={`col-${column}`}>c{column}</div>
        ))}
        {rows.map((row, rowIndex) => (
          <div className="grid-row-fragment" key={`row-${rowIndex}`}>
            <div className="grid-axis">r{rowIndex}</div>
            {Array.from({ length: columnCount }, (_, columnIndex) => {
              const path = [rowIndex, columnIndex]
              const reading = readMatches(step.snapshot, target, path)
              const writing = pointerMatches(step.snapshot.write, target, path)
              return (
                <div
                  role="gridcell"
                  className={`dp-grid-cell${reading ? ' is-reading' : ''}${writing ? ' is-writing' : ''}`}
                  key={`${rowIndex}-${columnIndex}`}
                >
                  {formatCell(row[columnIndex])}
                </div>
              )
            })}
          </div>
        ))}
      </div>
      <div className="dependency-summary">
        {step.snapshot.write?.target === target ? (
          <>
            <span className="write-chip">
              写入 {target}[{step.snapshot.write.path.join('][')}]
            </span>
            <span className="arrow-text">←</span>
            {step.snapshot.reads
              .filter((pointer) => pointer.target === target)
              .slice(-3)
              .map((pointer) => (
                <span className="read-chip" key={pointer.path.join('-')}>
                  {target}[{pointer.path.join('][')}]
                </span>
              ))}
          </>
        ) : (
          <span className="muted-copy">读取青色状态，写入紫色状态。</span>
        )}
      </div>
    </div>
  )
}

export function DpScene({ step }: DpSceneProps) {
  const selected = chooseDp(step)
  if (!selected) return <div className="scene-empty">等待识别 DP 状态表…</div>

  const [target, values] = selected
  const matrix = values.length > 0 && values.every(Array.isArray)
  if (matrix) {
    return <TwoDimensionalDp target={target} rows={values as unknown[][]} step={step} />
  }
  return <OneDimensionalDp target={target} values={values} step={step} />
}
