import { useCallback, useEffect, useRef, useState } from 'react'
import {
  Braces,
  ChevronDown,
  CircleDot,
  Cpu,
  Play,
  Sparkles,
  WandSparkles,
} from 'lucide-react'
import { CodePanel } from './components/CodePanel'
import { Controls } from './components/Controls'
import { EventInspector } from './components/EventInspector'
import { VisualizationStage } from './components/VisualizationStage'
import { examples } from './examples'
import { runCode } from './runtime/runCode'
import { compileTrace } from './trace/compileTrace'
import { detectModel } from './trace/detectModel'
import type { ModelKind, ModelPreference, RunResult, VisualStep } from './types'

const modelOptions: Array<{ value: ModelPreference; label: string }> = [
  { value: 'auto', label: '自动识别模型' },
  { value: 'array', label: '数组模型' },
  { value: 'dp', label: '动态规划模型' },
  { value: 'segment-tree', label: '线段树模型' },
]

function resultText(value: unknown): string {
  if (value === undefined) return '—'
  if (typeof value === 'string') return value
  const text = JSON.stringify(value)
  return text.length > 44 ? `${text.slice(0, 41)}…` : text
}

export default function App() {
  const initial = examples[0]
  const [selectedExample, setSelectedExample] = useState(initial.id)
  const [code, setCode] = useState(initial.code)
  const [input, setInput] = useState(initial.input)
  const [mode, setMode] = useState<'edit' | 'trace'>('edit')
  const [preference, setPreference] = useState<ModelPreference>('auto')
  const [model, setModel] = useState<ModelKind>(initial.model)
  const [runResult, setRunResult] = useState<RunResult | null>(null)
  const [steps, setSteps] = useState<VisualStep[]>([])
  const [stepIndex, setStepIndex] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState(1)
  const [running, setRunning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const didAutoRun = useRef(false)

  const execute = useCallback(
    async (
      source = code,
      inputText = input,
      requestedModel: ModelPreference = preference,
    ) => {
      setRunning(true)
      setPlaying(false)
      setError(null)

      let parsedInput: unknown
      try {
        parsedInput = JSON.parse(inputText)
      } catch (parseError) {
        const detail = parseError instanceof Error ? parseError.message : String(parseError)
        setError(`JSON 输入无效：${detail}`)
        setRunning(false)
        setMode('edit')
        return
      }

      try {
        const result = await runCode(source, parsedInput)
        const nextSteps = compileTrace(result.events)
        setRunResult(result)
        setSteps(nextSteps)
        setModel(detectModel(result.events, requestedModel))
        setStepIndex(0)
        setMode('trace')
        setPlaying(nextSteps.length > 1)
      } catch (runError) {
        setError(runError instanceof Error ? runError.message : String(runError))
        setMode('edit')
      } finally {
        setRunning(false)
      }
    },
    [code, input, preference],
  )

  useEffect(() => {
    if (didAutoRun.current) return
    didAutoRun.current = true
    void execute(initial.code, initial.input, 'auto')
  }, [execute, initial.code, initial.input])

  useEffect(() => {
    if (!playing || steps.length < 2) return
    if (stepIndex >= steps.length - 1) {
      setPlaying(false)
      return
    }
    const timer = window.setTimeout(() => {
      setStepIndex((current) => Math.min(steps.length - 1, current + 1))
    }, 680 / speed)
    return () => window.clearTimeout(timer)
  }, [playing, speed, stepIndex, steps.length])

  useEffect(() => {
    if (runResult) setModel(detectModel(runResult.events, preference))
  }, [preference, runResult])

  const currentStep = steps[stepIndex] ?? null
  const selectedDefinition = examples.find((example) => example.id === selectedExample) ?? initial

  const loadExample = (id: string) => {
    const example = examples.find((item) => item.id === id)
    if (!example) return
    setSelectedExample(id)
    setCode(example.code)
    setInput(example.input)
    setPreference('auto')
    setModel(example.model)
    setError(null)
    void execute(example.code, example.input, 'auto')
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark"><WandSparkles size={21} /></span>
          <div>
            <div className="brand-title">Algorithm Motion Lab</div>
            <div className="brand-subtitle">代码即动画 · 执行轨迹驱动</div>
          </div>
        </div>
        <div className="pipeline" aria-label="运行管线">
          <span><Braces size={14} /> AST 插桩</span>
          <i />
          <span><Cpu size={14} /> Worker 执行</span>
          <i />
          <span><Sparkles size={14} /> 动态模型</span>
        </div>
        <div className="top-status">
          <span className={`status-light${running ? ' pulse' : ''}`} />
          {running ? 'RUNNING' : runResult ? 'READY' : 'IDLE'}
        </div>
      </header>

      <section className="command-bar" aria-label="运行配置">
        <div className="select-group">
          <label htmlFor="example-select">示例</label>
          <div className="select-shell">
            <select
              id="example-select"
              value={selectedExample}
              onChange={(event) => loadExample(event.target.value)}
            >
              {examples.map((example) => (
                <option key={example.id} value={example.id}>{example.title}</option>
              ))}
            </select>
            <ChevronDown size={15} />
          </div>
        </div>

        <div className="example-description">
          <CircleDot size={14} />
          <span>{selectedDefinition.description}</span>
        </div>

        <div className="select-group model-select">
          <label htmlFor="model-select">可视化模型</label>
          <div className="select-shell">
            <select
              id="model-select"
              value={preference}
              onChange={(event) => setPreference(event.target.value as ModelPreference)}
            >
              {modelOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
            <ChevronDown size={15} />
          </div>
        </div>

        <button
          className="run-button"
          type="button"
          onClick={() => void execute()}
          disabled={running}
        >
          <Play size={17} fill="currentColor" />
          {running ? '正在生成…' : '运行并生成动画'}
        </button>
      </section>

      <section className="workspace">
        <CodePanel
          code={code}
          input={input}
          mode={mode}
          currentLine={currentStep?.line ?? 0}
          currentEvent={currentStep?.event ?? null}
          error={error}
          onCodeChange={(value) => {
            setCode(value)
            setPlaying(false)
          }}
          onInputChange={(value) => {
            setInput(value)
            setPlaying(false)
          }}
          onModeChange={setMode}
        />

        <div className="stage-column">
          <VisualizationStage model={model} step={currentStep} running={running} />
          <EventInspector step={currentStep} />
          <Controls
            index={stepIndex}
            total={steps.length}
            playing={playing}
            speed={speed}
            disabled={running}
            onIndexChange={(next) => {
              setStepIndex(next)
              setPlaying(false)
            }}
            onPlayingChange={(nextPlaying) => {
              if (stepIndex >= steps.length - 1 && nextPlaying) setStepIndex(0)
              setPlaying(nextPlaying)
            }}
            onSpeedChange={setSpeed}
          />
        </div>
      </section>

      <footer className="footer-status">
        <span>本地 Worker 隔离执行 · 2.5 秒 / 20,000 事件上限</span>
        <span className="footer-metrics">
          <strong>{runResult ? runResult.events.length.toLocaleString() : '0'}</strong> events
          <i />
          <strong>{runResult ? `${runResult.duration.toFixed(1)} ms` : '—'}</strong>
          <i />
          result <code>{runResult ? resultText(runResult.result) : '—'}</code>
        </span>
      </footer>
    </main>
  )
}
