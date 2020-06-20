const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

app.engine('html', require('ejs').renderFile)
app.set('view engine', 'html')

app.get('/', function (req, res) {
    res.render('index.html');
});

app.use(express.static('views'))

app.get('*', function (req, res) {

});



io.sockets.on('connection', function (client) {

    client.on('username', function (username) {
        client.username = username;
        io.emit('is_online', '🔵 <i>' + client.username + ' join the chat..</i>');
    });

    client.on('join_chat', (chatroomName, username) => {
        console.log(chatroomName);

        client.username = username;
        client.chatroomName = chatroomName;

        client.join(chatroomName)
        io.sockets.in(client.chatroomName).emit('is_online', '🔵 <i>' + client.username + ' joined the chatroom:' + client.chatroomName + '.</i>');

    });

    client.on('disconnect', function (username) {
        var room = io.sockets.adapter.rooms[client.chatroomName];

        io.sockets.in(client.chatroomName).emit('user left', {
            username: client.username,
            numUsers: room.length
        });
    })

    client.on('chat_message', function (message) {

        console.log(client.chatroomName + " > " + client.username + " > " + message);

        io.sockets.in(client.chatroomName).emit('chat_message', '<strong>' + client.username + '</strong>: ' + message);

    });

    client.on('new message', function (message) {

        console.log(client.chatroomName + " > " + client.username + " > " + message);

        io.sockets.in(client.chatroomName).emit('new message', {
            username: client.username,
            message: message
        });

    });

    // when the client emits 'typing', we broadcast it to others
    client.on('typing', () => {
        io.sockets.in(client.chatroomName).emit('typing', {
            username: client.username
        });
    });

    // when the client emits 'stop typing', we broadcast it to others
    client.on('stop typing', () => {
        io.sockets.in(client.chatroomName).emit('stop typing', {
            username: client.username
        });
    });

    client.on('join chat', (chatroomName, username) => {
        client.username = username;
        client.chatroomName = chatroomName;

        client.join(chatroomName)

        var room = io.sockets.adapter.rooms[chatroomName];
        room.length;

        console.log(room.length);
        console.log("join chat > " + client.chatroomName + " > " + client.username);

        io.sockets.in(client.chatroomName).emit('user joined', {
            username: client.username,
            numUsers: room.length
        });
    });

});

const server = http.listen(process.env.PORT || 8080, function () {
    console.log('listening on *:8080');
});

