import { io } from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

let socket;

export const initSocket = () => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      transports: ['websocket']
    });

    socket.on('connect', () => console.log('[Socket] connected', socket.id));
    socket.on('disconnect', (reason) => console.warn('[Socket] disconnected', reason));
    socket.on('connect_error', (err) => console.error('[Socket] connect_error', err));
    socket.on('reconnect_attempt', (attempt) => console.log('[Socket] reconnect attempt', attempt));
  }
  return socket;
};

export const getSocket = () => {
  if (!socket) {
    return initSocket();
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

// Emit events
export const emitStartAuction = (playerId) => {
  if (socket) socket.emit('startAuction', { playerId });
};

export const emitPlaceBid = (playerId, teamId, amount) => {
  if (socket) socket.emit('placeBid', { playerId, teamId, amount });
};

export const emitAcceptBid = (playerId, teamId, amount) => {
  if (socket) socket.emit('acceptBid', { playerId, teamId, amount });
};

export const emitRejectBid = (playerId, teamId, amount) => {
  if (socket) socket.emit('rejectBid', { playerId, teamId, amount });
};
