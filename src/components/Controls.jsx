import { Play, Pause, Square } from "lucide-react";

export default function Controls({
  onPlay,
  onPause,
  onStop,
  canPause = true,
  canStop = true,
  size = "md",
  className = "",
  titles = { play: "Lire", pause: "Pause", stop: "Stop" },
}) {
  // Size presets for consistent button + icon sizing
  const sizes = {
    sm: { btn: "p-1.5", icon: 14 },
    md: { btn: "p-2", icon: 18 },
    lg: { btn: "p-2.5", icon: 22 },
  };
  const s = sizes[size] || sizes.md;

  const baseButtonClass = `${s.btn} rounded-lg transition-all duration-200 flex items-center justify-center`;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <button
        onClick={onPlay}
        className={baseButtonClass}
        style={{
          backgroundColor: 'var(--color-success)',
          color: 'white'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--color-success-hover)';
          e.currentTarget.style.transform = 'scale(1.05)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--color-success)';
          e.currentTarget.style.transform = 'scale(1)';
        }}
        title={titles.play}
        aria-label={titles.play}
      >
        <Play size={s.icon} />
      </button>

      <button
        onClick={onPause}
        disabled={!canPause}
        className={baseButtonClass}
        style={{
          backgroundColor: canPause ? 'var(--color-warning)' : 'var(--color-bg-elevated)',
          color: 'white',
          cursor: canPause ? 'pointer' : 'not-allowed',
          opacity: canPause ? 1 : 0.5
        }}
        onMouseEnter={(e) => {
          if (canPause) {
            e.currentTarget.style.backgroundColor = 'var(--color-warning-hover)';
            e.currentTarget.style.transform = 'scale(1.05)';
          }
        }}
        onMouseLeave={(e) => {
          if (canPause) {
            e.currentTarget.style.backgroundColor = 'var(--color-warning)';
            e.currentTarget.style.transform = 'scale(1)';
          }
        }}
        title={titles.pause}
        aria-label={titles.pause}
      >
        <Pause size={s.icon} />
      </button>

      <button
        onClick={onStop}
        disabled={!canStop}
        className={baseButtonClass}
        style={{
          backgroundColor: canStop ? 'var(--color-danger)' : 'var(--color-bg-elevated)',
          color: 'white',
          cursor: canStop ? 'pointer' : 'not-allowed',
          opacity: canStop ? 1 : 0.5
        }}
        onMouseEnter={(e) => {
          if (canStop) {
            e.currentTarget.style.backgroundColor = 'var(--color-danger-hover)';
            e.currentTarget.style.transform = 'scale(1.05)';
          }
        }}
        onMouseLeave={(e) => {
          if (canStop) {
            e.currentTarget.style.backgroundColor = 'var(--color-danger)';
            e.currentTarget.style.transform = 'scale(1)';
          }
        }}
        title={titles.stop}
        aria-label={titles.stop}
      >
        <Square size={s.icon} />
      </button>
    </div>
  );
}
