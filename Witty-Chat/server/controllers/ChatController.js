module.exports = (io) => {
  const users = {};
  const messages = [];
  const typingUsers = {};

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on('user_join', (username) => {
      users[socket.id] = { username, id: socket.id };
      io.emit('user_list', Object.values(users));
      io.emit('user_joined', { username, id: socket.id });
    });

    socket.on('send_message', (message) => {
      const messageData = {
        id: Date.now(),
        sender: users[socket.id]?.username || 'Anonymous',
        senderId: socket.id,
        message,
        timestamp: new Date().toISOString(),
      };
      
      messages.push(messageData);
      io.emit('receive_message', messageData);
    });

    socket.on('typing', (isTyping) => {
      if (users[socket.id]) {
        if (isTyping) {
          typingUsers[socket.id] = users[socket.id].username;
        } else {
          delete typingUsers[socket.id];
        }
        io.emit('typing_users', Object.values(typingUsers));
      }
    });

    socket.on('disconnect', () => {
      if (users[socket.id]) {
        io.emit('user_left', { username: users[socket.id].username, id: socket.id });
        delete users[socket.id];
        delete typingUsers[socket.id];
        io.emit('user_list', Object.values(users));
        io.emit('typing_users', Object.values(typingUsers));
      }
    });
  });
};