import React, { useState } from "react";
import "./App.css"; // Assuming your CSS is in App.css

const Sidebar = ({ chats, activeChatId, onSelectChat }) => {
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>Chats</h2>
      </div>

      <ul className="chat-list">
        {chats.map((chat) => (
          <li
            key={chat.id}
            className={`chat-item ${chat.id === activeChatId ? "active" : ""}`}
            onClick={() => onSelectChat(chat.id)}
          >
            {chat.title}
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
  const [chats, setChats] = useState([
    { id: "1", title: "Chat1" },
    { id: "2", title: "Chat2" },
    { id: "3", title: "Chat3" },
  ]);
  const [activeChatId, setActiveChatId] = useState("1");
  const [inputText, setInputText] = useState("");

  const handleSendClick = async () => {
    if (!inputText.trim()) return;

    try {
      const response = await fetch("http://localhost:8000/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: inputText }),
      });

      const data = await response.json();
      console.log("API Response:", data); // You can do something with the response here
    } catch (error) {
      console.error("Error sending message:", error);
    }

    setInputText(""); // clear input after sending
  };
  return (
    <div className="app">
      <Sidebar
        chats={chats}
        activeChatId={activeChatId}
        onSelectChat={setActiveChatId}
      />
      <div className="chat-container">
        <div className="chat-header">
          <h1>{chats.find((chat) => chat.id === activeChatId)?.title}</h1>
        </div>
        <div className="messages-container">{/* Messages would go here */}</div>
        <div className="input-container">
          <button
            className="plus-button"
            onClick={() => console.log("Plus clicked")}
          >
            ＋
          </button>
          <input type="text" placeholder="Type a message..." />
          <button>Send</button>
        </div>
      </div>
    </div>
  );
}
