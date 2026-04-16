import React, { useMemo } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
} from "chart.js";
import { Line } from "react-chartjs-2";
import { getDateKey, getLastNDates, getMessageEmotion, getShortDayLabel, getStressScore } from "./dashboardUtils";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

function EmotionGraph({ messages = [], darkMode = true }) {
  const palette = darkMode
    ? {
        text: "#f8fbff",
        muted: "rgba(231, 238, 255, 0.72)",
        grid: "rgba(255,255,255,0.08)"
      }
    : {
        text: "#0f172a",
        muted: "rgba(51, 65, 85, 0.72)",
        grid: "rgba(148,163,184,0.18)"
      };

  const trend = useMemo(() => {
    const botMessages = messages.filter((message) => message.type === "bot" && message.time);

    return getLastNDates(7).map((date) => {
      const items = botMessages.filter(
        (message) => getDateKey(message.time) === getDateKey(date)
      );
      const averageStress = items.length
        ? Math.round(
            items.reduce(
              (sum, message) => sum + getStressScore(getMessageEmotion(message)),
              0
            ) / items.length
          )
        : 0;

      return {
        label: getShortDayLabel(date),
        averageStress
      };
    });
  }, [messages]);

  const chartData = {
    labels: trend.map((item) => item.label),
    datasets: [
      {
        label: "Stress / emotion trend",
        data: trend.map((item) => item.averageStress),
        borderColor: "#38bdf8",
        backgroundColor: "rgba(56, 189, 248, 0.22)",
        fill: true,
        tension: 0.35,
        pointRadius: 4,
        pointHoverRadius: 5
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: palette.text
        }
      }
    },
    scales: {
      x: {
        ticks: { color: palette.muted },
        grid: { display: false }
      },
      y: {
        beginAtZero: true,
        suggestedMax: 100,
        ticks: { color: palette.muted },
        grid: { color: palette.grid }
      }
    }
  };

  return (
    <section className="summary-card analytics-card">
      <div className="summary-card-header">
        <div>
          <p className="summary-section-label">Emotion Graph Over Time</p>
          <h3 className="summary-card-title">Stress trend line</h3>
          <p className="summary-card-copy">
            A simple line view of how emotional intensity has shifted across recent days.
          </p>
        </div>
      </div>

      <div className="analytics-chart-shell">
        <Line data={chartData} options={options} />
      </div>
    </section>
  );
}

export default EmotionGraph;
