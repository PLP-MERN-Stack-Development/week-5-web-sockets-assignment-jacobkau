// socket.js - Socket.io client setup

import { io } from "socket.io-client";
import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import notificationSound from "../assets/notification.mp3";
// Socket.io connection URL
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

// Create socket instance
export const socket = io(SOCKET_URL, {
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  randomizationFactor: 0.5
});

// Custom hook for using socket.io
export const useSocket = () => {  
  const [activeChat] = useState(null);
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [lastMessage, setLastMessage] = useState(null);
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
const [isLoadingMessages, setIsLoadingMessages] = useState(false);

const loadMoreMessages = async (offset = 0, limit = 20) => {
  if (!hasMoreMessages || isLoadingMessages) return;
  
  setIsLoadingMessages(true);
  try {
    const response = await fetch(
      `${SOCKET_URL}/api/messages?offset=${offset}&limit=${limit}&isPrivate=${
        activeChat ? 'true' : 'false'
      }&userId=${activeChat}&currentUser=${socket.id}`
    );
    const data = await response.json();
    
    setMessages(prev => [...data.messages, ...prev]);
    setHasMoreMessages(data.hasMore);
  } catch (error) {
    console.error('Error loading messages:', error);
  } finally {
    setIsLoadingMessages(false);
  }
};

  // Connect to socket server
  const connect = (username) => {
    socket.connect();
    if (username) {
      socket.emit("user_join", username);
    }
  };

  const showNotification = (title, options) => {
    // Check if browser supports notifications
    if (!("Notification" in window)) {
      console.log("This browser does not support notifications");
      return;
    }

    // Check if permission is already granted
    if (Notification.permission === "granted") {
      new Notification(title, options);
    }
    // Otherwise, ask for permission
    else if (Notification.permission !== "denied") {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          new Notification(title, options);
        }
      });
    }
  };

  // Disconnect from socket server
  const disconnect = () => {
    socket.disconnect();
  };

  // Send a message
  const sendMessage = (message) => {
    socket.emit("send_message", { message });
  };

const sendPrivateMessage = (recipientId, content) => {
  return new Promise((resolve, reject) => {
    if (!socket.connected) {
      console.error('Socket not connected!');
      reject('Socket not connected');
      return;
    }

    const messageData = {
      to: recipientId,
      message: content,
      sender: user?.username || 'Anonymous',
      timestamp: new Date().toISOString(),
      isPrivate: true // ✅ THIS IS REQUIRED!
    };

    socket.emit('private_message', messageData, (ack) => {
      if (ack?.status === 'delivered') {
        resolve(ack);
      } else {
        reject('Delivery failed');
      }
    });
  });
};


  // Set typing status
  const setTyping = (isTyping) => {
    socket.emit("typing", isTyping);
  };


  useEffect(() => {
  const onReconnectAttempt = (attempt) => {
    console.log(`Reconnection attempt ${attempt}`);
  };

  const onReconnectFailed = () => {
    console.log('Reconnection failed');
  };

  socket.on('reconnect_attempt', onReconnectAttempt);
  socket.on('reconnect_failed', onReconnectFailed);

  return () => {
    socket.off('reconnect_attempt', onReconnectAttempt);
    socket.off('reconnect_failed', onReconnectFailed);
  };
}, []);

  // Socket event listeners
  useEffect(() => {
    // Connection events
    const onConnect = () => {
      setIsConnected(true);
    };

    

    const onDisconnect = () => {
      setIsConnected(false);
    };

    const onReceiveMessage = (message) => {
      setLastMessage(message);
      setMessages((prev) => [...prev, message]);

      // Notify if message is not from current user and tab is not focused
      if (
        message.senderId !== socket.id &&
        document.visibilityState !== "visible"
      ) {
        const audio = new Audio(notificationSound);
        audio.play().catch((e) => console.log("Audio play failed:", e));

        showNotification(`New message from ${message.sender}`, {
          body: message.message,
          icon: "/favicon.ico",
        });
      }
    };

    const onPrivateMessage = (message) => {
      console.log("Received private message client-side:", message);
      setLastMessage(message);
      setMessages((prev) => [...prev, message]);

      // Notify if message is not from current user and tab is not focused
      if (
        message.senderId !== socket.id &&
        document.visibilityState !== "visible"
      ) {
        const audio = new Audio(notificationSound);
        audio.play().catch((e) => console.log("Audio play failed:", e));

        showNotification(`New private message from ${message.sender}`, {
          body: message.message,
          icon: "/favicon.ico",
        });
      }
    };

    // User events
    const onUserList = (userList) => {
      setUsers(userList);
    };

    const onUserJoined = (user) => {
      // You could add a system message here
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          system: true,
          message: `${user.username} joined the chat`,
          timestamp: new Date().toISOString(),
        },
      ]);
    };

    const onUserLeft = (user) => {
      // You could add a system message here
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          system: true,
          message: `${user.username} left the chat`,
          timestamp: new Date().toISOString(),
        },
      ]);
    };

    // Typing events
    const onTypingUsers = (users) => {
      setTypingUsers(users);
    };

    // Register event listeners
    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("receive_message", onReceiveMessage);
    socket.on("private_message", onPrivateMessage);
    socket.on("user_list", onUserList);
    socket.on("user_joined", onUserJoined);
    socket.on("user_left", onUserLeft);
    socket.on("typing_users", onTypingUsers);

    // Clean up event listeners
    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("receive_message", onReceiveMessage);
      socket.off("private_message", onPrivateMessage);
      socket.off("user_list", onUserList);
      socket.off("user_joined", onUserJoined);
      socket.off("user_left", onUserLeft);
      socket.off("typing_users", onTypingUsers);
    };
  }, []);

  return {
    socket,
    isConnected,
    lastMessage,
    messages,
    users,
    typingUsers,
    connect,
    disconnect,
    sendMessage,
    sendPrivateMessage,
    setTyping,
      loadMoreMessages,
  hasMoreMessages,
  isLoadingMessages
  };
};

export default socket;
