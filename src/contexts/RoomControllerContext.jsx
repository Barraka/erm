import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';

const RoomControllerContext = createContext(null);

// WebSocket URL - configurable via env or auto-detect
const WS_URL = import.meta.env.VITE_WS_URL || `ws://${window.location.hostname}:3001`;

// Reconnection settings
const RECONNECT_DELAY_MS = 2000;
const MAX_RECONNECT_DELAY_MS = 30000;

export function RoomControllerProvider({ children }) {
  // Connection state
  const [connectionStatus, setConnectionStatus] = useState('disconnected'); // 'disconnected' | 'connecting' | 'connected'
  const [roomInfo, setRoomInfo] = useState(null);
  const [serverVersion, setServerVersion] = useState(null);

  // Game state from Room Controller
  const [props, setProps] = useState([]);
  const [session, setSession] = useState({
    active: false,
    startedAt: null,
    endedAt: null,
    pausedAt: null,
    totalPausedMs: 0,
    hintsGiven: 0
  });

  // Refs
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const reconnectDelayRef = useRef(RECONNECT_DELAY_MS);
  const pendingAcksRef = useRef(new Map()); // requestId -> { resolve, reject, timeout }

  // Generate unique request ID
  const generateRequestId = () => `req-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  // Send message to Room Controller
  const sendMessage = useCallback((message) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
      return true;
    }
    return false;
  }, []);

  // Send command and wait for ack
  const sendCommand = useCallback((type, payload) => {
    return new Promise((resolve, reject) => {
      const requestId = generateRequestId();
      const fullPayload = { ...payload, requestId };

      const timeout = setTimeout(() => {
        pendingAcksRef.current.delete(requestId);
        reject(new Error('Command timeout'));
      }, 10000);

      pendingAcksRef.current.set(requestId, { resolve, reject, timeout });

      const sent = sendMessage({
        type,
        timestamp: Date.now(),
        payload: fullPayload
      });

      if (!sent) {
        clearTimeout(timeout);
        pendingAcksRef.current.delete(requestId);
        reject(new Error('Not connected'));
      }
    });
  }, [sendMessage]);

  // Handle incoming messages
  const handleMessage = useCallback((event) => {
    try {
      const message = JSON.parse(event.data);
      const { type, payload } = message;

      switch (type) {
        case 'hello':
          setRoomInfo(payload.room);
          setServerVersion(payload.serverVersion);
          console.log('[WS] Connected to room:', payload.room.name);
          break;

        case 'full_state':
          setProps(payload.props);
          setSession(payload.session);
          console.log('[WS] Received full state:', payload.props.length, 'props');
          break;

        case 'prop_update':
          setProps(prev => prev.map(prop => {
            if (prop.propId === payload.propId) {
              return { ...prop, ...payload.changes };
            }
            return prop;
          }));
          break;

        case 'prop_online':
          setProps(prev => prev.map(prop => {
            if (prop.propId === payload.propId) {
              return { ...prop, online: true };
            }
            return prop;
          }));
          break;

        case 'prop_offline':
          setProps(prev => prev.map(prop => {
            if (prop.propId === payload.propId) {
              return { ...prop, online: false };
            }
            return prop;
          }));
          break;

        case 'session_update':
          setSession(payload);
          break;

        case 'session_ended':
          setSession({
            active: false,
            startedAt: null,
            endedAt: null,
            pausedAt: null,
            totalPausedMs: 0,
            hintsGiven: 0
          });
          console.log('[WS] Session ended:', payload.result);
          break;

        case 'event':
          console.log('[WS] Event:', payload.propId, payload.action);
          // Could dispatch to event log or toast
          break;

        case 'cmd_ack': {
          const pending = pendingAcksRef.current.get(payload.requestId);
          if (pending) {
            clearTimeout(pending.timeout);
            pendingAcksRef.current.delete(payload.requestId);
            if (payload.success) {
              pending.resolve(payload);
            } else {
              pending.reject(new Error(payload.error || 'Command failed'));
            }
          }
          break;
        }

        default:
          console.log('[WS] Unknown message type:', type);
      }
    } catch (err) {
      console.error('[WS] Failed to handle message:', err);
    }
  }, []);

  // Connect to WebSocket
  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    setConnectionStatus('connecting');
    console.log('[WS] Connecting to', WS_URL);

    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      setConnectionStatus('connected');
      reconnectDelayRef.current = RECONNECT_DELAY_MS; // Reset delay on successful connect
      console.log('[WS] Connected');
    };

    ws.onmessage = handleMessage;

    ws.onclose = () => {
      setConnectionStatus('disconnected');
      wsRef.current = null;
      console.log('[WS] Disconnected');

      // Auto-reconnect with exponential backoff
      reconnectTimeoutRef.current = setTimeout(() => {
        reconnectDelayRef.current = Math.min(
          reconnectDelayRef.current * 1.5,
          MAX_RECONNECT_DELAY_MS
        );
        connect();
      }, reconnectDelayRef.current);
    };

    ws.onerror = (err) => {
      console.error('[WS] Error:', err);
    };
  }, [handleMessage]);

  // Disconnect
  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setConnectionStatus('disconnected');
  }, []);

  // Connect on mount
  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);

  // ─────────────────────────────────────────────────────────
  // Commands
  // ─────────────────────────────────────────────────────────

  const forceSolve = useCallback((propId) => {
    return sendCommand('cmd', { command: 'force_solve', propId });
  }, [sendCommand]);

  const resetProp = useCallback((propId) => {
    return sendCommand('cmd', { command: 'reset', propId });
  }, [sendCommand]);

  const triggerSensor = useCallback((propId, sensorId) => {
    return sendCommand('cmd', { command: 'trigger_sensor', propId, sensorId });
  }, [sendCommand]);

  const startSession = useCallback(() => {
    return sendCommand('session_cmd', { command: 'start' });
  }, [sendCommand]);

  const pauseSession = useCallback(() => {
    return sendCommand('session_cmd', { command: 'pause' });
  }, [sendCommand]);

  const resumeSession = useCallback(() => {
    return sendCommand('session_cmd', { command: 'resume' });
  }, [sendCommand]);

  const endSession = useCallback((result, comments = null) => {
    return sendCommand('session_cmd', { command: 'end', result, comments });
  }, [sendCommand]);

  const abortSession = useCallback(() => {
    return sendCommand('session_cmd', { command: 'abort' });
  }, [sendCommand]);

  const notifyHintGiven = useCallback(() => {
    return sendCommand('hint_given', {});
  }, [sendCommand]);

  // ─────────────────────────────────────────────────────────
  // Computed values
  // ─────────────────────────────────────────────────────────

  // Calculate real elapsed time
  const getRealElapsedMs = useCallback(() => {
    if (!session.active || !session.startedAt) return 0;

    const now = Date.now();
    if (session.pausedAt) {
      return session.pausedAt - session.startedAt - session.totalPausedMs;
    }
    return now - session.startedAt - session.totalPausedMs;
  }, [session]);

  const value = {
    // Connection
    connectionStatus,
    roomInfo,
    serverVersion,
    connect,
    disconnect,

    // State
    props,
    session,
    getRealElapsedMs,

    // Prop commands
    forceSolve,
    resetProp,
    triggerSensor,

    // Session commands
    startSession,
    pauseSession,
    resumeSession,
    endSession,
    abortSession,
    notifyHintGiven
  };

  return (
    <RoomControllerContext.Provider value={value}>
      {children}
    </RoomControllerContext.Provider>
  );
}

export function useRoomController() {
  const context = useContext(RoomControllerContext);
  if (!context) {
    throw new Error('useRoomController must be used within a RoomControllerProvider');
  }
  return context;
}
