import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const connectSocket = (token: string) => {
  if (socket) return socket;

  // FIX: Use environment variable, fallback to localhost only if missing
  const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:8080';

  socket = io(SOCKET_URL, {
    auth: { token }, 
    transports: ['websocket'],
  });

  socket.on('connect', () => {
    console.log('Connected to socket:', socket?.id);
  });

  socket.on('connect_error', (err) => {
    console.error('Socket connection error:', err);
  });

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};