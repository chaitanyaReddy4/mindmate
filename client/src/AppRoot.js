import React, {
  memo,
  Suspense,
  lazy,
  startTransition,
  useEffect,
  useRef,
  useState
} from "react";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate
} from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  FaArrowsRotate,
  FaPaperPlane,
  FaRegFaceSmile,
  FaRotateLeft,
  FaSpinner
} from "react-icons/fa6";
import { apiClient } from "./api/apiClient";
import PrivateRoute from "./components/PrivateRoute";
import Sidebar from "./components/Sidebar";
import { useAuth } from "./context/AuthContext";
import { useToast } from "./context/ToastContext";
import {
  extractEmotionFromText,
  formatEmotionLabel,
  formatTimeLabel
} from "./dashboardUtils";
import "./App.css";

const Dashboard = lazy(() => import("./pages/Dashboard"));
const Journal = lazy(() => import("./pages/Journal"));
const Login = lazy(() => import("./pages/Login"));
const OAuthSuccess = lazy(() => import("./pages/OAuthSuccess"));
const Settings = lazy(() => import("./pages/Settings"));
const Signup = lazy(() => import("./pages/Signup"));
const Wellness = lazy(() => import("./pages/Wellness"));

const pageMotion = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.18, ease: "easeOut" }
};

const getEmotionColor = (emotion = "") => {
  const normalized = String(emotion).trim().toLowerCase();

  if (
    normalized.includes("stress") ||
    normalized.includes("stressed") ||
    normalized.includes("overwhelmed") ||
    normalized.includes("angry")
  ) {
    return "#dc2626";
  }

  if (
    normalized.includes("anxiety") ||
    normalized.includes("anxious") ||
    normalized.includes("worried") ||
    normalized.includes("nervous") ||
    normalized.includes("frustrated")
  ) {
    return "#d97706";
  }

  if (
    normalized.includes("happy") ||
    normalized.includes("positive") ||
    normalized.includes("calm") ||
    normalized.includes("relaxed") ||
    normalized.includes("hopeful")
  ) {
    return "#0f9f6e";
  }

  return "#2563eb";
};

function MessageSkeleton() {
  return (
    <div className="message-row message-row-bot">
      <div className="message-avatar" aria-hidden="true">
        <FaRegFaceSmile />
      </div>
      <div className="message-bubble message-bot message-skeleton">
        <span />
        <span />
        <span />
      </div>
    </div>
  );
}

function ChatPage({
  messages,
  input,
  setInput,
  loading,
  refreshing,
  sendMessage,
  onRefresh,
  onReset
}) {
  const messagesEndRef = useRef(null);

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
    <section className="page-shell">
      <div className="page-header page-header-compact">
        <div>
          <p className="eyebrow">Conversation</p>
          <h1 className="page-title">Chat</h1>
        </div>

        <div className="toolbar-actions">
          <button
            type="button"
            className="toolbar-button"
            onClick={onRefresh}
            disabled={loading || refreshing}
            aria-label="Refresh chat"
          >
            {refreshing ? <FaSpinner className="send-spinner" /> : <FaArrowsRotate />}
            <span>Refresh</span>
          </button>
          <button
            type="button"
            className="toolbar-button toolbar-button-danger"
            onClick={onReset}
            disabled={loading || refreshing || messages.length === 0}
            aria-label="Reset chat"
          >
            <FaRotateLeft />
            <span>Reset</span>
          </button>
        </div>
      </div>

      <section className="chat-card">
        <div className="messages-panel" aria-live="polite">
          {messages.length === 0 && !loading ? (
            <div className="empty-state">
              <div className="empty-state-icon">
                <FaRegFaceSmile />
              </div>
              <h3 className="empty-state-title">A calm place to check in</h3>
              <p className="empty-state-copy">
                Share what feels present right now and MindMate will respond with
                supportive reflections.
              </p>
            </div>
          ) : null}

          {messages.map((message) => {
            const emotion = message.emotion || extractEmotionFromText(message.text);

            return (
              <motion.div
                key={message.id}
                className={`message-row ${
                  message.type === "user" ? "message-row-user" : "message-row-bot"
                }`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
              >
                {message.type === "bot" ? (
                  <div className="message-avatar" aria-hidden="true">
                    <FaRegFaceSmile />
                  </div>
                ) : null}

                <div className="message-stack">
                  {message.type === "bot" ? (
                    <div className="emotion-tag">
                      <span
                        className="emotion-dot"
                        style={{ backgroundColor: getEmotionColor(emotion) }}
                      />
                      {formatEmotionLabel(emotion)}
                    </div>
                  ) : null}

                  <div
                    className={`message-bubble ${
                      message.type === "user" ? "message-user" : "message-bot"
                    }`}
                  >
                    <div className="message-text">{message.text}</div>
                  </div>

                  <span className="message-time">{formatTimeLabel(message.time)}</span>
                </div>
              </motion.div>
            );
          })}

          {loading ? (
            <>
              <motion.div
                className="message-row message-row-bot"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="message-avatar" aria-hidden="true">
                  <FaRegFaceSmile />
                </div>
                <div className="message-stack">
                  <div className="emotion-tag emotion-tag-muted">
                    <span className="emotion-dot" />
                    MindMate is responding
                  </div>
                  <div className="message-bubble message-bot loading-bubble">
                    <div className="typing-indicator" aria-label="MindMate is typing">
                      <span />
                      <span />
                      <span />
                    </div>
                  </div>
                </div>
              </motion.div>
              <MessageSkeleton />
            </>
          ) : null}

          <div ref={messagesEndRef} />
        </div>

        <div className="chat-composer-shell">
          <label className="sr-only" htmlFor="chat-input">
            Message MindMate
          </label>
          <input
            id="chat-input"
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
            whileHover={loading || !input.trim() ? undefined : { y: -1 }}
            whileTap={loading || !input.trim() ? undefined : { scale: 0.97 }}
            aria-label="Send message"
          >
            {loading ? <FaSpinner className="send-spinner" /> : <FaPaperPlane />}
          </motion.button>
        </div>
      </section>
    </section>
  );
}

const MemoizedChatPage = memo(ChatPage);

function RouteFrame({ children }) {
  return (
    <motion.div className="route-motion-shell" {...pageMotion}>
      {children}
    </motion.div>
  );
}

function WorkspaceRoutes({
  messages,
  input,
  setInput,
  loading,
  refreshing,
  sendMessage,
  onRefreshChat,
  onResetChat
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
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route
            path="/chat"
            element={
              <RouteFrame>
                <MemoizedChatPage
                  messages={messages}
                  input={input}
                  setInput={setInput}
                  loading={loading}
                  refreshing={refreshing}
                  sendMessage={sendMessage}
                  onRefresh={onRefreshChat}
                  onReset={onResetChat}
                />
              </RouteFrame>
            }
          />
          <Route
            path="/dashboard"
            element={
              <RouteFrame>
                <Dashboard messages={messages} />
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
          <Route
            path="/wellness"
            element={
              <RouteFrame>
                <Wellness />
              </RouteFrame>
            }
          />
          <Route
            path="/settings"
            element={
              <RouteFrame>
                <Settings />
              </RouteFrame>
            }
          />
        </Routes>
      </AnimatePresence>
    </Suspense>
  );
}

function AppWorkspace() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { showToast } = useToast();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    return window.localStorage.getItem("mindmate_sidebar_collapsed") === "true";
  });
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  useEffect(() => {
    window.localStorage.setItem(
      "mindmate_sidebar_collapsed",
      isSidebarCollapsed ? "true" : "false"
    );
  }, [isSidebarCollapsed]);

  useEffect(() => {
    const loadMessages = async () => {
      try {
        const response = await apiClient.get("/messages");

        startTransition(() => {
          setMessages(
            response.data.messages.map((message) => ({
              id: message._id || `${message.type}-${message.time}`,
              text: message.text,
              emotion: message.emotion,
              type: message.type,
              time: message.time
            }))
          );
        });
      } catch (error) {
        showToast({
          title: "Could not load chat",
          message:
            error?.response?.data?.message ||
            "We could not restore your recent conversation.",
          variant: "error"
        });
      } finally {
        setIsLoadingMessages(false);
      }
    };

    loadMessages();
  }, [showToast]);

  const sendMessage = async () => {
    if (!input.trim() || loading) {
      return;
    }

    const userText = input.trim();
    const currentTime = new Date().toISOString();
    const optimisticUserMessage = {
      id: `user-${currentTime}`,
      type: "user",
      text: userText,
      time: currentTime
    };

    setMessages((current) => [...current, optimisticUserMessage]);
    setInput("");
    setLoading(true);

    try {
      const analyzeResponse = await apiClient.post("/messages/analyze", {
        text: userText
      });

      const botText = analyzeResponse.data.result;
      const emotion =
        analyzeResponse.data.analysis?.emotion || extractEmotionFromText(botText);
      const botTime = new Date().toISOString();
      const optimisticBotMessage = {
        id: `bot-${botTime}`,
        type: "bot",
        text: botText,
        emotion,
        time: botTime
      };

      startTransition(() => {
        setMessages((current) => [...current, optimisticBotMessage]);
      });

      await Promise.all([
        apiClient.post("/messages", {
          text: userText,
          emotion: "",
          type: "user",
          time: currentTime
        }),
        apiClient.post("/messages", {
          text: botText,
          emotion,
          type: "bot",
          time: botTime
        })
      ]);
    } catch (error) {
      setMessages((current) => [
        ...current,
        {
          id: `error-${Date.now()}`,
          type: "bot",
          text:
            error?.response?.data?.message ||
            error.message ||
            "Something went wrong while sending your message.",
          emotion: "neutral",
          time: new Date().toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshChat = async () => {
    if (refreshing) {
      return;
    }

    setRefreshing(true);

    try {
      const response = await apiClient.get("/messages");
      setMessages(
        response.data.messages.map((message) => ({
          id: message._id || `${message.type}-${message.time}`,
          text: message.text,
          emotion: message.emotion,
          type: message.type,
          time: message.time
        }))
      );
    } finally {
      setRefreshing(false);
    }
  };

  const handleResetChat = async () => {
    try {
      await apiClient.delete("/messages");
      setMessages([]);
      setInput("");
      showToast({
        title: "Chat reset",
        message: "Your conversation history was cleared.",
        variant: "success"
      });
    } catch (error) {
      showToast({
        title: "Reset failed",
        message:
          error?.response?.data?.message ||
          "We could not clear the conversation right now.",
        variant: "error"
      });
    }
  };

  const handleLogout = async () => {
    await logout();
    showToast({
      title: "Signed out",
      message: "Your session has been closed safely.",
      variant: "success"
    });
    navigate("/login", { replace: true });
  };

  if (isLoadingMessages) {
    return (
      <div className="page-loader auth-boot-loader">
        <FaSpinner className="send-spinner" />
        <span>Loading your workspace...</span>
      </div>
    );
  }

  return (
    <div
      className={`app-shell ${
        isSidebarCollapsed ? "app-shell-collapsed" : ""
      }`}
    >
      <Sidebar
        collapsed={isSidebarCollapsed}
        mobileOpen={isMobileSidebarOpen}
        onToggleCollapse={() => setIsSidebarCollapsed((current) => !current)}
        onToggleMobile={() => setIsMobileSidebarOpen((current) => !current)}
        onLogout={handleLogout}
      />

      <main className="main-panel">
        <WorkspaceRoutes
          messages={messages}
          input={input}
          setInput={setInput}
          loading={loading}
          refreshing={refreshing}
          sendMessage={sendMessage}
          onRefreshChat={handleRefreshChat}
          onResetChat={handleResetChat}
        />
      </main>
    </div>
  );
}

function AppRoot() {
  return (
    <BrowserRouter>
      <Suspense
        fallback={
          <div className="page-loader auth-boot-loader">
            <FaSpinner className="send-spinner" />
            <span>Preparing MindMate...</span>
          </div>
        }
      >
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/oauth/success" element={<OAuthSuccess />} />
          <Route element={<PrivateRoute />}>
            <Route path="/*" element={<AppWorkspace />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default AppRoot;
