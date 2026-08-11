const { Server } = require('socket.io');
require('dotenv').config();

let io = null;

const initSocket = httpServer => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      credentials: true,
    },
  });

  io.on('connection', socket => {
    const { userId, role } = socket.handshake.query || {};

    if (userId) {
      socket.join(`user:${userId}`);
      if (role) socket.join(`role:${role}`);
    }

    socket.on('disconnect', () => {});
  });

  return io;
};

const getIO = () => io;

const emitToUser = (userId, event, payload) => {
  if (!io || !userId) return;
  io.to(`user:${userId}`).emit(event, payload);
};

const emitToRole = (role, event, payload) => {
  if (!io || !role) return;
  io.to(`role:${role}`).emit(event, payload);
};

module.exports = { initSocket, getIO, emitToUser, emitToRole };
