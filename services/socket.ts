import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const connectSocket = (token: string) => {
  if (socket) return socket;

  // Connect to backend port 8080
  socket = io('http://localhost:8080', {
    auth: { token }, // Backend expects this in handleShake.auth
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