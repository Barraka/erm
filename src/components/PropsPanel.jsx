import { Fragment, useState, useEffect } from 'react';
import { Wifi, WifiOff, RefreshCw, ChevronRight, Puzzle } from 'lucide-react';
import { useRoomController } from '../contexts/RoomControllerContext';
import PropCard from './PropCard';

// Returns circled numbers ①②③④⑤⑥⑦⑧⑨⑩
const getCircledNumber = (n) => {
  const circled = ['①', '②', '③', '④', '⑤', '⑥', '⑦', '⑧', '⑨', '⑩'];
  return circled[n - 1] || `(${n})`;
};

// Group props by their order value into steps
const groupPropsIntoSteps = (props) => {
  const sorted = [...props].sort((a, b) => a.order - b.order);
  const steps = [];
  let currentOrder = null;
  let currentStep = null;

  for (const prop of sorted) {
    if (prop.order !== currentOrder) {
      currentStep = { order: prop.order, props: [prop] };
      steps.push(currentStep);
      currentOrder = prop.order;
    } else {
      currentStep.props.push(prop);
    }
  }

  return steps;
};

// Format milliseconds as MM:SS
const formatStepTime = (ms) => {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
};

function PropsPanel() {
  const { connectionStatus, roomInfo, props, connect, session } = useRoomController();
  const [isExpanded, setIsExpanded] = useState(true);
  const [, setTick] = useState(0);

  // Tick every second during active session for live step timers
  useEffect(() => {
    if (!session?.active) return;
    const id = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(id);
  }, [session?.active]);

  const steps = groupPropsIntoSteps(props);
  const onlineCount = props.filter(p => p.online).length;
  const totalCount = props.length;
  const allOnline = totalCount > 0 && onlineCount === totalCount;

  const onlineCountBadge = connectionStatus === 'connected' && totalCount > 0 && (
    <span
      className="text-sm font-medium"
      style={{ color: allOnline ? 'var(--color-success)' : 'var(--color-warning)' }}
    >
      {onlineCount}/{totalCount}
    </span>
  );

  return (
    <div className="card p-4 md:p-5 fade-in mt-6 mb-6">
      {/* Header - clickable to toggle */}
      <div
        className="flex items-center justify-between cursor-pointer rounded-lg p-2 -m-2 transition-all duration-200 hover:bg-[var(--color-bg-tertiary)]"
        onClick={() => setIsExpanded((v) => !v)}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg" style={{ backgroundColor: 'var(--color-bg-tertiary)' }}>
            <Puzzle size={20} style={{ color: 'var(--color-accent-primary)' }} />
          </div>
          <h2
            className="text-lg font-semibold"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Enigmes
          </h2>

          {/* Online count + summary when collapsed */}
          {!isExpanded && onlineCountBadge}
        </div>

        <div className="flex items-center gap-2">
          {/* Connection status */}
          {isExpanded && (
            <>
              {connectionStatus === 'connected' ? (
                <div className="flex items-center gap-2 text-sm">
                  {onlineCountBadge}
                  <div className="flex items-center gap-1.5" style={{ color: 'var(--color-success)' }}>
                    <Wifi size={16} />
                    <span>Connecté</span>
                  </div>
                </div>
              ) : connectionStatus === 'connecting' ? (
                <div className="flex items-center gap-1.5 text-sm" style={{ color: 'var(--color-warning)' }}>
                  <RefreshCw size={16} className="animate-spin" />
                  <span>Connexion...</span>
                </div>
              ) : (
                <button
                  onClick={(e) => { e.stopPropagation(); connect(); }}
                  className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg transition-colors"
                  style={{
                    backgroundColor: 'var(--color-bg-tertiary)',
                    color: 'var(--color-text-secondary)'
                  }}
                >
                  <WifiOff size={16} />
                  <span>Reconnecter</span>
                </button>
              )}
            </>
          )}

          {/* Chevron */}
          <div
            className="p-1.5 rounded-lg"
            style={{ backgroundColor: 'var(--color-bg-tertiary)' }}
          >
            <ChevronRight
              size={20}
              className={`transition-transform duration-300 ${isExpanded ? "rotate-90" : "rotate-0"}`}
              style={{ color: 'var(--color-text-secondary)' }}
            />
          </div>
        </div>
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="mt-4">
          {connectionStatus === 'connected' && props.length > 0 ? (
            <div className="props-timeline-container">
              <div className="props-timeline">
                {steps.map((step, index) => (
                  <Fragment key={step.order}>
                    {/* Step column */}
                    <div className="step-column">
                      <div className="step-badge">
                        {getCircledNumber(index + 1)}
                      </div>
                      <div className="step-cards">
                        {step.props.map((prop) => (
                          <PropCard key={prop.propId} prop={prop} compact />
                        ))}
                      </div>

                      {/* Step timer - visible during active session */}
                      {session?.active && session.startedAt && (() => {
                        const allSolved = step.props.every(p => p.solved);
                        const now = Date.now();
                        if (allSolved) {
                          // Freeze at the latest solvedAt in this step
                          const latestSolvedAt = Math.max(...step.props.map(p => p.solvedAt || now));
                          const elapsed = latestSolvedAt - session.startedAt;
                          return <div className="step-timer solved">{formatStepTime(elapsed)}</div>;
                        }
                        // Live elapsed from session start
                        const elapsed = now - session.startedAt;
                        return <div className="step-timer">{formatStepTime(elapsed)}</div>;
                      })()}
                    </div>

                    {/* Arrow connector (except after last step) */}
                    {index < steps.length - 1 && (
                      <div className="step-connector">
                        <ChevronRight size={28} />
                      </div>
                    )}
                  </Fragment>
                ))}
              </div>
            </div>
          ) : connectionStatus === 'connected' && props.length === 0 ? (
            <div
              className="text-center py-8"
              style={{ color: 'var(--color-text-muted)' }}
            >
              Aucun prop configuré
            </div>
          ) : connectionStatus === 'connecting' ? (
            <div
              className="text-center py-8"
              style={{ color: 'var(--color-text-muted)' }}
            >
              Connexion au Room Controller...
            </div>
          ) : (
            <div
              className="text-center py-8"
              style={{ color: 'var(--color-text-muted)' }}
            >
              <p className="mb-2">Non connecté au Room Controller</p>
              <p className="text-sm">Vérifiez que le Room Controller est démarré</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default PropsPanel;
