import React, { useMemo, useState } from "react";
import {
  FaBrain,
  FaDroplet,
  FaGlassWater,
  FaHeartPulse,
  FaMoon,
  FaPersonWalking,
  FaWind
} from "react-icons/fa6";
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

const WELLNESS_TASKS = [
  {
    id: "water",
    icon: FaGlassWater,
    title: "Water",
    description: "Drink 2-3 liters of water daily."
  },
  {
    id: "breathing",
    icon: FaWind,
    title: "Deep Breathing",
    description: "Try a 2 minute breathing reset."
  },
  {
    id: "stretching",
    icon: FaHeartPulse,
    title: "Stretching",
    description: "Loosen your neck, shoulders, and back."
  },
  {
    id: "walk",
    icon: FaPersonWalking,
    title: "Short Walk",
    description: "Take a 10-15 minute walk for a reset."
  },
  {
    id: "hydration-rhythm",
    icon: FaDroplet,
    title: "Hydration Rhythm",
    description: "Sip water steadily instead of all at once."
  },
  {
    id: "sleep",
    icon: FaMoon,
    title: "Sleep / Recovery",
    description: "Reduce stimulation earlier in the evening."
  }
];

function DailySummary({ messages = [] }) {
  const [completedTasks, setCompletedTasks] = useState({});

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

  const toggleTask = (taskId) => {
    setCompletedTasks((current) => ({
      ...current,
      [taskId]: !current[taskId]
    }));
  };

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

      <section className="summary-card">
        <div className="summary-card-header">
          <div>
            <p className="summary-section-label">Wellness Tips</p>
            <h3 className="summary-card-title">Daily reset checklist</h3>
          </div>
        </div>

        <div className="tips-grid">
          {WELLNESS_TASKS.map((task) => {
            const Icon = task.icon;
            const isCompleted = Boolean(completedTasks[task.id]);

            return (
              <label
                key={task.id}
                className={`tip-item tip-item-checklist ${
                  isCompleted ? "tip-item-completed" : ""
                }`}
              >
                <input
                  type="checkbox"
                  className="tip-checkbox"
                  checked={isCompleted}
                  onChange={() => toggleTask(task.id)}
                />
                <span className="tip-checkbox-custom" aria-hidden="true" />
                <div className="tip-icon">
                  <Icon />
                </div>
                <div className="tip-content">
                  <h4 className="tip-title">{task.title}</h4>
                  <p className="tip-copy">{task.description}</p>
                </div>
              </label>
            );
          })}
        </div>
      </section>
    </div>
  );
}

export default DailySummary;
