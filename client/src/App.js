import AppRoot from "./AppRoot";
/*

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
          <motion.div
            key={index}
            className={`message-row ${
              msg.type === "user" ? "message-row-user" : "message-row-bot"
            }`}
            initial={{ opacity: 0, y: 14, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.26, ease: "easeOut" }}
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
          </motion.div>
        ))}

        {loading && (
          <motion.div
            className="message-row message-row-bot"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div
              className={`message-bubble ${bubbleThemeClass} message-bot loading-bubble`}
            >
              <div className="analyzing-label">Analyzing...</div>
              <div
                className="typing-indicator"
                aria-label="MindMate is thinking"
              >
                <span />
                <span />
                <span />
              </div>
            </div>
          </motion.div>
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

        <motion.button
          onClick={sendMessage}
          className="send-button"
          type="button"
          disabled={loading || !input.trim()}
          aria-disabled={loading || !input.trim()}
          aria-label={loading ? "Analyzing message" : "Send message"}
          whileHover={
            loading || !input.trim()
              ? undefined
              : { scale: 1.04, boxShadow: "0 20px 44px rgba(99,102,241,0.36)" }
          }
          whileTap={loading || !input.trim() ? undefined : { scale: 0.94 }}
        >
          {loading ? <FaSpinner className="send-spinner" /> : <FaPaperPlane />}
        </motion.button>
      </div>
    </section>
  );
}

function RouteFrame({ children }) {
  return (
    <motion.div className="route-motion-shell" {...pageMotion}>
      {children}
    </motion.div>
  );
}

function AnimatedRoutes({
  messages,
  input,
  setInput,
  loading,
  sendMessage,
  darkMode
}) {
  const location = useLocation();

  return (
    <Suspense
      fallback={
        <motion.div className="page-loader" {...pageMotion}>
          <FaSpinner className="send-spinner" />
          <span>Loading workspace...</span>
        </motion.div>
      }
    >
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route
            path="/"
            element={
              <RouteFrame>
                <ChatPage
                  messages={messages}
                  input={input}
                  setInput={setInput}
                  loading={loading}
                  sendMessage={sendMessage}
                  darkMode={darkMode}
                />
              </RouteFrame>
            }
          />
          <Route
            path="/dashboard"
            element={
              <RouteFrame>
                <Dashboard messages={messages} darkMode={darkMode} />
              </RouteFrame>
            }
          />
          <Route
            path="/wellness"
            element={
              <RouteFrame>
                <Wellness />
              </RouteFrame>
            }
          />
          <Route
            path="/journal"
            element={
              <RouteFrame>
                <Journal />
              </RouteFrame>
            }
          />
        </Routes>
      </AnimatePresence>
    </Suspense>
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
        <motion.aside
          className="sidebar"
          initial={{ opacity: 0, x: -18 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.38, ease: "easeOut" }}
        >
          <div className="sidebar-top">
            <Link className="brand brand-link" to="/">
              <div className="brand-icon">
                <FaBrain />
              </div>
              <div>
          
                <p className="brand-subtitle">Emotional wellness workspace</p>
              </div>
            </Link>

            <nav className="sidebar-nav">
              {navItems.map((item) => {
                const Icon = item.icon;

                return (
                  <motion.div
                    key={item.to}
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <NavLink
                      to={item.to}
                      end={item.end}
                      className={({ isActive }) =>
                        `sidebar-tab ${isActive ? "active" : ""}`
                      }
                    >
                      <Icon className="sidebar-tab-icon" />
                      <span>{item.label}</span>
                    </NavLink>
                  </motion.div>
                );
              })}
            </nav>
          </div>

          <motion.button
            type="button"
            onClick={() => setDarkMode(!darkMode)}
            className="theme-toggle"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
          >
            {darkMode ? <FaSun /> : <FaMoon />}
            <span>{darkMode ? "Light Mode" : "Dark Mode"}</span>
          </motion.button>
        </motion.aside>

        <main className="main-panel">
          <AnimatedRoutes
            messages={messages}
            input={input}
            setInput={setInput}
            loading={loading}
            sendMessage={sendMessage}
            darkMode={darkMode}
          />
        </main>
      </div>
    </BrowserRouter>
  );
}

*/

export default AppRoot;
