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

    console.log(socket.id + ' connected');

    socket.on('connectUser', data => {
        const user = JSON.parse(data);
        user.isOnline = true;
        console.log(user.id + ' join');
        socket.userId = user.id;
        socket.userName = user.name;
        socket.userSurname = user.surname;
        socket.join(user.id);
        const index = users.findIndex(element => element.id == user.id);
        if (index != -1) {
            users[index] = user;
        } else {
            users.push(user);
        }
        // const socketIds = Object.keys(io.engine.clients);
        // for (let index = 0; index < socketIds.length; index++) {
        //     const element = socketIds[index];
        //     const iterableSocket = io.sockets[element];
        //     users.push({
        //         id: iterableSocket.userId,
        //         name: iterableSocket.userName,
        //         surname: iterableSocket.userSurname,
        //     });
        // }

        socket.emit('users', users);
        socket.broadcast.emit("newUser", user);
    });

    socket.on('newMessage', message => {
        console.log(message);
        io.to(message['receiver_id']).emit('newMessage', message);
    });

    socket.on('messageReceived', message => {
        console.log(message['sender_id']);
        io.to(message['sender_id']).emit('messageReceived', message);
    });

    socket.on('typing', message => {
        io.to(message["receiver_id"]).emit('typing', message);
    });

    socket.on('messageRead', message => {
        console.log(message['sender_id']);
        io.to(message['sender_id']).emit('messageRead', message);
    });

    socket.on('disconnect', () => {
        console.log(socket.userId + ' disconnected');
        const index = users.findIndex(element => element.id == socket.userId);
        if (index != -1) {
            users[index].isOnline = false;
        }
        io.emit('userDisconnect', socket.userId);
    });
});

server.listen(PORT, () => console.log("Server running on port " + PORT));