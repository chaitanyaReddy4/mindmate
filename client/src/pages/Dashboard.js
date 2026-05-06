import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { FaArrowTrendUp, FaBookOpen, FaDroplet, FaFilePdf } from "react-icons/fa6";
import { apiClient } from "../api/apiClient";
import {
  buildInsightCards,
  buildPrintableReport,
  buildWeeklyWellnessSeries,
  calculateStreak,
  countWords,
  formatDateLabel,
  formatEmotionLabel,
  getEmotionBucket,
  getMessageEmotion,
  getStressScore
} from "../dashboardUtils";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

function Dashboard({ messages = [] }) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [journalEntries, setJournalEntries] = useState([]);
  const [wellnessEntries, setWellnessEntries] = useState([]);

  useEffect(() => {
    const loadSupportingData = async () => {
      try {
        const [journalResponse, wellnessResponse] = await Promise.all([
          apiClient.get("/journal"),
          apiClient.get("/wellness", {
            params: { range: "week" }
          })
        ]);

        setJournalEntries(journalResponse.data.entries || []);
        setWellnessEntries(wellnessResponse.data.entries || []);
      } catch (_error) {
        showToast({
          title: "Some insights are unavailable",
          message: "Dashboard history could not be fully loaded.",
          variant: "error"
        });
      }
    };

    loadSupportingData();
  }, [showToast]);

  const botMessages = useMemo(
    () => messages.filter((message) => message.type === "bot"),
    [messages]
  );

  const stats = useMemo(() => {
    const stressScores = botMessages.map((message) =>
      getStressScore(getMessageEmotion(message))
    );
    const buckets = botMessages.reduce((result, message) => {
      const bucket = getEmotionBucket(getMessageEmotion(message));
      result[bucket] = (result[bucket] || 0) + 1;
      return result;
    }, {});

    const topBucket =
      Object.entries(buckets).sort((left, right) => right[1] - left[1])[0]?.[0] ||
      "Neutral";
    const journalStreak = calculateStreak(journalEntries.map((entry) => entry.date));
    const weeklyWellness = buildWeeklyWellnessSeries(wellnessEntries);
    const averageHydration = weeklyWellness.length
      ? Math.round(
          weeklyWellness.reduce((sum, entry) => sum + entry.hydrationPercent, 0) /
            weeklyWellness.length
        )
      : 0;

    return {
      totalReplies: botMessages.length,
      topMood: topBucket,
      averageStress: stressScores.length
        ? `${Math.round(
            stressScores.reduce((sum, value) => sum + value, 0) / stressScores.length
          )}%`
        : "0%",
      journalStreak,
      averageHydration
    };
  }, [botMessages, journalEntries, wellnessEntries]);

  const weeklyWellness = useMemo(
    () => buildWeeklyWellnessSeries(wellnessEntries),
    [wellnessEntries]
  );

  const insightCards = useMemo(
    () => buildInsightCards({ messages, journalEntries, wellnessEntries }),
    [journalEntries, messages, wellnessEntries]
  );

  const emotionTimeline = useMemo(
    () =>
      botMessages.slice(-6).map((message) => ({
        id: message.id,
        date: formatDateLabel(message.time, {
          month: "short",
          day: "numeric"
        }),
        emotion: formatEmotionLabel(getMessageEmotion(message))
      })),
    [botMessages]
  );

  const exportReport = () => {
    const printableWindow = window.open("", "_blank", "noopener,noreferrer");

    if (!printableWindow) {
      showToast({
        title: "Export blocked",
        message: "Please allow pop-ups to export your report.",
        variant: "error"
      });
      return;
    }

    printableWindow.document.write(
      buildPrintableReport({
        userName: user?.name,
        journalEntries,
        wellnessEntries,
        messages,
        insights: insightCards
      })
    );
    printableWindow.document.close();
    printableWindow.focus();
    printableWindow.print();
  };

  return (
    <section className="page-shell">
      <div className="page-header">
        <div>
          <p className="eyebrow">Overview</p>
          <h1 className="page-title">
            {user?.name ? `Welcome back, ${user.name.split(" ")[0]}` : "Dashboard"}
          </h1>
          <p className="page-description">
            A steady weekly view of mood signals, emotional momentum, and wellness habits.
          </p>
        </div>

        <button type="button" className="toolbar-button" onClick={exportReport}>
          <FaFilePdf />
          <span>Export PDF</span>
        </button>
      </div>

      <div className="kpi-grid">
        <article className="stat-card">
          <span className="stat-label">AI replies</span>
          <strong className="stat-value">{stats.totalReplies}</strong>
        </article>
        <article className="stat-card">
          <span className="stat-label">Top mood</span>
          <strong className="stat-value">{stats.topMood}</strong>
        </article>
        <article className="stat-card">
          <span className="stat-label">Average stress</span>
          <strong className="stat-value">{stats.averageStress}</strong>
        </article>
        <article className="stat-card">
          <span className="stat-label">Journal streak</span>
          <strong className="stat-value">{stats.journalStreak} days</strong>
        </article>
      </div>

      <div className="dashboard-grid">
        <section className="surface-card surface-card-large">
          <div className="section-heading">
            <div>
              <p className="section-kicker">Weekly AI Wellness Insights</p>
              <h2 className="section-title">Patterns worth noticing</h2>
            </div>
          </div>

          <div className="insights-grid">
            {insightCards.map((insight) => (
              <article key={insight.id} className="insight-card">
                <h3>{insight.title}</h3>
                <p>{insight.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="surface-card">
          <div className="section-heading">
            <div>
              <p className="section-kicker">Hydration</p>
              <h2 className="section-title">Weekly wellness analytics</h2>
            </div>
            <span className="section-badge">{stats.averageHydration}% average</span>
          </div>

          <div className="trend-list">
            {weeklyWellness.map((entry) => (
              <div key={entry.date} className="trend-row">
                <div className="trend-row-head">
                  <strong>{entry.dayLabel}</strong>
                  <span>{entry.waterMl}ml</span>
                </div>
                <div className="trend-bar">
                  <motion.span
                    className="trend-fill"
                    initial={{ width: 0 }}
                    animate={{ width: `${entry.hydrationPercent}%` }}
                  />
                </div>
                <small>{entry.completedTasks} wellness tasks completed</small>
              </div>
            ))}
          </div>
        </section>

        <section className="surface-card">
          <div className="section-heading">
            <div>
              <p className="section-kicker">Journaling</p>
              <h2 className="section-title">Recent reflection depth</h2>
            </div>
            <FaBookOpen className="section-icon" />
          </div>

          <div className="timeline-list">
            {journalEntries.length ? (
              journalEntries.slice(0, 5).map((entry) => (
                <div key={entry.id} className="timeline-item">
                  <strong>
                    {formatDateLabel(entry.date)}
                    {entry.moodTag ? ` - ${entry.moodTag}` : ""}
                  </strong>
                  <span>{countWords(entry.content)} words</span>
                </div>
              ))
            ) : (
              <p className="muted-copy">Your saved reflections will appear here.</p>
            )}
          </div>
        </section>

        <section className="surface-card">
          <div className="section-heading">
            <div>
              <p className="section-kicker">Emotional timeline</p>
              <h2 className="section-title">Recent assistant patterns</h2>
            </div>
            <FaArrowTrendUp className="section-icon" />
          </div>

          <div className="timeline-list">
            {emotionTimeline.length ? (
              emotionTimeline.map((item) => (
                <div key={item.id} className="timeline-item">
                  <strong>{item.emotion}</strong>
                  <span>{item.date}</span>
                </div>
              ))
            ) : (
              <p className="muted-copy">Recent AI mood insights will appear after more chats.</p>
            )}
          </div>
        </section>

        <section className="surface-card">
          <div className="section-heading">
            <div>
              <p className="section-kicker">Consistency</p>
              <h2 className="section-title">Habit momentum</h2>
            </div>
            <FaDroplet className="section-icon" />
          </div>

          <div className="ring-grid">
            <article className="mini-ring-card">
              <div
                className="progress-ring"
                style={{ "--progress": `${stats.averageHydration}%` }}
              >
                <span>{stats.averageHydration}%</span>
              </div>
              <p>Hydration target average</p>
            </article>
            <article className="mini-ring-card">
              <div
                className="progress-ring"
                style={{
                  "--progress": `${Math.min(100, stats.journalStreak * 20)}%`
                }}
              >
                <span>{stats.journalStreak}</span>
              </div>
              <p>Current journal streak</p>
            </article>
          </div>
        </section>
      </div>
    </section>
  );
}

export default Dashboard;
