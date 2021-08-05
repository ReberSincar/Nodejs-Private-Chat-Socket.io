const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const app = express();

const PORT = 8080 || process.env.PORT;
const server = http.createServer(app);

const io = socketio(server);

// run when client connects
io.on('connection', socket => {
    console.log('a user connected');
    socket.on('disconnect', () => {
        console.log('a user disconnected');
    });
});

server.listen(PORT, () => console.log("Server running on port " + PORT));