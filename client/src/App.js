import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import {
  BrowserRouter,
  Link,
  NavLink,
  Route,
  Routes
} from "react-router-dom";
import {
  FaBookOpen,
  FaBrain,
  FaChartBar,
  FaComments,
  FaHeartPulse,
  FaMoon,
  FaPaperPlane,
  FaSpinner,
  FaStar,
  FaSun
} from "react-icons/fa6";
import Dashboard from "./pages/Dashboard";
import Journal from "./pages/Journal";
import Wellness from "./pages/Wellness";
import {
  extractEmotionFromText,
  formatEmotionLabel
} from "./dashboardUtils";
import "./App.css";

const getEmotionColor = (emotion = "") => {
  const normalized = String(emotion).trim().toLowerCase();
  const fallbackColor = "#3498db";

  if (
    normalized.includes("stress") ||
    normalized.includes("stressed") ||
    normalized.includes("overwhelmed") ||
    normalized.includes("angry") ||
    normalized.includes("anger") ||
    normalized.includes("furious")
  ) {
    return "#e74c3c";
  }

  if (
    normalized.includes("anxiety") ||
    normalized.includes("anxious") ||
    normalized.includes("worried") ||
    normalized.includes("nervous") ||
    normalized.includes("frustrated") ||
    normalized.includes("upset")
  ) {
    return "#f39c12";
  }

  if (
    normalized.includes("happy") ||
    normalized.includes("positive") ||
    normalized.includes("calm") ||
    normalized.includes("relaxed")
  ) {
    return "#27ae60";
  }

  return fallbackColor;
};

function ChatPage({
  messages,
  input,
  setInput,
  loading,
  sendMessage,
  darkMode
}) {
  const messagesEndRef = useRef(null);
  const bubbleThemeClass = darkMode ? "chat-dark" : "chat-light";

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end"
    });
  }, [messages, loading]);

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  return (
    <section className="chat-panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Conversation Space</p>
          <h2 className="panel-title">Chat with MindMate</h2>
          <p className="panel-description">
            Capture your thoughts and track the emotional tone of each AI
            response.
          </p>
        </div>
      </div>

      <div className="messages-panel">
        {messages.length === 0 && !loading && (
          <div className="empty-state">
            <div className="empty-state-icon">
              <FaStar />
            </div>
            <h3 className="empty-state-title">Welcome to MindMate</h3>
            <p className="empty-state-copy">
              Start a conversation to get emotional reflections, supportive
              responses, and dashboard insights.
            </p>
          </div>
        )}

        {messages.map((msg, index) => (
          <div
            key={index}
            className={`message-row ${
              msg.type === "user" ? "message-row-user" : "message-row-bot"
            }`}
          >
            <div
              className={`message-bubble ${bubbleThemeClass} ${
                msg.type === "user" ? "message-user" : "message-bot"
              }`}
            >
              {msg.type === "bot" && (
                <div className="emotion-tag">
                  <span
                    className="emotion-dot"
                    style={{
                      backgroundColor: getEmotionColor(
                        msg.emotion || extractEmotionFromText(msg.text)
                      )
                    }}
                  />
                  {formatEmotionLabel(
                    msg.emotion || extractEmotionFromText(msg.text)
                  )}
                </div>
              )}

              <div className="message-text">{msg.text}</div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="message-row message-row-bot">
            <div
              className={`message-bubble ${bubbleThemeClass} message-bot loading-bubble`}
            >
              <div
                className="typing-indicator"
                aria-label="MindMate is thinking"
              >
                <span />
                <span />
                <span />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="composer">
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your thoughts..."
          className="composer-input"
          disabled={loading}
        />

        <button
          onClick={sendMessage}
          className="send-button"
          type="button"
          disabled={loading || !input.trim()}
          aria-disabled={loading || !input.trim()}
          aria-label={loading ? "Analyzing message" : "Send message"}
        >
          {loading ? <FaSpinner className="send-spinner" /> : <FaPaperPlane />}
        </button>
      </div>
    </section>
  );
}

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [darkMode, setDarkMode] = useState(true);
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim() || loading) {
      return;
    }

    const userText = input.trim();
    const currentTime = new Date();
    const newMessages = [
      ...messages,
      { type: "user", text: userText, time: currentTime }
    ];

    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await axios.post("https://mindmate-0ee2.onrender.com/analyze", {
        text: userText
      });

      const botText = res.data.result;
      const emotion = extractEmotionFromText(botText);
      const botTime = new Date();

      const updatedMessages = [
        ...newMessages,
        { type: "bot", text: botText, emotion, time: botTime }
      ];

      setMessages(updatedMessages);

      axios.post("https://mindmate-0ee2.onrender.com/save", {
        text: userText,
        emotion: "",
        type: "user",
        time: currentTime
      });

      axios.post("https://mindmate-0ee2.onrender.com/save", {
        text: botText,
        emotion,
        type: "bot",
        time: botTime
      });
    } catch (err) {
      console.error("ERROR:", err);
      console.error("DATA:", err?.response?.data);

      setMessages([
        ...newMessages,
        {
          type: "bot",
          text:
            "Error: " +
            (err.response?.data?.error?.message ||
              err.response?.data ||
              err.message),
          emotion: "neutral",
          time: new Date()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const themeClass = darkMode ? "theme-dark" : "theme-light";
  const navItems = [
    { to: "/", label: "Chat", icon: FaComments, end: true },
    { to: "/dashboard", label: "Dashboard", icon: FaChartBar },
    { to: "/wellness", label: "Wellness", icon: FaHeartPulse },
    { to: "/journal", label: "Journal", icon: FaBookOpen }
  ];

  return (
    <BrowserRouter>
      <div className={`app-shell ${themeClass}`}>
        <aside className="sidebar">
          <div className="sidebar-top">
            <Link className="brand brand-link" to="/">
              <div className="brand-icon">
                <FaBrain />
              </div>
              <div>
                <h1 className="brand-title">MindMate</h1>
                <p className="brand-subtitle">Emotional wellness workspace</p>
              </div>
            </Link>

            <nav className="sidebar-nav">
              {navItems.map((item) => {
                const Icon = item.icon;

                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      `sidebar-tab ${isActive ? "active" : ""}`
                    }
                  >
                    <Icon className="sidebar-tab-icon" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>
          </div>

          <button
            type="button"
            onClick={() => setDarkMode(!darkMode)}
            className="theme-toggle"
          >
            {darkMode ? <FaSun /> : <FaMoon />}
            <span>{darkMode ? "Light Mode" : "Dark Mode"}</span>
          </button>
        </aside>

        <main className="main-panel">
          <Routes>
            <Route
              path="/"
              element={
                <ChatPage
                  messages={messages}
                  input={input}
                  setInput={setInput}
                  loading={loading}
                  sendMessage={sendMessage}
                  darkMode={darkMode}
                />
              }
            />
            <Route
              path="/dashboard"
              element={<Dashboard messages={messages} darkMode={darkMode} />}
            />
            <Route path="/wellness" element={<Wellness />} />
            <Route path="/journal" element={<Journal />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
