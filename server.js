const express = require('express');
const app = express();
const path = require('path');
const http = require('http').createServer(app);
const io = require('socket.io')(http);

const PORT = (process.env.PORT || 4000);

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'client/build')));
let counter = 1;
io.of('/chat')
    .on('connection', function(socket) {
      console.log('Connected to /chat');

      socket.on('join', function(data) {
        console.log('Server joined room: ' + data.roomId);
        socket.join(data.roomId);
      });
      
      socket.on('message', (data) => {
        data["id"] = counter;
        socket.broadcast.to(data.roomId).emit('message', data);
        counter++;
        console.log(data);
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
