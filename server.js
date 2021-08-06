const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const app = express();

const PORT = process.env.PORT || 3050;

const server = http.createServer(app);

const io = socketio(server);

const userSocketIds = {};

const users = [];

app.get('/', (req, res)=>{
    res.send("Server running");
});

// run when client connects
io.on('connection', socket => {
    console.log(socket.id + ' connected');
    const user = JSON.parse(socket.request.headers['user']);
    userSocketIds[user.id] = socket.id;
    users.push(user);
    io.emit('users', users);

    socket.on('newMessage', message => {
        const socketId = userSocketIds[message['receiver_id']];
        console.log(socketId);
        io.to(socketId).emit('newMessage', message);
    });

    socket.on('disconnect', () => {
        console.log('a user disconnected');
        const userId = Object.keys(userSocketIds).find(key => userSocketIds[key] === socket.id);
        delete userSocketIds[userId];

        const index = users.findIndex(user => user.id == userId);
        if (index !== -1)
            users.splice(index, 1);
        io.emit('users', users);
    });
});

server.listen(PORT, () => console.log("Server running on port " + PORT));