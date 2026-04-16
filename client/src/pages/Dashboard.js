import React, { useMemo } from "react";
import DailySummary from "../DailySummary";
import EmotionChart from "../EmotionChart";
import EmotionGraph from "../components/EmotionGraph";
import WeeklyTrends from "../components/WeeklyTrends";
import {
  getEmotionBucket,
  getMessageEmotion,
  getStressScore
} from "../dashboardUtils";

function Dashboard({ messages = [], darkMode = true }) {
  const botMessages = useMemo(
    () => messages.filter((message) => message.type === "bot"),
    [messages]
  );

  const dashboardStats = useMemo(() => {
    const totalMessages = botMessages.length;
    const emotionCounts = {};
    let totalStressScore = 0;

    botMessages.forEach((message) => {
      const emotion = getMessageEmotion(message);
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

  const stressComparison = useMemo(() => {
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const getAverageStressForDate = (targetDate) => {
      const scores = botMessages
        .filter((message) => {
          const timestamp = new Date(message.time);
          return (
            !Number.isNaN(timestamp.getTime()) &&
            timestamp.toDateString() === targetDate.toDateString()
          );
        })
        .map((message) => getStressScore(getMessageEmotion(message)));

      if (!scores.length) {
        return 0;
      }

      return Math.round(
        scores.reduce((sum, score) => sum + score, 0) / scores.length
      );
    };

    const todayAverage = getAverageStressForDate(today);
    const yesterdayAverage = getAverageStressForDate(yesterday);
    const delta = todayAverage - yesterdayAverage;

    return {
      todayAverage,
      yesterdayAverage,
      indicator: delta <= 0 ? "Improvement" : "Increase",
      arrow: delta <= 0 ? "↓" : "↑"
    };
  }, [botMessages]);

  return (
    <section className="dashboard-panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Analytics Overview</p>
          <h2 className="panel-title panel-title-dashboard">
            Emotional Insights
          </h2>
          <p className="panel-description">
            A quick pulse on conversation volume, tone, and emotional load.
          </p>
        </div>
      </div>

      <div className="kpi-grid kpi-grid-expanded">
        <article className="kpi-card">
          <span className="kpi-label">Total Messages</span>
          <strong className="kpi-value">{dashboardStats.totalMessages}</strong>
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
        <article className="kpi-card">
          <span className="kpi-label">Stress Improvement</span>
          <strong className="kpi-value">
            {stressComparison.arrow} {stressComparison.indicator}
          </strong>
          <span className="kpi-meta">
            Today {stressComparison.todayAverage}% vs yesterday{" "}
            {stressComparison.yesterdayAverage}%
          </span>
        </article>
      </div>

      <div className="dashboard-content">
        <DailySummary messages={messages} showWellnessSummary={false} />
        <WeeklyTrends messages={messages} darkMode={darkMode} />
        <EmotionGraph messages={messages} darkMode={darkMode} />
        <EmotionChart messages={messages} darkMode={darkMode} />
      </div>
    </section>
  );
}

export default Dashboard;
