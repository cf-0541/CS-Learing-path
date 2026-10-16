import type { ReturnEvent, VisualStep } from '../types'
import { formatCell } from '../trace/state'

interface SegmentTreeSceneProps {
  step: VisualStep
}

interface TreeNode {
  p: number
  l: number
  r: number
  depth: number
  parent: number | null
  x: number
  y: number
}

function createNodes(length: number): TreeNode[] {
  const nodes: TreeNode[] = []
  const width = 900
  const build = (p: number, l: number, r: number, depth: number, parent: number | null) => {
    const midpoint = (l + r + 1) / 2
    nodes.push({
      p,
      l,
      r,
      depth,
      parent,
      x: 30 + (midpoint / length) * width,
      y: 58 + depth * 92,
    })
    if (l === r) return
    const mid = Math.floor((l + r) / 2)
    build(p * 2, l, mid, depth + 1, p)
    build(p * 2 + 1, mid + 1, r, depth + 1, p)
  }
  if (length > 0) build(1, 0, length - 1, 0, null)
  return nodes
}

function numericArg(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null
}

export function SegmentTreeScene({ step }: SegmentTreeSceneProps) {
  const values = (Array.isArray(step.snapshot.tracked.values)
    ? step.snapshot.tracked.values
    : []) as unknown[]
  const tree = (Array.isArray(step.snapshot.tracked.tree)
    ? step.snapshot.tracked.tree
    : []) as unknown[]

  if (!values.length) return <div className="scene-empty">等待捕获 values 与 tree…</div>

  const nodes = createNodes(values.length)
  const maxDepth = Math.max(0, ...nodes.map((node) => node.depth))
  const eventArgs =
    step.event.type === 'call' || step.event.type === 'return' ? step.event.args : null
  const currentFrame = [...step.snapshot.callStack]
    .reverse()
    .find((frame) => numericArg(frame.args.p) !== null)
  const currentP = numericArg(eventArgs?.p) ?? numericArg(currentFrame?.args.p)
  const activePath = new Set(
    step.snapshot.callStack
      .map((frame) => numericArg(frame.args.p))
      .filter((value): value is number => value !== null),
  )

  const trackedQuery = Array.isArray(step.snapshot.tracked.query)
    ? step.snapshot.tracked.query
    : null
  const queryFrame = [...step.snapshot.callStack]
    .reverse()
    .find((frame) => numericArg(frame.args.ql) !== null)
  const ql = numericArg(eventArgs?.ql) ?? numericArg(queryFrame?.args.ql) ?? numericArg(trackedQuery?.[0])
  const qr = numericArg(eventArgs?.qr) ?? numericArg(queryFrame?.args.qr) ?? numericArg(trackedQuery?.[1])
  const eventName = step.event.type === 'call' || step.event.type === 'return' ? step.event.name : ''
  const queryActive =
    /query/i.test(eventName) || step.snapshot.callStack.some((frame) => /query/i.test(frame.name))

  const writtenP =
    step.snapshot.write?.target === 'tree' && typeof step.snapshot.write.path[0] === 'number'
      ? step.snapshot.write.path[0]
      : null
  const returnedP =
    step.event.type === 'return' ? numericArg((step.event as ReturnEvent).args.p) : null
  const svgHeight = 104 + (maxDepth + 1) * 92

  return (
    <div className="segment-scene">
      <svg
        className="tree-svg"
        viewBox={`0 0 960 ${svgHeight}`}
        role="img"
        aria-label="线段树递归与区间查询动画"
      >
        {nodes.map((node) => {
          if (node.parent === null) return null
          const parent = nodes.find((candidate) => candidate.p === node.parent)
          if (!parent) return null
          const onPath = activePath.has(node.p) && activePath.has(parent.p)
          return (
            <line
              className={`tree-edge${onPath ? ' is-active' : ''}`}
              x1={parent.x}
              y1={parent.y + 25}
              x2={node.x}
              y2={node.y - 25}
              key={`${parent.p}-${node.p}`}
            />
          )
        })}

        {nodes.map((node) => {
          const outside = ql !== null && qr !== null && (node.r < ql || node.l > qr)
          const covered = ql !== null && qr !== null && ql <= node.l && node.r <= qr
          const partial = !outside && !covered
          const coverageClass = queryActive
            ? outside
              ? ' coverage-outside'
              : covered
                ? ' coverage-full'
                : partial
                  ? ' coverage-partial'
                  : ''
            : ''
          const active = node.p === currentP
          const pathActive = activePath.has(node.p)
          const writing = node.p === writtenP
          const returning = node.p === returnedP
          return (
            <g
              className={`tree-node${coverageClass}${active ? ' is-active' : ''}${pathActive ? ' on-path' : ''}${writing ? ' is-writing' : ''}${returning ? ' is-returning' : ''}`}
              transform={`translate(${node.x} ${node.y})`}
              key={node.p}
            >
              <rect x="-38" y="-27" width="76" height="54" rx="14" />
              <text className="tree-value" textAnchor="middle" y="1">
                {formatCell(tree[node.p])}
              </text>
              <text className="tree-range" textAnchor="middle" y="17">
                [{node.l}, {node.r}]
              </text>
              <text className="tree-index" textAnchor="middle" y="-36">p={node.p}</text>
            </g>
          )
        })}
      </svg>

      <div className="query-strip">
        <div className="query-title">
          查询区间
          {ql !== null && qr !== null ? <strong>[{ql}, {qr}]</strong> : <span>尚未进入查询</span>}
        </div>
        <div className="query-values">
          {values.map((value, index) => {
            const included = ql !== null && qr !== null && index >= ql && index <= qr
            return (
              <div className={`query-cell${included ? ' included' : ''}`} key={index}>
                <span>{formatCell(value)}</span>
                <small>{index}</small>
              </div>
            )
          })}
        </div>
      </div>

      <div className="scene-legend tree-legend">
        <span><i className="legend-dot full" />完全覆盖</span>
        <span><i className="legend-dot partial" />部分相交</span>
        <span><i className="legend-dot outside" />区间外</span>
        <span><i className="legend-dot write" />当前节点</span>
      </div>
    </div>
  )
}
