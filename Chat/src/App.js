import React, { useState, useEffect, useRef } from "react";
import user1 from "./assets/Panha.png";
import user2 from "./assets/logo.png";

const profiles = {
  "User 1": { name: "Panha", avatar: user1 },
  "User 2": { name: "So Panha", avatar: user2 },
};

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [currentUser, setCurrentUser] = useState("User 1");
  const [editMessageId, setEditMessageId] = useState(null);
  const [editInput, setEditInput] = useState("");
  const messagesEndRef = useRef(null);

  const fetchMessages = async () => {
    const res = await fetch("http://localhost:8000/api/messages");
    const data = await res.json();
    setMessages(data);
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (input.trim() === "") return;

    await fetch("http://localhost:8000/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sender: currentUser, text: input }),
    });

    setInput("");
    fetchMessages();
  };

  const startEdit = (msg) => {
    setEditMessageId(msg.id);
    setEditInput(msg.text);
  };

  const cancelEdit = () => {
    setEditMessageId(null);
    setEditInput("");
  };

  const saveEdit = async () => {
    if (editInput.trim() === "") return;

    await fetch(`http://localhost:8000/api/messages/${editMessageId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: editInput }),
    });

    setEditMessageId(null);
    setEditInput("");
    fetchMessages();
  };

  const deleteMessage = async (id) => {
    if (!window.confirm("តើអ្នកចង់លុបសារនេះមែនទេ?")) return;

    await fetch(`http://localhost:8000/api/messages/${id}`, { method: "DELETE" });
    fetchMessages();
  };

  const handleKeyDownInput = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  const handleKeyDownEdit = (e) => {
    if (e.key === "Enter") saveEdit();
    if (e.key === "Escape") cancelEdit();
  };

  // Text-to-Speech function
  const speakMessage = (text) => {
    if (!window.speechSynthesis) {
      alert("Your browser does not support Text-to-Speech.");
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "km-KH"; // Khmer language, change if needed
    window.speechSynthesis.cancel(); // stop any previous speech
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center font-sans px-4">
      <div className="w-full max-w-md bg-gradient-to-b from-gray-800 to-gray-900 rounded-3xl shadow-2xl border border-gray-700 flex flex-col h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-indigo-600 to-purple-700 text-white rounded-t-3xl flex justify-between items-center shadow-lg">
          <h1 className="font-extrabold text-2xl tracking-wide drop-shadow-lg">💬 Chat Room</h1>
          <select
            value={currentUser}
            onChange={(e) => setCurrentUser(e.target.value)}
            className="bg-gray-800 text-white rounded-full px-3 py-1 text-sm border border-gray-600 shadow-inner transition hover:bg-gray-700"
          >
            <option>User 1</option>
            <option>User 2</option>
          </select>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 text-white bg-gradient-to-t from-black to-gray-900">
          {messages.map((msg) => {
            const isCurrentUser = msg.sender === currentUser;
            const profile = profiles[msg.sender] || { name: msg.sender, avatar: "" };

            return (
              <div
                key={msg.id}
                className={`flex items-end space-x-3 ${isCurrentUser ? "justify-end flex-row-reverse" : ""}`}
              >
                {profile.avatar && (
                  <img
                    src={profile.avatar}
                    alt={profile.name}
                    className="w-10 h-10 rounded-full object-cover border-2 border-indigo-500 shadow-lg"
                  />
                )}
                <div
                  className={`relative px-5 py-3 rounded-3xl max-w-[75%] shadow-lg text-sm font-medium transition-colors ${
                    isCurrentUser ? "bg-indigo-600 text-white hover:bg-indigo-700" : "bg-gray-700 text-gray-100 hover:bg-gray-600"
                  }`}
                >
                  <p className="text-xs font-semibold opacity-90 mb-2 select-none">{profile.name}</p>

                  {editMessageId === msg.id ? (
                    <>
                      <input
                        type="text"
                        className="w-full bg-gray-800 text-white rounded-md px-3 py-2 outline-none ring-2 ring-indigo-500 focus:ring-indigo-600 transition"
                        value={editInput}
                        onChange={(e) => setEditInput(e.target.value)}
                        onKeyDown={handleKeyDownEdit}
                        autoFocus
                      />
                      <div className="flex space-x-3 mt-3 justify-end">
                        <button
                          onClick={saveEdit}
                          className="bg-green-500 hover:bg-green-600 px-4 py-1 rounded-full text-white font-semibold shadow-md transition"
                        >
                          Save
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="bg-red-500 hover:bg-red-600 px-4 py-1 rounded-full text-white font-semibold shadow-md transition"
                        >
                          Cancel
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                      {isCurrentUser && (
                        <div className="absolute top-2 right-3 flex space-x-2 opacity-70 hover:opacity-100 transition">
                          <button
                            onClick={() => startEdit(msg)}
                            className="text-lg px-2 py-1 rounded-full bg-yellow-400 hover:bg-yellow-500 shadow-md focus:outline-none"
                            title="Edit"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => deleteMessage(msg.id)}
                            className="text-lg px-2 py-1 rounded-full bg-red-500 hover:bg-red-600 shadow-md focus:outline-none"
                            title="Delete"
                          >
                            🗑️
                          </button>
                          <button
                            onClick={() => speakMessage(msg.text)}
                            className="text-lg px-2 py-1 rounded-full bg-blue-500 hover:bg-blue-600 shadow-md focus:outline-none"
                            title="Speak"
                          >
                            🔊
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-gray-700 bg-gradient-to-t from-gray-900 to-gray-800 flex items-center gap-4">
          <input
            type="text"
            className="flex-1 bg-gray-800 text-white px-5 py-3 rounded-full border border-gray-700 outline-none focus:ring-4 focus:ring-indigo-500 transition placeholder:text-gray-400"
            placeholder={`សរសេរ​ជា ${profiles[currentUser].name}...`}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDownInput}
          />
          <button
            onClick={sendMessage}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-full font-bold shadow-lg transition-transform active:scale-95"
            aria-label="Send message"
          >
            ផ្ញើ
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
