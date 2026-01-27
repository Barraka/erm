import { useState } from 'react';
import { Wifi, WifiOff, CheckCircle2, Unlock, RotateCcw } from 'lucide-react';
import { useRoomController } from '../contexts/RoomControllerContext';
import { useToast } from './ToastProvider';

function PropCard({ prop, compact = false }) {
  const { forceSolve, resetProp, session } = useRoomController();
  const { showToast } = useToast();
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

  const timeSpent = getTimeSpent();
  const hasSensors = sensors && sensors.length > 0;
  const triggeredCount = hasSensors ? sensors.filter(s => s.triggered).length : 0;
  const allTriggered = hasSensors && triggeredCount === sensors.length;

  // Compact card for timeline view
  if (compact) {
    return (
      <div
        className={`prop-card-compact ${solved ? 'solved' : ''} ${!online ? 'offline' : ''}`}
        style={{
          '--card-border-color': solved
            ? 'var(--color-success)'
            : override
              ? 'var(--color-warning)'
              : 'var(--color-border-light)'
        }}
      >
        {/* Header: Name + Status */}
        <div className="prop-card-header">
          <div className="prop-card-title">
            {/* Online/Offline indicator */}
            {online ? (
              <Wifi size={14} className="prop-status-icon online" />
            ) : (
              <WifiOff size={14} className="prop-status-icon offline" />
            )}
            <span className="prop-name">{name}</span>
            {override && <span className="gm-badge">GM</span>}
          </div>

          {/* Solved checkmark */}
          {solved && (
            <CheckCircle2 size={18} className="solved-icon" />
          )}
        </div>

        {/* Time spent (only during active session) */}
        {session.active && timeSpent && (
          <div className="prop-time">{timeSpent}</div>
        )}

        {/* Sensor dots */}
        {hasSensors && (
          <div className="sensor-dots">
            {sensors.map((sensor) => (
              <div
                key={sensor.sensorId}
                className={`sensor-dot ${sensor.triggered ? 'triggered' : 'waiting'}`}
                title={sensor.label}
              />
            ))}
          </div>
        )}

        {/* Action buttons (icon only) */}
        <div className="prop-actions">
          {!solved && online && (
            <button
              onClick={handleForceSolve}
              disabled={loading}
              className="prop-action-btn solve"
              title="Résoudre"
            >
              <Unlock size={14} />
            </button>
          )}
          {online && (
            <button
              onClick={handleReset}
              disabled={loading}
              className="prop-action-btn reset"
              title="Réinitialiser"
            >
              <RotateCcw size={14} />
            </button>
          )}
          {!online && (
            <span className="offline-label">Hors ligne</span>
          )}
        </div>
      </div>
    );
  }

  // Original full-size card (kept for backwards compatibility)
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
          {online ? (
            <Wifi size={16} style={{ color: 'var(--color-success)' }} />
          ) : (
            <WifiOff size={16} style={{ color: 'var(--color-text-muted)' }} />
          )}
          <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
            {name}
          </span>
          {override && (
            <span
              className="text-xs px-2 py-0.5 rounded-full"
              style={{ backgroundColor: 'var(--color-warning)', color: 'black' }}
            >
              GM
            </span>
          )}
        </div>
        {solved ? (
          <CheckCircle2 size={20} style={{ color: 'var(--color-success)' }} />
        ) : (
          <div size={20} style={{ color: 'var(--color-text-muted)' }} />
        )}
      </div>

      {session.active && timeSpent && (
        <div className="text-sm mb-2" style={{ color: 'var(--color-text-secondary)' }}>
          Temps: {timeSpent}
        </div>
      )}

      {hasSensors && (
        <div className="mb-3">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              Capteurs:
            </span>
            <div className="flex gap-1">
              {sensors.map((sensor) => (
                <div
                  key={sensor.sensorId}
                  className={`sensor-dot ${sensor.triggered ? 'triggered' : 'waiting'}`}
                  title={sensor.label}
                />
              ))}
            </div>
          </div>
        </div>
      )}

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
