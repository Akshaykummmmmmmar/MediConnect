import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

let socket = null;

export const getSocket = () => {
  if (!socket) {
    const userId = localStorage.getItem('userId');
    const role = localStorage.getItem('role');
    socket = io(SOCKET_URL, {
      query: { userId, role },
      transports: ['websocket', 'polling'],
    });
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
