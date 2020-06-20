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



io.sockets.on('connection', function (socket) {

    socket.on('username', function (username) {
        socket.username = username;
        io.emit('is_online', '🔵 <i>' + socket.username + ' join the chat..</i>');
    });

    socket.on('join_chat', (chatroomName, username) => {
        console.log(chatroomName);

        socket.username = username;
        socket.chatroomName = chatroomName;

        socket.join(chatroomName)
        io.sockets.in(socket.chatroomName).emit('is_online', '🔵 <i>' + socket.username + ' joined the chatroom:' + socket.chatroomName + '.</i>');

    });

    socket.on('disconnect', function (username) {
        var room = io.sockets.adapter.rooms[socket.chatroomName];
        length = room === undefined ? 0 : room.length;
        io.sockets.in(socket.chatroomName).emit('user left', {
            username: socket.username,
            numUsers: length
        });
    })

    socket.on('chat_message', function (message) {

        console.log(socket.chatroomName + " > " + socket.username + " > " + message);

        io.sockets.in(socket.chatroomName).emit('chat_message', '<strong>' + socket.username + '</strong>: ' + message);

    });

    socket.on('new message', function (message) {

        console.log(socket.chatroomName + " > " + socket.username + " > " + message);

        io.sockets.in(socket.chatroomName).emit('new message', {
            username: socket.username,
            message: message
        });

    });

    // when the client emits 'typing', we broadcast it to others
    socket.on('typing', () => {
        io.sockets.in(socket.chatroomName).emit('typing', {
            username: socket.username
        });
    });

    // when the client emits 'stop typing', we broadcast it to others
    socket.on('stop typing', () => {
        io.sockets.in(socket.chatroomName).emit('stop typing', {
            username: socket.username
        });
    });

    socket.on('join chat', (chatroomName, username) => {
        socket.username = username;
        socket.chatroomName = chatroomName;

        socket.join(chatroomName)

        var room = io.sockets.adapter.rooms[chatroomName];
        length = room === undefined ? 0 : room.length;


        console.log(length);
        console.log("join chat > " + socket.chatroomName + " > " + socket.username);

        io.sockets.in(socket.chatroomName).emit('user joined', {
            username: socket.username,
            numUsers: length
        });
    });

});

const server = http.listen(process.env.PORT || 8080, function () {
    console.log('listening on *:8080');
});

