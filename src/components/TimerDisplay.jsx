import { Plus, Minus, Play, Pause, Square } from 'lucide-react';
import { useTimerContext } from '../contexts/TimerContext';

export default function TimerDisplay({ onStart, onEndSession }) {
  const { time, realTime, addTime, start, pause, isRunning, sessionActive } = useTimerContext();
  const [minutes, seconds] = time.split(":").map(Number);

  const handleStart = () => {
    start();
    onStart && onStart();
  };

  const handlePause = () => {
    pause();
  };

  const handleEndSession = () => {
    onEndSession && onEndSession();
  };

  // Adjust button for +/- time
  const TimeAdjustButton = ({ onClick, ariaLabel, icon: Icon }) => (
    <button
      onClick={onClick}
      aria-label={ariaLabel}
      className="w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-200"
      style={{
        backgroundColor: 'var(--color-bg-tertiary)',
        color: 'var(--color-text-secondary)'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = 'var(--color-accent-primary)';
        e.currentTarget.style.color = 'white';
        e.currentTarget.style.transform = 'scale(1.1)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'var(--color-bg-tertiary)';
        e.currentTarget.style.color = 'var(--color-text-secondary)';
        e.currentTarget.style.transform = 'scale(1)';
      }}
    >
      <Icon size={18} />
    </button>
  );

  return (
    <div className="text-center my-8 slide-up" role="timer" aria-label="Minuteur de la session">
      {/* Main Timer Display */}
      <div
        className={`card inline-flex justify-center items-center gap-6 md:gap-10 text-5xl md:text-7xl font-bold tracking-widest px-8 py-6 mx-auto ${isRunning ? 'glow-pulse' : ''}`}
        style={{
          color: 'var(--color-text-primary)',
          borderColor: isRunning ? 'var(--color-accent-primary)' : 'var(--color-border-light)'
        }}
      >
        {/* Minutes block */}
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-3">
            <TimeAdjustButton
              onClick={() => addTime(-60)}
              ariaLabel="Retirer 1 minute"
              icon={Minus}
            />
            <span
              aria-label={`${minutes} minutes`}
              className="min-w-[80px] md:min-w-[100px] text-center tabular-nums"
            >
              {minutes.toString().padStart(2, "0")}
            </span>
            <TimeAdjustButton
              onClick={() => addTime(60)}
              ariaLabel="Ajouter 1 minute"
              icon={Plus}
            />
          </div>
          <span className="text-sm mt-2 font-medium" style={{ color: 'var(--color-text-muted)' }}>min</span>
        </div>

        <div className="text-5xl md:text-7xl" aria-hidden="true" style={{ color: 'var(--color-text-muted)' }}>:</div>

        {/* Seconds block */}
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-3">
            <TimeAdjustButton
              onClick={() => addTime(-10)}
              ariaLabel="Retirer 10 secondes"
              icon={Minus}
            />
            <span
              aria-label={`${seconds} secondes`}
              className="min-w-[80px] md:min-w-[100px] text-center tabular-nums"
            >
              {seconds.toString().padStart(2, "0")}
            </span>
            <TimeAdjustButton
              onClick={() => addTime(10)}
              ariaLabel="Ajouter 10 secondes"
              icon={Plus}
            />
          </div>
          <span className="text-sm mt-2 font-medium" style={{ color: 'var(--color-text-muted)' }}>sec</span>
        </div>
      </div>

      {/* Secondary "real" timer */}
      <p
        className="text-base mt-3 font-medium"
        style={{ color: 'var(--color-text-muted)' }}
        aria-label="Temps réel écoulé"
      >
        Temps réel: {realTime}
      </p>

      {/* Control buttons */}
      <div className="mt-6 flex justify-center gap-3" role="group" aria-label="Contrôles du minuteur">
        {!sessionActive ? (
          <button
            onClick={handleStart}
            aria-label="Débuter la session"
            className="btn btn-success px-8 py-3 text-lg font-semibold rounded-xl flex items-center gap-2"
          >
            <Play size={20} />
            Débuter Session
          </button>
        ) : (
          <>
            {isRunning ? (
              <button
                onClick={handlePause}
                aria-label="Mettre en pause le minuteur"
                className="btn btn-warning px-6 py-2.5 text-base font-semibold rounded-xl flex items-center gap-2"
              >
                <Pause size={18} />
                Pause
              </button>
            ) : (
              <button
                onClick={handleStart}
                aria-label="Reprendre le minuteur"
                className="btn btn-success px-6 py-2.5 text-base font-semibold rounded-xl flex items-center gap-2"
              >
                <Play size={18} />
                Reprendre
              </button>
            )}
            <button
              onClick={handleEndSession}
              aria-label="Terminer la session"
              className="px-6 py-2.5 text-base font-semibold rounded-xl flex items-center gap-2 transition-all duration-200"
              style={{
                backgroundColor: 'var(--color-danger)',
                color: 'white',
                border: 'none'
              }}
            >
              <Square size={18} />
              Fin de Session
            </button>
          </>
        )}
      </div>
    </div>
  );
}
