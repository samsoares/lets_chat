const express = require('express');
const app = express();
const path = require('path');
const http = require('http').createServer(app);
const io = require('socket.io')(http);

const PORT = (process.env.PORT || 4000);

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'client/build')));

io.of('/chat')
    .on('connection', function(socket) {
      console.log('Connected to /chat');

      socket.on('join', function(data) {
        console.log('Server joined room: ' + data.roomId);
        socket.join(data.roomId);
      });
      this.chatMsgId = 1;
      socket.on('message', (data) => {
        socket.broadcast.to(data.roomId).emit('message', {id: this.chatMsgId, roomId: data.roomId, senderId: data.senderId, text: data.text});
        this.chatMsgId++;
      });
    });

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname+'/client/build/index.html'));
});

http.listen(PORT, function() {
  console.log('listening on ' + PORT);
});
