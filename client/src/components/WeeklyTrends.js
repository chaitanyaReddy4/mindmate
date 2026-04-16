import React, { useMemo } from "react";
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip
} from "chart.js";
import { Bar } from "react-chartjs-2";
import {
  getDateKey,
  getLastNDates,
  getMessageEmotion,
  getShortDayLabel,
  getStressScore
} from "../dashboardUtils";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend
);

function WeeklyTrends({ messages = [], darkMode = true }) {
  const palette = darkMode
    ? {
        text: "#f8fbff",
        muted: "rgba(231, 238, 255, 0.72)",
        grid: "rgba(255,255,255,0.08)",
        border: "rgba(255,255,255,0.1)"
      }
    : {
        text: "#0f172a",
        muted: "rgba(51, 65, 85, 0.72)",
        grid: "rgba(148,163,184,0.18)",
        border: "rgba(148,163,184,0.18)"
      };

  const chartData = useMemo(() => {
    const botMessages = messages.filter(
      (message) => message.type === "bot" && message.time
    );

    const dailySummary = getLastNDates(7).map((date) => {
      const key = getDateKey(date);
      const items = botMessages.filter(
        (message) => getDateKey(message.time) === key
      );
      const averageStress = items.length
        ? Math.round(
            items.reduce(
              (sum, message) =>
                sum + getStressScore(getMessageEmotion(message)),
              0
            ) / items.length
          )
        : 0;

      return {
        label: getShortDayLabel(date),
        count: items.length,
        averageStress
      };
    });

    return {
      labels: dailySummary.map((item) => item.label),
      datasets: [
        {
          type: "bar",
          label: "Bot check-ins",
          data: dailySummary.map((item) => item.count),
          backgroundColor: "rgba(56, 189, 248, 0.55)",
          borderRadius: 14,
          borderSkipped: false
        },
        {
          type: "line",
          label: "Avg stress",
          data: dailySummary.map((item) => item.averageStress),
          borderColor: "#8b5cf6",
          backgroundColor: "#8b5cf6",
          pointBackgroundColor: "#c4b5fd",
          pointBorderColor: "#ffffff",
          pointRadius: 4,
          tension: 0.35,
          yAxisID: "stress"
        }
      ]
    };
  }, [messages]);

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
        grid: { display: false, borderColor: palette.border }
      },
      y: {
        beginAtZero: true,
        ticks: { color: palette.muted, stepSize: 1 },
        grid: { color: palette.grid }
      },
      stress: {
        beginAtZero: true,
        suggestedMax: 100,
        position: "right",
        ticks: { color: palette.muted },
        grid: { drawOnChartArea: false }
      }
    }
  };

  return (
    <section className="summary-card analytics-card">
      <div className="summary-card-header">
        <div>
          <p className="summary-section-label">Weekly Mood Trends</p>
          <h3 className="summary-card-title">Last 7 days at a glance</h3>
          <p className="summary-card-copy">
            Message frequency and average stress are grouped by date for the
            last week.
          </p>
        </div>
      </div>

      <div className="analytics-chart-shell">
        <Bar data={chartData} options={options} />
      </div>
    </section>
  );
}

export default WeeklyTrends;
