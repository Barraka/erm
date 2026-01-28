import { useState, useEffect, useRef } from 'react';
import { Wifi, WifiOff, CheckCircle2, Unlock, RotateCcw, Zap } from 'lucide-react';
import { useRoomController } from '../contexts/RoomControllerContext';
import { useToast } from './ToastProvider';

function PropCard({ prop, compact = false }) {
  const { forceSolve, resetProp, triggerSensor, session } = useRoomController();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const wrapperRef = useRef(null);

  const { propId, name, online, solved, override, startedAt, solvedAt, sensors } = prop;

  // Close popover on click-outside or Escape
  useEffect(() => {
    if (!popoverOpen) return;

    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setPopoverOpen(false);
      }
    };
    const handleEscape = (e) => {
      if (e.key === 'Escape') setPopoverOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [popoverOpen]);

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

  const handleForceSolve = async (e) => {
    e.stopPropagation();
    setLoading(true);
    try {
      await forceSolve(propId);
      showToast(`${name} résolu`, 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
    setLoading(false);
  };

  const handleReset = async (e) => {
    e.stopPropagation();
    setLoading(true);
    try {
      await resetProp(propId);
      showToast(`${name} réinitialisé`, 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
    setLoading(false);
  };

  const handleTriggerSensor = async (e, sensorId, sensorLabel) => {
    e.stopPropagation();
    setLoading(true);
    try {
      await triggerSensor(propId, sensorId);
      showToast(`${sensorLabel} déclenché`, 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
    setLoading(false);
  };

  const timeSpent = getTimeSpent();
  const hasSensors = sensors && sensors.length > 0;

  // Compact card for timeline view
  if (compact) {
    return (
      <div className="prop-card-wrapper" ref={wrapperRef}>
        <div
          className={`prop-card-compact ${solved ? 'solved' : ''} ${!online ? 'offline' : ''} ${popoverOpen ? 'active' : ''}`}
          style={{
            '--card-border-color': solved
              ? 'var(--color-success)'
              : override
                ? 'var(--color-warning)'
                : 'var(--color-border-light)'
          }}
          onClick={() => setPopoverOpen(!popoverOpen)}
        >
          {/* Header: Name + Status */}
          <div className="prop-card-header">
            <div className="prop-card-title">
              {online ? (
                <Wifi size={14} className="prop-status-icon online" />
              ) : (
                <WifiOff size={14} className="prop-status-icon offline" />
              )}
              <span className="prop-name">{name}</span>
              {override && <span className="gm-badge">GM</span>}
            </div>

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

        </div>

        {/* Popover */}
        {popoverOpen && (
          <div className="prop-popover">
            <div className="prop-popover-header">
              {name}
              {!online && <span style={{ color: 'var(--color-danger)', fontWeight: 400 }}> - hors ligne</span>}
            </div>

            {/* Sensor list */}
            {hasSensors && (
              <div className="prop-popover-sensors">
                <div className="prop-popover-section-label">Capteurs</div>
                {sensors.map((sensor) => (
                  <div key={sensor.sensorId} className="prop-popover-sensor">
                    <div className={`sensor-dot ${sensor.triggered ? 'triggered' : 'waiting'}`} />
                    <span className="prop-popover-sensor-label">{sensor.label}</span>
                    {!sensor.triggered && (
                      <button
                        className="prop-popover-trigger-btn"
                        onClick={(e) => handleTriggerSensor(e, sensor.sensorId, sensor.label)}
                        disabled={loading}
                        title="Déclencher"
                      >
                        <Zap size={12} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Action buttons */}
            <div className="prop-popover-actions">
              {!solved && (
                <button
                  onClick={handleForceSolve}
                  disabled={loading}
                  className="prop-popover-btn solve"
                >
                  <Unlock size={14} />
                  Résoudre
                </button>
              )}
              <button
                onClick={handleReset}
                disabled={loading}
                className="prop-popover-btn reset"
              >
                <RotateCcw size={14} />
                Réinitialiser
              </button>
            </div>
          </div>
        )}
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
