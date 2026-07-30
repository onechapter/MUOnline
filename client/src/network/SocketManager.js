import { io } from 'socket.io-client';

let socket = null;
let listeners = {};

export function connectSocket(token, characterId) {
  if (socket) {
    socket.disconnect();
  }

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
  socket = io(`${apiUrl}`, {
    auth: { token, characterId },
    transports: ['websocket'],
  });

  if (typeof window !== 'undefined') window.__socket__ = socket;

  socket.on('connect', () => {
    console.log('Connected to game server');
    triggerListeners('connect', {});
  });

  socket.on('disconnect', () => {
    console.log('Disconnected from game server');
    triggerListeners('disconnect', {});
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
    if (socket) socket.off(event, callback);
    listeners[event] = (listeners[event] || []).filter((l) => l !== callback);
  };
}

export function emit(event, data) {
  if (socket) {
    socket.emit(event, data);
  }
}

function triggerListeners(event, data) {
  (listeners[event] || []).forEach((cb) => cb(data));
}