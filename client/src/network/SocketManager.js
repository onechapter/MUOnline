import { io } from 'socket.io-client';

let socket = null;
let listeners = {};
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 10;

export function connectSocket(token, characterId) {
  if (socket) {
    socket.disconnect();
  }

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
  socket = io(`${apiUrl}`, {
    auth: { token, characterId },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: MAX_RECONNECT_ATTEMPTS,
  });

  if (typeof window !== 'undefined') window.__socket__ = socket;

  socket.on('connect', () => {
    console.log('Connected to game server');
    reconnectAttempts = 0;
    triggerListeners('connect', {});
  });

  socket.on('disconnect', (reason) => {
    console.log('Disconnected from game server:', reason);
    triggerListeners('disconnect', { reason });
    if (reason === 'io server disconnect') {
      // Server disconnected us, don't auto-reconnect
    }
  });

  socket.on('reconnect', (attemptNumber) => {
    console.log('Reconnected after', attemptNumber, 'attempts');
    reconnectAttempts = 0;
  });

  socket.on('reconnect_attempt', (attemptNumber) => {
    console.log('Reconnection attempt', attemptNumber);
    reconnectAttempts = attemptNumber;
  });

  socket.on('reconnect_failed', () => {
    console.log('Reconnection failed after', MAX_RECONNECT_ATTEMPTS, 'attempts');
  });

  return socket;
}

export function getSocket() {
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

export function on(event, callback) {
  if (!listeners[event]) listeners[event] = [];
  listeners[event].push(callback);

  if (socket) {
    socket.on(event, callback);
  }

  return () => {
    if (socket) {
      socket.off(event, callback);
    }
    const idx = listeners[event]?.indexOf(callback);
    if (idx !== undefined) listeners[event]?.splice(idx, 1);
  };
}

export function emit(event, data) {
  if (socket && socket.connected) {
    socket.emit(event, data);
  }
}

function triggerListeners(event, data) {
  (listeners[event] || []).forEach(cb => cb(data));
}
