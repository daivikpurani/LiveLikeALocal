import React, { useState, useEffect, useRef } from "react";
import "./App.css"; // Assuming your CSS is in App.css

const Message = ({ content, role, timestamp }) => {
  const formattedTime = new Date(timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className={`message ${role}`}>
      <div className="message-content">{content}</div>
      <div className="message-timestamp">{formattedTime}</div>
    </div>
  );
};

const Sidebar = ({ chats, activeChatId, onSelectChat, onNewChat }) => {
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>Chats</h2>
        <button className="new-chat-button" onClick={onNewChat}>
          New Chat
        </button>
      </div>

      <ul className="chat-list">
        {chats.map((chat) => (
          <li
            key={chat.id}
            className={`chat-item ${chat.id === activeChatId ? "active" : ""}`}
            onClick={() => onSelectChat(chat.id)}
          >
            {chat.title || `Chat ${chat.id}`}
          </li>
        ))}
      </ul>

      <div className="sidebar-profile">
        <div className="profile-avatar">👤</div>
        <div className="profile-name">Your Name</div>
      </div>
    </div>
  );
};

export default function App() {
  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Start a new chat
  const startNewChat = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/chat/start", {
        method: "POST",
      });
      const data = await response.json();
      const newChat = {
        id: data.id || data.chatId,
        title: data.title || `Chat ${data.id || data.chatId}`,
      };
      setChats((prevChats) => [...prevChats, newChat]);
      setActiveChatId(newChat.id);
      setMessages([]);
    } catch (error) {
      console.error("Error starting new chat:", error);
    }
  };

  // Load chat history
  const loadChatHistory = async (chatId) => {
    try {
      const response = await fetch(
        `http://localhost:8000/api/chat/${chatId}/history`
      );
      const data = await response.json();
      // Ensure data is an array
      const history = Array.isArray(data)
        ? data
        : Array.isArray(data.history)
        ? data.history
        : [];
      setMessages(history);
    } catch (error) {
      console.error("Error loading chat history:", error);
      setMessages([]);
    }
  };

  // Handle chat selection
  const handleSelectChat = (chatId) => {
    setActiveChatId(chatId);
    loadChatHistory(chatId);
  };

  // Send message
  const handleSendMessage = async () => {
    if (!inputText.trim() || !activeChatId) return;

    const userMessage = {
      content: inputText,
      role: "user",
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:8000/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: inputText,
          chatId: activeChatId,
        }),
      });

      const data = await response.json();

      const assistantMessage = {
        content: data.response || data.message || "No response received",
        role: "assistant",
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage = {
        content:
          "Sorry, there was an error processing your message. Please try again.",
        role: "assistant",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Start a new chat when the app loads
  useEffect(() => {
    startNewChat();
  }, []);

  return (
    <div className="app">
      <Sidebar
        chats={chats}
        activeChatId={activeChatId}
        onSelectChat={handleSelectChat}
        onNewChat={startNewChat}
      />
      <div className="chat-container">
        <div className="chat-header">
          <h1>
            {chats.find((chat) => chat.id === activeChatId)?.title ||
              "New Chat"}
          </h1>
        </div>
        <div className="messages-container">
          {Array.isArray(messages) &&
            messages.map((message, index) => (
              <Message
                key={index}
                content={message.content}
                role={message.role}
                timestamp={message.timestamp}
              />
            ))}
          {isLoading && (
            <div className="message assistant">
              <div className="message-content">
                <div className="typing">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        <div className="input-container">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={isLoading || !inputText.trim()}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
