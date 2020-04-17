const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

const PORT = (process.env.PORT || 4000);

io.of('/chat')
    .on('connection', function(socket) {
      console.log('Connected to /chat');

      socket.on('join', function(data) {
        console.log('Server joined room: ' + data.roomId);
        socket.join(data.roomId);
      });

      socket.on('message', function(data) {
        console.log('received message: ' + data.payload);
        const room = data.roomId;
        socket.broadcast.to(room).emit('message', data.payload);
      });
    });

http.listen(PORT, function() {
  console.log('listening on ' + PORT);
});
