const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

app.get('/', function (req, res) {
    res.render('index.ejs');
});

app.use(express.static('views'))

app.get('*', function (req, res) {
    console.log("re")
});



io.sockets.on('connection', function (client) {
    // console.log(client)

    client.on('username', function (username) {
        client.username = username;
        io.emit('is_online', '🔵 <i>' + client.username + ' join the chat..</i>');
    });

    client.on('new_channel', function (chatroomName, username) {
        console.log(chatroomName);

        client.username = username;
        client.chatroomName = chatroomName;

        client.join(chatroomName)
        console.log(client)
        io.to(chatroomName).emit('hi');

        // socket.username = username;
        // io.emit('is_online', '🔵 <i>' + socket.username + ' join the chat..</i>');
    });

    client.on('join_chat', (chatroomName, username) => {
        console.log(chatroomName);

        client.username = username;
        client.chatroomName = chatroomName;

        client.join(chatroomName)
        io.sockets.in(client.chatroomName).emit('is_online', '🔵 <i>' + client.username + ' joined the chatroom:' + client.chatroomName + '.</i>');
        // io.to(chatroomName).emit('is_online', '🔵 <i>' + client.username + ' joined the chatroom:' + chatroomName + '.</i>');

        // socket.username = username;
        // io.emit('is_online', '🔵 <i>' + client.username + ' join the chat..</i>');
    });

    client.on('disconnect', function (username) {
        io.emit('is_online', '🔴 <i>' + client.username + ' left the chat..</i>');
    })

    client.on('chat_message', function (message) {
        io.sockets.in(client.chatroomName).emit('chat_message', '<strong>' + client.username + '</strong>: ' + message);

        // io.emit('chat_message', '<strong>' + client.username + '</strong>: ' + message);
    });

});

const server = http.listen(8080, function () {
    console.log('listening on *:8080');
});

