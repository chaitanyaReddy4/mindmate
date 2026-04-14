import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import {
  FaComments,
  FaChartBar,
  FaBrain,
  FaPaperPlane,
  FaMoon,
  FaSun,
  FaStar
} from "react-icons/fa";
import EmotionChart from "./EmotionChart";
import DailySummary from "./DailySummary";
import "./App.css";

const extractEmotionFromText = (text = "") => {
  const match = String(text).match(/emotion\s*[:-]\s*\**\s*([^\n\r*]+)/i);
  return match ? match[1].trim().toLowerCase() : "";
};

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

const formatEmotionLabel = (emotion = "") => {
  const value = String(emotion).trim();

  if (!value) {
    return "Neutral";
  }

  return value
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
};

const getEmotionBucket = (emotion = "") => {
  const normalized = String(emotion).trim().toLowerCase();

  if (
    normalized.includes("stress") ||
    normalized.includes("stressed") ||
    normalized.includes("overwhelmed") ||
    normalized.includes("angry") ||
    normalized.includes("anger") ||
    normalized.includes("furious")
  ) {
    return "High Stress";
  }

  if (
    normalized.includes("anxiety") ||
    normalized.includes("anxious") ||
    normalized.includes("worried") ||
    normalized.includes("nervous") ||
    normalized.includes("frustrated") ||
    normalized.includes("upset")
  ) {
    return "Anxious";
  }

  if (
    normalized.includes("happy") ||
    normalized.includes("positive") ||
    normalized.includes("calm") ||
    normalized.includes("relaxed")
  ) {
    return "Positive";
  }

  return "Neutral";
};

const getStressScore = (emotion = "") => {
  const bucket = getEmotionBucket(emotion);

  if (bucket === "High Stress") {
    return 90;
  }

  if (bucket === "Anxious") {
    return 68;
  }

  if (bucket === "Positive") {
    return 24;
  }

  return 40;
};

function App() {
  const [activeTab, setActiveTab] = useState("chat");
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [darkMode, setDarkMode] = useState(true);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const botMessages = useMemo(
    () => messages.filter((message) => message.type === "bot"),
    [messages]
  );

  const dashboardStats = useMemo(() => {
    const totalMessages = botMessages.length;
    const emotionCounts = {};
    let totalStressScore = 0;

    botMessages.forEach((message) => {
      const emotion = message.emotion || extractEmotionFromText(message.text);
      const bucket = getEmotionBucket(emotion);
      emotionCounts[bucket] = (emotionCounts[bucket] || 0) + 1;
      totalStressScore += getStressScore(emotion);
    });

    let mostFrequentEmotion = "No data yet";
    let topCount = 0;

    Object.entries(emotionCounts).forEach(([emotion, count]) => {
      if (count > topCount) {
        mostFrequentEmotion = emotion;
        topCount = count;
      }
    });

    const averageStressLevel = botMessages.length
      ? `${Math.round(totalStressScore / botMessages.length)}%`
      : "0%";

    return {
      totalMessages,
      mostFrequentEmotion,
      averageStressLevel
    };
  }, [botMessages]);

  useEffect(() => {
    console.log("ALL:", messages.length);
    console.log("BOT ONLY:", botMessages.length);
  }, [messages.length, botMessages.length]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end"
    });
  }, [messages, loading]);

  const sendMessage = async () => {
    if (!input) return;

    const currentTime = new Date();
    const newMessages = [
      ...messages,
      { type: "user", text: input, time: currentTime }
    ];

    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      await axios.post("https://mindmate-0ee2.onrender.com/save", {
        text: input,
        emotion: "",
        type: "user",
        time: currentTime
      });

      const res = await axios.post("https://mindmate-0ee2.onrender.com/analyze", {
        text: input
      });

      const botText = res.data.result;
      const emotion = extractEmotionFromText(botText);
      const botTime = new Date();

      const updatedMessages = [
        ...newMessages,
        { type: "bot", text: botText, emotion, time: botTime }
      ];

      setMessages(updatedMessages);

      await axios.post("https://mindmate-0ee2.onrender.com/save", {
        text: botText,
        emotion,
        type: "bot",
        time: botTime
      });
    } catch {
      setMessages([
        ...newMessages,
        {
          type: "bot",
          text: "Something went wrong. Try again.",
          emotion: "neutral",
          time: new Date()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const themeClass = darkMode ? "theme-dark" : "theme-light";
  const bubbleThemeClass = darkMode ? "chat-dark" : "chat-light";
  const tabItems = [
    { id: "chat", label: "Chat", icon: FaComments },
    { id: "dashboard", label: "Dashboard", icon: FaChartBar }
  ];

  return (
    <div className={`app-shell ${themeClass}`}>
      <aside className="sidebar">
        <div className="sidebar-top">
          <div className="brand">
            <div className="brand-icon">
              <FaBrain />
            </div>
            <div>
              <h1 className="brand-title">MindMate</h1>
              <p className="brand-subtitle">Emotional wellness workspace</p>
            </div>
          </div>

          <nav className="sidebar-nav">
            {tabItems.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  type="button"
                  className={`sidebar-tab ${isActive ? "active" : ""}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <Icon className="sidebar-tab-icon" />
                  <span>{tab.label}</span>
                </button>
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
        {activeTab === "chat" ? (
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
                    Start a conversation to get emotional reflections,
                    supportive responses, and dashboard insights.
                  </p>
                </div>
              )}

              {messages.map((msg, i) => (
                <div
                  key={i}
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
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your thoughts..."
                className="composer-input"
              />

              <button
                onClick={sendMessage}
                className="send-button"
                type="button"
              >
                <FaPaperPlane />
              </button>
            </div>
          </section>
        ) : (
          <section className="dashboard-panel">
            <div className="panel-header">
              <div>
                <p className="eyebrow">Analytics Overview</p>
                <h2 className="panel-title panel-title-dashboard">
                  Emotional Insights
                </h2>
                <p className="panel-description">
                  A quick pulse on conversation volume, tone, and emotional
                  load.
                </p>
              </div>
            </div>

            <div className="kpi-grid">
              <article className="kpi-card">
                <span className="kpi-label">Total Messages</span>
                <strong className="kpi-value">
                  {dashboardStats.totalMessages}
                </strong>
              </article>
              <article className="kpi-card">
                <span className="kpi-label">Most Frequent Emotion</span>
                <strong className="kpi-value">
                  {dashboardStats.mostFrequentEmotion}
                </strong>
              </article>
              <article className="kpi-card">
                <span className="kpi-label">Average Stress Level</span>
                <strong className="kpi-value">
                  {dashboardStats.averageStressLevel}
                </strong>
              </article>
            </div>

            <div className="dashboard-content">
              <DailySummary messages={messages} />
              <EmotionChart messages={messages} darkMode={darkMode} />
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export default App;
