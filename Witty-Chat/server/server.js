// server.js - Main server file for Socket.io chat application

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Store connected users and messages
const users = {};
const messages = [];
const typingUsers = {};

// Socket.io connection handler
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Handle user joining
  socket.on('user_join', (username) => {
    users[socket.id] = { username, id: socket.id };
    io.emit('user_list', Object.values(users));
    io.emit('user_joined', { username, id: socket.id });
    console.log(`${username} joined the chat`);
  });

  // Handle chat messages
  socket.on('send_message', (messageData) => {
    const message = {
      ...messageData,
      id: Date.now(),
      sender: users[socket.id]?.username || 'Anonymous',
      senderId: socket.id,
      timestamp: new Date().toISOString(),
    };
    
    messages.push(message);
    
    // Limit stored messages to prevent memory issues
    if (messages.length > 100) {
      messages.shift();
    }
    
    io.emit('receive_message', message);
  });

  // Handle typing indicator
  socket.on('typing', (isTyping) => {
    if (users[socket.id]) {
      const username = users[socket.id].username;
      
      if (isTyping) {
        typingUsers[socket.id] = username;
      } else {
        delete typingUsers[socket.id];
      }
      
      io.emit('typing_users', Object.values(typingUsers));
    }
  });
socket.on('private_message', ({ to, message }, ack) => {
  const messageData = {
    id: Date.now(),
    sender: users[socket.id]?.username || 'Anonymous',
    senderId: socket.id,
    recipientId: to,
    message,
    timestamp: new Date().toISOString(),
    isPrivate: true,
    readAt: null
  };

  socket.to(to).emit('private_message', messageData);
  socket.emit('private_message', messageData);
  
  messages.push(messageData);
  
  if (ack) {
    ack({ status: 'delivered', messageId: messageData.id });
  }
});

  // Handle disconnection
  socket.on('disconnect', () => {
    if (users[socket.id]) {
      const { username } = users[socket.id];
      io.emit('user_left', { username, id: socket.id });
      console.log(`${username} left the chat`);
    }
    
    delete users[socket.id];
    delete typingUsers[socket.id];
    
    io.emit('user_list', Object.values(users));
    io.emit('typing_users', Object.values(typingUsers));
  });
});

// server/server.js
app.get('/api/messages', (req, res) => {
  const { offset = 0, limit = 20, isPrivate = false, userId = null } = req.query;
  
  let filteredMessages = messages;
  
  if (isPrivate === 'true' && userId) {
    filteredMessages = messages.filter(msg => 
      (msg.senderId === userId && msg.recipientId === req.query.currentUser) ||
      (msg.senderId === req.query.currentUser && msg.recipientId === userId)
    );
  } else if (isPrivate === 'false') {
    filteredMessages = messages.filter(msg => !msg.isPrivate);
  }
  
  const paginatedMessages = filteredMessages
    .slice(parseInt(offset), parseInt(offset) + parseInt(limit))
    .reverse();
    
  res.json({
    messages: paginatedMessages,
    hasMore: filteredMessages.length > parseInt(offset) + parseInt(limit)
  });
});


app.get('/api/users', (req, res) => {
  res.json(Object.values(users));
});

// Root route
app.get('/', (req, res) => {
  res.send('Socket.io Chat Server is running');
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = { app, server, io }; 