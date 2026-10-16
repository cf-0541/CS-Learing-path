import {
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  RotateCcw,
  SkipBack,
} from 'lucide-react'

interface ControlsProps {
  index: number
  total: number
  playing: boolean
  speed: number
  disabled?: boolean
  onIndexChange: (index: number) => void
  onPlayingChange: (playing: boolean) => void
  onSpeedChange: (speed: number) => void
}

const speeds = [0.5, 1, 1.5, 2]

export function Controls({
  index,
  total,
  playing,
  speed,
  disabled = false,
  onIndexChange,
  onPlayingChange,
  onSpeedChange,
}: ControlsProps) {
  const safeTotal = Math.max(1, total)
  const safeIndex = Math.min(index, safeTotal - 1)

  return (
    <div className="playback" aria-label="动画播放控制">
      <div className="transport-buttons">
        <button
          className="icon-button"
          type="button"
          aria-label="回到开头"
          data-tooltip="回到开头"
          onClick={() => onIndexChange(0)}
          disabled={disabled || safeIndex === 0}
        >
          <SkipBack size={17} />
        </button>
        <button
          className="icon-button"
          type="button"
          aria-label="上一步"
          data-tooltip="上一步"
          onClick={() => onIndexChange(Math.max(0, safeIndex - 1))}
          disabled={disabled || safeIndex === 0}
        >
          <ChevronLeft size={19} />
        </button>
        <button
          className="play-button"
          type="button"
          onClick={() => onPlayingChange(!playing)}
          disabled={disabled || total < 2}
        >
          {playing ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
          {playing ? '暂停' : '播放'}
        </button>
        <button
          className="icon-button"
          type="button"
          aria-label="下一步"
          data-tooltip="下一步"
          onClick={() => onIndexChange(Math.min(safeTotal - 1, safeIndex + 1))}
          disabled={disabled || safeIndex >= safeTotal - 1}
        >
          <ChevronRight size={19} />
        </button>
        <button
          className="icon-button mobile-hide"
          type="button"
          aria-label="重播"
          data-tooltip="重播"
          onClick={() => {
            onIndexChange(0)
            onPlayingChange(true)
          }}
          disabled={disabled || total < 2}
        >
          <RotateCcw size={16} />
        </button>
      </div>

      <div className="timeline-wrap">
        <input
          className="timeline"
          type="range"
          min={0}
          max={safeTotal - 1}
          value={safeIndex}
          onChange={(event) => onIndexChange(Number(event.target.value))}
          disabled={disabled || total < 2}
          aria-label="执行时间轴"
          style={{ '--progress': `${(safeIndex / Math.max(1, safeTotal - 1)) * 100}%` } as React.CSSProperties}
        />
        <span className="step-count tabular">
          {total ? safeIndex + 1 : 0} / {total}
        </span>
      </div>

      <div className="speed-control" aria-label="播放速度">
        {speeds.map((item) => (
          <button
            type="button"
            key={item}
            className={speed === item ? 'active' : ''}
            aria-pressed={speed === item}
            onClick={() => onSpeedChange(item)}
          >
            {item}×
          </button>
        ))}
      </div>
    </div>
  )
}
