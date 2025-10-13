import React, { useState } from "react";
import "./Chat.css";

const Chat: React.FC = () => {
  const [messages, setMessages] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState("");

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inputValue.trim()) {
      setMessages((prev) => [...prev, inputValue]);
      setInputValue("");
    }
  };

  return (
    <div id="chat">
      <div id="messages">
        {messages.map((msg, i) => (
          <div key={i} className="message">{msg}</div>
        ))}
      </div>
      <input
        id="chat-input"
        placeholder="Écris ton message..."
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
      />
    </div>
  );
};

export default Chat;
