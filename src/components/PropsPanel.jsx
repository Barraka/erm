import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { useRoomController } from '../contexts/RoomControllerContext';
import PropCard from './PropCard';

function PropsPanel() {
  const { connectionStatus, roomInfo, props, connect } = useRoomController();

  // Sort props by order
  const sortedProps = [...props].sort((a, b) => a.order - b.order);

  return (
    <div className="card p-4 md:p-5 fade-in mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2
          className="text-lg font-semibold"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Props
          {roomInfo && (
            <span
              className="ml-2 text-sm font-normal"
              style={{ color: 'var(--color-text-muted)' }}
            >
              — {roomInfo.name}
            </span>
          )}
        </h2>

        {/* Connection status */}
        <div className="flex items-center gap-2">
          {connectionStatus === 'connected' ? (
            <div className="flex items-center gap-1.5 text-sm" style={{ color: 'var(--color-success)' }}>
              <Wifi size={16} />
              <span>Connecté</span>
            </div>
          ) : connectionStatus === 'connecting' ? (
            <div className="flex items-center gap-1.5 text-sm" style={{ color: 'var(--color-warning)' }}>
              <RefreshCw size={16} className="animate-spin" />
              <span>Connexion...</span>
            </div>
          ) : (
            <button
              onClick={connect}
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
        </div>
      </div>

      {/* Props grid */}
      {connectionStatus === 'connected' && props.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedProps.map((prop) => (
            <PropCard key={prop.propId} prop={prop} />
          ))}
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
  );
}

export default PropsPanel;
