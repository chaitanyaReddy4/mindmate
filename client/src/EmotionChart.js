import React, { useMemo } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
} from "chart.js";
import { Bar, Pie } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
);

const normalizeEmotion = (value = "") => String(value).trim().toLowerCase();
const formatPercentage = (value, total) => {
  if (total <= 0) {
    return "0.0";
  }

  return ((value / total) * 100).toFixed(1);
};

const classifyEmotion = (emotion = "") => {
  const value = normalizeEmotion(emotion);

  if (
    value.includes("stress") ||
    value.includes("stressed") ||
    value.includes("overwhelmed") ||
    value.includes("angry") ||
    value.includes("anger")
  ) {
    return "high_stress";
  }

  if (
    value.includes("anxiety") ||
    value.includes("anxious") ||
    value.includes("worried") ||
    value.includes("nervous")
  ) {
    return "anxious";
  }

  if (
    value.includes("happy") ||
    value.includes("positive") ||
    value.includes("calm") ||
    value.includes("relaxed")
  ) {
    return "positive";
  }

  return "neutral";
};

const CATEGORY_META = {
  high_stress: { label: "Stress / Overwhelmed / Angry", color: "#e74c3c" },
  anxious: { label: "Anxiety / Worried", color: "#f39c12" },
  positive: { label: "Happy / Calm", color: "#27ae60" },
  neutral: { label: "Neutral / Default", color: "#3498db" }
};

function EmotionChart({ messages = [], darkMode = true }) {
  const botMessages = useMemo(
    () => messages.filter((m) => m.type === "bot"),
    [messages]
  );

  const palette = useMemo(
    () => ({
      cardBg: darkMode
        ? "linear-gradient(180deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))"
        : "linear-gradient(180deg, rgba(255,255,255,0.92), rgba(248,250,252,0.86))",
      border: darkMode ? "rgba(255,255,255,0.14)" : "rgba(148,163,184,0.2)",
      shadow: darkMode
        ? "0 22px 48px rgba(15, 23, 42, 0.22)"
        : "0 18px 42px rgba(148, 163, 184, 0.18)",
      heading: darkMode ? "#ffffff" : "#0f172a",
      subHeading: darkMode ? "rgba(255,255,255,0.75)" : "rgba(51,65,85,0.74)",
      grid: darkMode ? "rgba(255,255,255,0.08)" : "rgba(148,163,184,0.18)",
      legend: darkMode ? "#e8ebff" : "#334155"
    }),
    [darkMode]
  );

  const { rawLabels, rawValues } = useMemo(() => {
    const counts = {};

    botMessages.forEach((m) => {
      const emotion = normalizeEmotion(m.emotion);
      const key = emotion || "neutral";
      counts[key] = (counts[key] || 0) + 1;
    });

    const labels = Object.keys(counts);
    if (labels.length === 0) {
      return {
        rawLabels: ["No emotion data"],
        rawValues: [0]
      };
    }

    return {
      rawLabels: labels,
      rawValues: labels.map((k) => counts[k])
    };
  }, [botMessages]);

  const pieConfig = useMemo(() => {
    const categoryCounts = {
      high_stress: 0,
      anxious: 0,
      positive: 0,
      neutral: 0
    };

    botMessages.forEach((m) => {
      const category = classifyEmotion(m.emotion);
      categoryCounts[category] += 1;
    });

    const keys = Object.keys(CATEGORY_META);
    const values = keys.map((key) => categoryCounts[key]);
    const total = values.reduce((sum, value) => sum + value, 0);

    if (total === 0) {
      return {
        labels: keys.map((key) => CATEGORY_META[key].label),
        values: [1, 0, 0, 0],
        colors: keys.map((key) => CATEGORY_META[key].color),
        total
      };
    }

    return {
      labels: keys.map((key) => CATEGORY_META[key].label),
      values,
      colors: keys.map((key) => CATEGORY_META[key].color),
      total
    };
  }, [botMessages]);

  const barData = {
    labels: rawLabels,
    datasets: [
      {
        label: "Emotion Count",
        data: rawValues,
        backgroundColor: darkMode ? "#5dade2" : "#60a5fa",
        borderRadius: 10
      }
    ]
  };

  const pieData = {
    labels: pieConfig.labels,
    datasets: [
      {
        label: "Emotion Distribution",
        data: pieConfig.values,
        backgroundColor: pieConfig.colors,
        borderColor: darkMode ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.9)",
        borderWidth: 1
      }
    ]
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 800, easing: "easeOutCubic" },
    plugins: {
      legend: { display: false },
      tooltip: { mode: "index", intersect: false }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { stepSize: 1, color: palette.legend },
        grid: { color: palette.grid }
      },
      x: {
        ticks: { color: palette.legend },
        grid: { display: false }
      }
    }
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 900, easing: "easeOutQuart" },
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          color: palette.legend,
          padding: 16,
          generateLabels: (chart) => {
            const data = chart.data.datasets[0].data || [];
            const total = data.reduce((sum, v) => sum + v, 0);
            return chart.data.labels.map((label, i) => {
              const value = Number(data[i] || 0);
              const pct = formatPercentage(value, total);
              const bg = chart.data.datasets[0].backgroundColor[i];
              return {
                text: `${label} (${pct}%)`,
                fillStyle: bg,
                strokeStyle: bg,
                lineWidth: 1,
                hidden: false,
                index: i
              };
            });
          }
        }
      },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const value = ctx.raw || 0;
            const total = ctx.dataset.data.reduce((sum, v) => sum + v, 0);
            const pct = formatPercentage(value, total);
            return `${ctx.label}: ${value} (${pct}%)`;
          }
        }
      }
    }
  };

  return (
    <div style={styles.wrapper}>
      <div
        style={{
          ...styles.headerCard,
          background: palette.cardBg,
          borderColor: palette.border,
          boxShadow: palette.shadow
        }}
      >
        <h3 style={{ ...styles.heading, color: palette.heading }}>
          Emotion Analytics
        </h3>
        <p style={{ ...styles.subHeading, color: palette.subHeading }}>
          Live emotional trend and distribution from bot responses
        </p>
      </div>

      <div style={styles.grid}>
        <section
          style={{
            ...styles.card,
            background: palette.cardBg,
            borderColor: palette.border,
            boxShadow: palette.shadow
          }}
        >
          <h4 style={{ ...styles.cardTitle, color: palette.heading }}>
            Emotion Count Timeline
          </h4>
          <div style={styles.chartArea}>
            <Bar data={barData} options={barOptions} />
          </div>
        </section>

        <section
          style={{
            ...styles.card,
            background: palette.cardBg,
            borderColor: palette.border,
            boxShadow: palette.shadow
          }}
        >
          <h4 style={{ ...styles.cardTitle, color: palette.heading }}>
            Emotion Distribution
          </h4>
          <div style={styles.chartArea}>
            <Pie data={pieData} options={pieOptions} />
          </div>
          <p style={{ ...styles.meta, color: palette.subHeading }}>
            Total analyzed bot messages: {pieConfig.total || 0}
          </p>
        </section>
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    display: "flex",
    flexDirection: "column",
    gap: "20px"
  },
  headerCard: {
    border: "1px solid",
    borderRadius: "22px",
    padding: "20px 22px"
  },
  heading: {
    margin: 0,
    fontSize: "1.3rem",
    fontWeight: 700,
    letterSpacing: "-0.02em"
  },
  subHeading: {
    margin: "8px 0 0",
    fontSize: "0.95rem",
    lineHeight: 1.6
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: "20px"
  },
  card: {
    border: "1px solid",
    borderRadius: "22px",
    padding: "18px 20px",
    minHeight: "360px",
    display: "flex",
    flexDirection: "column"
  },
  cardTitle: {
    margin: "0 0 14px",
    fontSize: "1.02rem",
    fontWeight: 650,
    letterSpacing: "0.01em"
  },
  chartArea: {
    position: "relative",
    flex: 1,
    minHeight: "300px"
  },
  meta: {
    margin: "14px 0 0",
    fontSize: "0.88rem",
    lineHeight: 1.5
  }
};

export default EmotionChart;
