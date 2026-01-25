import { useState } from 'react';
import { Wifi, WifiOff, CheckCircle2, Circle, ChevronDown, ChevronUp, Unlock, RotateCcw, Zap } from 'lucide-react';
import { useRoomController } from '../contexts/RoomControllerContext';
import { useToast } from './ToastProvider';

function PropCard({ prop }) {
  const { forceSolve, resetProp, triggerSensor, session } = useRoomController();
  const { showToast } = useToast();
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);

  const { propId, name, online, solved, override, startedAt, solvedAt, sensors } = prop;

  // Calculate time spent on this prop
  const getTimeSpent = () => {
    if (!startedAt) return null;
    const endTime = solvedAt || Date.now();
    const ms = endTime - startedAt;
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const handleForceSolve = async () => {
    setLoading(true);
    try {
      await forceSolve(propId);
      showToast(`${name} résolu`, 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
    setLoading(false);
  };

  const handleReset = async () => {
    setLoading(true);
    try {
      await resetProp(propId);
      showToast(`${name} réinitialisé`, 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
    setLoading(false);
  };

  const handleTriggerSensor = async (sensorId, label) => {
    try {
      await triggerSensor(propId, sensorId);
      showToast(`${label} déclenché`, 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const timeSpent = getTimeSpent();
  const hasSensors = sensors && sensors.length > 0;
  const triggeredCount = hasSensors ? sensors.filter(s => s.triggered).length : 0;

  return (
    <div
      className="card p-4 transition-all duration-200"
      style={{
        opacity: online ? 1 : 0.6,
        borderLeft: `4px solid ${solved ? 'var(--color-success)' : override ? 'var(--color-warning)' : 'var(--color-bg-elevated)'}`
      }}
    >
      {/* Header row */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {/* Online indicator */}
          {online ? (
            <Wifi size={16} style={{ color: 'var(--color-success)' }} />
          ) : (
            <WifiOff size={16} style={{ color: 'var(--color-text-muted)' }} />
          )}

          {/* Prop name */}
          <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
            {name}
          </span>

          {/* Override badge */}
          {override && (
            <span
              className="text-xs px-2 py-0.5 rounded-full"
              style={{ backgroundColor: 'var(--color-warning)', color: 'black' }}
            >
              GM
            </span>
          )}
        </div>

        {/* Solved indicator */}
        {solved ? (
          <CheckCircle2 size={20} style={{ color: 'var(--color-success)' }} />
        ) : (
          <Circle size={20} style={{ color: 'var(--color-text-muted)' }} />
        )}
      </div>

      {/* Time spent */}
      {session.active && timeSpent && (
        <div className="text-sm mb-2" style={{ color: 'var(--color-text-secondary)' }}>
          Temps: {timeSpent}
        </div>
      )}

      {/* Sensors progress */}
      {hasSensors && (
        <div className="mb-3">
          <div className="flex items-center justify-between text-sm mb-1">
            <span style={{ color: 'var(--color-text-secondary)' }}>
              Capteurs: {triggeredCount}/{sensors.length}
            </span>
            <button
              onClick={() => setExpanded(!expanded)}
              className="p-1 rounded transition-colors"
              style={{ color: 'var(--color-text-muted)' }}
            >
              {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          </div>

          {/* Progress bar */}
          <div
            className="h-1.5 rounded-full overflow-hidden"
            style={{ backgroundColor: 'var(--color-bg-tertiary)' }}
          >
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${(triggeredCount / sensors.length) * 100}%`,
                backgroundColor: triggeredCount === sensors.length
                  ? 'var(--color-success)'
                  : 'var(--color-accent-primary)'
              }}
            />
          </div>

          {/* Expanded sensors list */}
          {expanded && (
            <div className="mt-3 space-y-2">
              {sensors.map((sensor) => (
                <div
                  key={sensor.sensorId}
                  className="flex items-center justify-between p-2 rounded"
                  style={{ backgroundColor: 'var(--color-bg-tertiary)' }}
                >
                  <div className="flex items-center gap-2">
                    {sensor.triggered ? (
                      <CheckCircle2 size={14} style={{ color: 'var(--color-success)' }} />
                    ) : (
                      <Circle size={14} style={{ color: 'var(--color-text-muted)' }} />
                    )}
                    <span
                      className="text-sm"
                      style={{
                        color: sensor.triggered
                          ? 'var(--color-text-primary)'
                          : 'var(--color-text-secondary)'
                      }}
                    >
                      {sensor.label}
                    </span>
                  </div>

                  {/* Trigger button (only if not triggered and online) */}
                  {!sensor.triggered && online && (
                    <button
                      onClick={() => handleTriggerSensor(sensor.sensorId, sensor.label)}
                      className="p-1.5 rounded transition-colors"
                      style={{
                        backgroundColor: 'var(--color-bg-elevated)',
                        color: 'var(--color-text-secondary)'
                      }}
                      title="Déclencher manuellement"
                    >
                      <Zap size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-2 mt-3">
        {!solved && online && (
          <button
            onClick={handleForceSolve}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-sm font-medium transition-colors"
            style={{
              backgroundColor: 'var(--color-success)',
              color: 'white',
              opacity: loading ? 0.7 : 1
            }}
          >
            <Unlock size={14} />
            Résoudre
          </button>
        )}

        {online && (
          <button
            onClick={handleReset}
            disabled={loading}
            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-sm font-medium transition-colors"
            style={{
              backgroundColor: 'var(--color-bg-tertiary)',
              color: 'var(--color-text-secondary)',
              opacity: loading ? 0.7 : 1
            }}
          >
            <RotateCcw size={14} />
            Reset
          </button>
        )}

        {!online && (
          <div
            className="flex-1 text-center py-2 text-sm"
            style={{ color: 'var(--color-text-muted)' }}
          >
            Hors ligne
          </div>
        )}
      </div>
    </div>
  );
}

export default PropCard;
