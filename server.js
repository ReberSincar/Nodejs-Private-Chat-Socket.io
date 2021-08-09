const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const app = express();

const PORT = process.env.PORT || 3050;

const server = http.createServer(app);

const io = socketio(server);

const users = [];

app.get('/', (req, res) => {
    res.send("Server running");
});

// run when client connects
io.on('connection', socket => {
    const user = JSON.parse(socket.request.headers['user']);
    console.log(user.id + ' connected');
    socket.userId = user.id;
    socket.join(user.id);
    users.push(user);
    io.emit('users', users);

    socket.on('newMessage', message => {
        io.to(message['receiver_id']).emit('newMessage', message);
    });

    socket.on('disconnect', () => {
        const index = users.findIndex(user => user.id == socket.userId);
        if (index !== -1)
            users.splice(index, 1);
        io.emit('users', users);
    });
});

server.listen(PORT, () => console.log("Server running on port " + PORT));