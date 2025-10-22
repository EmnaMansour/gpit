"use strict";
const socketIo = require('socket.io');
const configureWebSocket = (server) => {
    const io = socketIo(server, {
        cors: {
            origin: ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:5174'],
            methods: ['GET', 'POST']
        }
    });
    io.on('connection', (socket) => {
        console.log('🔌 Nouveau client connecté:', socket.id);
        socket.on('join_room', (room) => {
            socket.join(room);
            console.log(`👥 Client ${socket.id} a rejoint la room: ${room}`);
        });
        socket.on('leave_room', (room) => {
            socket.leave(room);
            console.log(`👋 Client ${socket.id} a quitté la room: ${room}`);
        });
        socket.on('disconnect', () => {
            console.log('🔌 Client déconnecté:', socket.id);
        });
    });
    return io;
};
module.exports = configureWebSocket;
