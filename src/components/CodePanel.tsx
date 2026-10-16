import { useEffect, useRef } from 'react'
import { Braces, Code2, PlayCircle, ScanLine } from 'lucide-react'
import type { RuntimeEvent } from '../types'

interface CodePanelProps {
  code: string
  input: string
  mode: 'edit' | 'trace'
  currentLine: number
  currentEvent: RuntimeEvent | null
  error: string | null
  onCodeChange: (value: string) => void
  onInputChange: (value: string) => void
  onModeChange: (mode: 'edit' | 'trace') => void
}

const eventLabels: Record<RuntimeEvent['type'], string> = {
  line: 'LINE',
  track: 'TRACK',
  read: 'READ',
  write: 'WRITE',
  branch: 'BRANCH',
  call: 'CALL',
  return: 'RETURN',
  done: 'DONE',
  error: 'ERROR',
}

export function CodePanel({
  code,
  input,
  mode,
  currentLine,
  currentEvent,
  error,
  onCodeChange,
  onInputChange,
  onModeChange,
}: CodePanelProps) {
  const traceRef = useRef<HTMLDivElement>(null)
  const lines = code.split('\n')

  useEffect(() => {
    if (mode !== 'trace') return
    traceRef.current
      ?.querySelector(`[data-line="${currentLine}"]`)
      ?.scrollIntoView({ block: 'center', behavior: 'smooth' })
  }, [currentLine, mode])

  return (
    <aside className="code-panel panel-shell" aria-label="代码与输入">
      <div className="panel-heading code-heading">
        <div className="heading-copy">
          <span className="eyebrow">SOURCE</span>
          <h2>代码轨道</h2>
        </div>
        <div className="segmented" role="tablist" aria-label="代码模式">
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'edit'}
            className={mode === 'edit' ? 'active' : ''}
            onClick={() => onModeChange('edit')}
          >
            <Code2 size={14} /> 编辑
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'trace'}
            className={mode === 'trace' ? 'active' : ''}
            onClick={() => onModeChange('trace')}
          >
            <ScanLine size={14} /> 执行轨迹
          </button>
        </div>
      </div>

      <div className="code-surface">
        {mode === 'edit' ? (
          <textarea
            className="code-editor"
            value={code}
            onChange={(event) => onCodeChange(event.target.value)}
            spellCheck={false}
            aria-label="算法代码"
          />
        ) : (
          <div className="trace-code" ref={traceRef} aria-label="逐行执行代码">
            {lines.map((line, index) => {
              const lineNumber = index + 1
              const active = lineNumber === currentLine
              return (
                <div
                  className={`code-line${active ? ' active' : ''}`}
                  data-line={lineNumber}
                  key={`${lineNumber}-${line}`}
                >
                  <span className="line-gutter">
                    {active ? <PlayCircle size={13} /> : null}
                    <span>{lineNumber}</span>
                  </span>
                  <code>{line || ' '}</code>
                  {active && currentEvent ? (
                    <span className={`event-token event-${currentEvent.type}`}>
                      {eventLabels[currentEvent.type]}
                    </span>
                  ) : null}
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div className="input-section">
        <label htmlFor="algorithm-input">
          <span className="input-label">
            <Braces size={14} /> JSON 输入
          </span>
          <span className="input-hint">传给 solve(input)</span>
        </label>
        <textarea
          id="algorithm-input"
          className="input-editor"
          value={input}
          onChange={(event) => onInputChange(event.target.value)}
          spellCheck={false}
          aria-invalid={Boolean(error && error.includes('JSON'))}
        />
        {error ? <div className="inline-error" role="alert">{error}</div> : null}
      </div>
    </aside>
  )
}
