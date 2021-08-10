const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const app = express();

const PORT = process.env.PORT || 3050;

const server = http.createServer(app);

const io = socketio(server);

app.get('/', (req, res) => {
    res.send("Server running");
});

// run when client connects
io.on('connection', socket => {

    console.log(socket.id + ' connected');

    socket.on('connectUser', user => {
        // const user = JSON.parse(data);
        console.log(user.id + ' join');
        socket.userId = user.id;
        socket.userName = user.userName;
        socket.userSurname = user.userSurname;
        socket.join(user.id);

        const users = [];
        const socketIds = Object.keys(io.engine.clients);
        for (let index = 0; index < socketIds.length; index++) {
            const element = socketIds[index];
            const iterableSocket = io.sockets.connected[element];
            users.push({
                socketId: iterableSocket.id,
                userId: iterableSocket.userId,
                userName: iterableSocket.userName,
                userSurname: iterableSocket.userSurname,
            });
        }

        socket.emit('users', users);
    });

    socket.on('newMessage', message => {
        io.to(message['receiver_id']).emit('newMessage', message);
    });

    socket.on('disconnect', () => {
        console.log(socket.userId + ' disconnected');
        io.emit('userDisconnect', socket.userId);
    });
});

server.listen(PORT, () => console.log("Server running on port " + PORT));