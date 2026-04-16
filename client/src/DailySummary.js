import React, { useMemo } from "react";
import { FaBrain } from "react-icons/fa6";
import CircularProgress from "./CircularProgress";

const normalizeEmotion = (value = "") => String(value).trim().toLowerCase();

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

const getEmotionStressValue = (emotion = "") => {
  const value = normalizeEmotion(emotion);

  if (
    value.includes("stress") ||
    value.includes("stressed") ||
    value.includes("overwhelmed") ||
    value.includes("angry") ||
    value.includes("furious")
  ) {
    return 90;
  }

  if (
    value.includes("anxiety") ||
    value.includes("anxious") ||
    value.includes("worried") ||
    value.includes("nervous") ||
    value.includes("frustrated")
  ) {
    return 72;
  }

  if (
    value.includes("happy") ||
    value.includes("positive") ||
    value.includes("calm") ||
    value.includes("relaxed")
  ) {
    return 28;
  }

  return 45;
};

const getSuggestion = (emotion = "") => {
  const value = normalizeEmotion(emotion);

  if (
    value.includes("stress") ||
    value.includes("stressed") ||
    value.includes("overwhelmed")
  ) {
    return "Take breaks, try deep breathing, reduce screen time.";
  }

  if (value.includes("anxiety") || value.includes("anxious")) {
    return "Practice grounding, journaling, and slow breathing.";
  }

  if (value.includes("happy")) {
    return "Maintain your routine and positive habits.";
  }

  return "Stay consistent and balanced.";
};

const isSameDay = (dateA, dateB) =>
  dateA.getFullYear() === dateB.getFullYear() &&
  dateA.getMonth() === dateB.getMonth() &&
  dateA.getDate() === dateB.getDate();

function DailySummary({ messages = [], showWellnessSummary = true }) {
  const summary = useMemo(() => {
    const today = new Date();
    const todaysBotMessages = messages.filter((message) => {
      if (message.type !== "bot" || !message.time) {
        return false;
      }

      const timestamp = new Date(message.time);

      if (Number.isNaN(timestamp.getTime())) {
        return false;
      }

      return isSameDay(timestamp, today);
    });

    const totalMessagesToday = todaysBotMessages.length;
    const emotionCounts = {};
    let totalStress = 0;

    todaysBotMessages.forEach((message) => {
      const emotion = normalizeEmotion(message.emotion || "neutral") || "neutral";
      emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
      totalStress += getEmotionStressValue(emotion);
    });

    const emotionEntries = Object.entries(emotionCounts).sort(
      (left, right) => right[1] - left[1]
    );
    const [dominantEmotion = "neutral", dominantCount = 0] = emotionEntries[0] || [];
    const dominantPercentage = totalMessagesToday
      ? Math.round((dominantCount / totalMessagesToday) * 100)
      : 0;

    const emotionDistribution = emotionEntries.map(([emotion, count]) => ({
      emotion,
      count,
      percentage: totalMessagesToday
        ? Math.round((count / totalMessagesToday) * 100)
        : 0
    }));

    const stressLevel = totalMessagesToday
      ? Math.round(totalStress / totalMessagesToday)
      : 36;
    const hydrationLevel = 70;
    const sleepRecovery = Math.max(35, Math.min(96, 100 - Math.round(stressLevel * 0.6)));

    return {
      totalMessagesToday,
      dominantEmotion,
      dominantPercentage,
      emotionDistribution,
      stressLevel,
      hydrationLevel,
      sleepRecovery,
      suggestion: getSuggestion(dominantEmotion)
    };
  }, [messages]);

  return (
    <div className="daily-summary-layout">
      <section className="summary-card">
        <div className="summary-card-header">
          <div>
            <p className="summary-section-label">Daily Mood Summary</p>
            <h3 className="summary-card-title">How today felt so far</h3>
            <p className="summary-card-copy">
              {summary.totalMessagesToday > 0
                ? `Today you mostly felt: ${formatEmotionLabel(
                    summary.dominantEmotion
                  )} (${summary.dominantPercentage}%).`
                : "No bot mood data has been captured for today yet."}
            </p>
          </div>
          <div className="summary-badge">
            <FaBrain />
            <span>{summary.totalMessagesToday} bot check-ins today</span>
          </div>
        </div>

        <div className="summary-content-grid">
          <div className="summary-highlight">
            <CircularProgress
              percentage={summary.dominantPercentage}
              label={formatEmotionLabel(summary.dominantEmotion)}
              color="#5c78ff"
              subtitle="Dominant emotion"
            />
          </div>

          <div className="summary-distribution">
            <h4 className="summary-subtitle">Emotion breakdown</h4>
            {summary.emotionDistribution.length > 0 ? (
              <div className="summary-distribution-list">
                {summary.emotionDistribution.map((item) => (
                  <div key={item.emotion} className="summary-distribution-row">
                    <div className="summary-distribution-label">
                      <span className="summary-distribution-name">
                        {formatEmotionLabel(item.emotion)}
                      </span>
                      <span className="summary-distribution-count">
                        {item.count} msgs
                      </span>
                    </div>
                    <div className="summary-distribution-bar">
                      <span
                        className="summary-distribution-fill"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                    <strong className="summary-distribution-percentage">
                      {item.percentage}%
                    </strong>
                  </div>
                ))}
              </div>
            ) : (
              <p className="summary-empty-copy">
                Start chatting to unlock today&apos;s mood distribution.
              </p>
            )}
          </div>
        </div>
      </section>

      {showWellnessSummary ? (
        <section className="summary-card">
          <div className="summary-card-header">
            <div>
              <p className="summary-section-label">Suggestions</p>
              <h3 className="summary-card-title">Wellness tracking</h3>
              <p className="summary-card-copy">{summary.suggestion}</p>
            </div>
          </div>

          <div className="wellness-rings-grid">
            <CircularProgress
              percentage={summary.hydrationLevel}
              label="Hydration"
              color="#18b8ff"
              subtitle="Target: 2-3L daily"
            />
            <CircularProgress
              percentage={summary.stressLevel}
              label="Stress"
              color="#ff7a59"
              subtitle="Estimated from mood signals"
            />
            <CircularProgress
              percentage={summary.sleepRecovery}
              label="Recovery"
              color="#8f7cff"
              subtitle="Lower stress supports better rest"
            />
          </div>
        </section>
      ) : null}
    </div>
  );
}

export default DailySummary;
