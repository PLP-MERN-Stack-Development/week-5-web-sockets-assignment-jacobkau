import { useState, useEffect } from "react";
import { useSocket } from "../socket/socket";
import { useAuth } from "../hooks/useAuth";

export default function ChatPage() {
  const {
    socket,
    users,
    messages,
    sendMessage,
    setTyping,
    typingUsers,
    isConnected,
    sendPrivateMessage,
  } = useSocket();

  const { user } = useAuth();
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [message, setMessage] = useState("");
  const [showOnlineUsers, setShowOnlineUsers] = useState(false);
  const [activeChat, setActiveChat] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  // Filter messages based on active chat
 const currentMessages = activeChat
  ? messages.filter(
      (msg) =>
        msg.isPrivate &&
        ((msg.senderId === activeChat && msg.recipientId === socket.id) ||
         (msg.senderId === socket.id && msg.recipientId === activeChat))
    )
  : messages.filter((msg) => !msg.isPrivate);

  const filteredMessages = currentMessages.filter((msg) =>
    msg.message.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const minSwipeDistance = 50;

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => setTouchEnd(e.targetTouches[0].clientX);

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && sidebarOpen) {
      setSidebarOpen(false);
    } else if (isRightSwipe && !sidebarOpen) {
      setSidebarOpen(true);
    }
  };

  // Track unread messages
  useEffect(() => {
    const counts = {};
     users.forEach((u) => {
    if (u.id !== socket.id) {
      counts[u.id] = messages.filter(
        (m) => m.isPrivate &&
              m.senderId === u.id &&
              m.recipientId === socket.id &&
              !m.readAt
      ).length;
    }
  });
   
    counts["public"] = messages.filter(
    (m) => !m.isPrivate && 
          m.senderId !== socket.id && 
          !m.readAt
  ).length;
    setUnreadCounts(counts);
  }, [messages, users, socket.id]);

  // Debugging effect
  useEffect(() => {
    console.log("All messages:", messages);
    if (activeChat) {
      console.log(
        "Messages for current chat:",
        messages.filter(
          (msg) =>
            msg.isPrivate &&
            ((msg.senderId === activeChat && msg.recipientId === socket.id) ||
              (msg.senderId === socket.id && msg.recipientId === activeChat))
        )
      );
    }
  }, [messages, activeChat, socket.id]);

  if (!isConnected || !user) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center p-6 bg-white rounded-lg shadow">
          <h2 className="text-xl font-bold mb-2">
            {!isConnected ? "Connecting..." : "Please login"}
          </h2>
          <p className="text-gray-600">
            {!isConnected
              ? "Establishing connection..."
              : "You need to login to chat"}
          </p>
        </div>
      </div>
    );
  }

  // Get current chat user
  const chatUser = activeChat ? users.find((u) => u.id === activeChat) : null;

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    try {
      if (activeChat) {
        await sendPrivateMessage(activeChat, message);
      } else {
        sendMessage(message);
      }
      setMessage("");
      setTyping(false);
    } catch (error) {
      console.error("Error sending message:", error);
      // Show error to user
    }
  };

  return (
    <div
      className="flex h-screen bg-gray-100 overflow-hidden"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Sidebar - Contacts List (Fixed) */}
      <div
        className={`${sidebarOpen ? "translate-x-0" : "-translate-x-full"} 
          md:translate-x-0 transform transition-transform duration-200 ease-in-out
          fixed md:static z-10 w-64 h-full bg-white border-r flex flex-col`}
      >
        <div className="p-3 bg-gray-50 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold">Chats</h2>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden text-gray-500"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              to
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>

        {/* Public Chat Button */}
        <div
          className={`p-3 border-b flex items-center cursor-pointer hover:bg-gray-50 ${
            !activeChat ? "bg-blue-50" : ""
          }`}
          onClick={() => {
            setActiveChat(null);
            setSidebarOpen(false);
            setUnreadCounts((prev) => ({ ...prev, public: 0 }));
          }}
        >
          <div className="bg-green-500 text-white rounded-full h-10 w-10 flex items-center justify-center mr-3">
            <span>#</span>
          </div>
          <div className="flex-1">
            <p className="font-medium">Public Room</p>
            {unreadCounts["public"] > 0 && (
              <span className="bg-green-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center ml-1">
                {unreadCounts["public"]}
              </span>
            )}
            <p className="text-xs text-gray-500">
              {messages.filter((m) => !m.isPrivate).length} messages
            </p>
          </div>
        </div>

        {/* Private Contacts */}
        <div className="flex-1 overflow-y-auto">
          {users
            .filter((u) => u.id !== socket.id)
            .map((user) => (
              <div
                key={user.id}
                className={`p-3 flex items-center cursor-pointer hover:bg-gray-50 ${
                  activeChat === user.id ? "bg-blue-50" : ""
                }`}
                onClick={() => {
                  setActiveChat(user.id);
                  setSidebarOpen(false);
                  setUnreadCounts((prev) => ({ ...prev, [user.id]: 0 }));
                }}
              >
                <div className="bg-purple-500 text-white rounded-full h-10 w-10 flex items-center justify-center mr-3">
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <p className="font-medium truncate">{user.username}</p>
                    <span className="text-xs text-gray-500 whitespace-nowrap">
                      {new Date().toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-gray-500 truncate">
                      {typingUsers.includes(user.username)
                        ? "typing..."
                        : messages.find(
                            (m) =>
                              m.isPrivate &&
                              ((m.senderId === user.id &&
                                m.recipientId === socket.id) ||
                                (m.senderId === socket.id &&
                                  m.recipientId === user.id))
                          )?.message || "No messages yet"}
                    </p>
                    {unreadCounts[user.id] > 0 && (
                      <span className="bg-green-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {unreadCounts[user.id]}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          <button
            onClick={() => setShowOnlineUsers((prev) => !prev)}
            className="mx-3 my-2 px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition"
          >
            {showOnlineUsers ? "Hide Online Users" : "Show Online Users"}
          </button>
          {showOnlineUsers && (
            <div className="px-3 py-2 text-sm text-gray-700">
              <p className="mb-2 font-semibold">Online Users:</p>
              <ul className="space-y-1">
                {users
                  .filter((u) => u.id !== socket.id) // exclude yourself
                  .map((user) => (
                    <li key={user.id} className="flex items-center gap-2">
                      <span className="h-2 w-2 bg-green-500 rounded-full inline-block"></span>
                      {user.username}
                    </li>
                  ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div
        className={`flex-1 flex flex-col h-full ${
          !sidebarOpen ? "ml-0" : "md:ml-64"
        }`}
      >
        {/* Chat Header */}
        <div className="p-3 border-b flex items-center bg-gray-50">
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden mr-2 text-gray-500"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </button>

          {activeChat ? (
            <>
              <div className="bg-purple-500 text-white rounded-full h-10 w-10 flex items-center justify-center mr-3">
                {chatUser?.username.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <p className="font-medium">{chatUser?.username}</p>
                <p className="text-xs text-gray-500">
                  {typingUsers.includes(chatUser?.username)
                    ? "typing..."
                    : "online"}
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="bg-green-500 text-white rounded-full h-10 w-10 flex items-center justify-center mr-3">
                #
              </div>
              <div className="flex-1">
                <p className="font-medium">Public Room</p>
                <p className="text-xs text-gray-500">
                  {users.length} participants
                </p>
              </div>
            </>
          )}

          <div className="ml-auto relative">
            <input
              type="text"
              placeholder="Search messages..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearching(e.target.value.length > 0);
              }}
              className="border rounded-lg px-3 py-1 text-sm w-40 focus:outline-none focus:ring-1 focus:ring-green-500"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setIsSearching(false);
                }}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-100">
          {isSearching && (
            <div className="mb-4 text-sm text-gray-500">
              {filteredMessages.length > 0
                ? `Showing ${filteredMessages.length} results for "${searchQuery}"`
                : `No results found for "${searchQuery}"`}
            </div>
          )}

          {(isSearching ? filteredMessages : currentMessages).length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500">
                {activeChat
                  ? `Send a message to ${chatUser?.username}`
                  : "Say hello to everyone!"}
              </p>
            </div>
          ) : (
            (isSearching ? filteredMessages : currentMessages).map((msg) => {
              const isCurrentUser = msg.senderId === socket.id;
              return (
                <div
                  key={msg.id}
                  className={`mb-4 flex ${
                    isCurrentUser ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      isCurrentUser
                        ? "bg-green-500 text-white rounded-tr-none"
                        : "bg-white border border-gray-200 rounded-tl-none"
                    }`}
                  >
                    {!isCurrentUser && (
                      <p className="font-semibold text-sm">{msg.sender}</p>
                    )}
                    <p>{msg.message}</p>
                    <p
                      className={`text-xs opacity-75 ${
                        isCurrentUser ? "text-right" : "text-left"
                      }`}
                    >
                      {new Date(msg.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                      {isCurrentUser && msg.readBy?.includes(activeChat) && (
                        <span className="ml-1">✓✓</span>
                      )}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Message Input */}
        <div className="p-3 border-t bg-gray-50">
          {typingUsers.includes(chatUser?.username) && (
            <div className="text-xs text-gray-500 mb-1">
              {chatUser?.username} is typing...
            </div>
          )}
          <form onSubmit={handleSendMessage} className="flex items-center">
            <input
              type="text"
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                setTyping(e.target.value.length > 0);
              }}
              className="flex-1 border border-gray-300 rounded-l-lg p-2 focus:outline-none focus:ring-1 focus:ring-green-500"
              placeholder={`Type a message ${
                activeChat ? `to ${chatUser?.username}` : ""
              }`}
            />
            <button
              type="submit"
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-r-lg transition-colors"
              disabled={!message.trim()}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
