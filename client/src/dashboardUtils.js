export const STORAGE_KEYS = {
  wellness: "mindmate:wellness-tracker",
  wellnessWater: "mindmate:wellness-water",
  wellnessChecklist: "mindmate:wellness-checklist",
  journal: "mindmate:journal-entries",
  journalDrafts: "mindmate:journal-drafts",
  settings: "mindmate:settings"
};

export const WATER_TARGET_ML = 2000;

export const WELLNESS_CHECKLIST_ITEMS = [
  { id: "drink-water", label: "Drink water" },
  { id: "deep-breathing", label: "Deep breathing" },
  { id: "stretching", label: "Stretching" },
  { id: "short-walk", label: "Short walk" }
];

export const JOURNAL_MOOD_OPTIONS = [
  "Calm",
  "Hopeful",
  "Neutral",
  "Anxious",
  "Stressed",
  "Tired"
];

export const DEFAULT_SETTINGS = {
  fullName: "",
  themeMode: "light",
  accentMode: "ocean",
  dailyReminder: true,
  weeklyDigest: true,
  sessionAlerts: true,
  biometricLock: false,
  calmingTone: true,
  conciseReplies: false,
  insightDepth: "balanced"
};

export const extractEmotionFromText = (text = "") => {
  const match = String(text).match(/emotion\s*[:-]\s*\**\s*([^\n\r*]+)/i);
  return match ? match[1].trim().toLowerCase() : "";
};

export const normalizeEmotion = (emotion = "") =>
  String(emotion).trim().toLowerCase();

export const formatEmotionLabel = (emotion = "") => {
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

export const getEmotionBucket = (emotion = "") => {
  const normalized = normalizeEmotion(emotion);

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
    normalized.includes("relaxed") ||
    normalized.includes("hopeful")
  ) {
    return "Positive";
  }

  return "Neutral";
};

export const getStressScore = (emotion = "") => {
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

export const getMessageEmotion = (message = {}) =>
  message.emotion || extractEmotionFromText(message.text);

export const getDateKey = (value = new Date()) => {
  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0")
  ].join("-");
};

export const formatDateLabel = (value, options = {}) => {
  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    ...options
  });
};

export const formatTimeLabel = (value) => {
  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit"
  });
};

export const isSameDay = (left, right) => getDateKey(left) === getDateKey(right);

export const getShortDayLabel = (value) => {
  const date = value instanceof Date ? value : new Date(value);

  return date.toLocaleDateString("en-US", {
    weekday: "short"
  });
};

export const getLastNDates = (count = 7) => {
  const dates = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let index = count - 1; index >= 0; index -= 1) {
    const nextDate = new Date(today);
    nextDate.setDate(today.getDate() - index);
    dates.push(nextDate);
  }

  return dates;
};

export const countWords = (text = "") =>
  String(text)
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;

export const calculateStreak = (dates = []) => {
  const uniqueDates = [...new Set(dates.filter(Boolean))].sort().reverse();

  if (!uniqueDates.length) {
    return 0;
  }

  let streak = 0;
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);

  for (let index = 0; index < uniqueDates.length; index += 1) {
    const expectedKey = getDateKey(cursor);

    if (uniqueDates[index] !== expectedKey) {
      if (index === 0) {
        cursor.setDate(cursor.getDate() - 1);

        if (uniqueDates[index] !== getDateKey(cursor)) {
          break;
        }
      } else {
        break;
      }
    }

    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
};

export const getChecklistCompletion = (checklist = {}) =>
  WELLNESS_CHECKLIST_ITEMS.filter((item) => checklist[item.id]).length;

export const buildWeeklyWellnessSeries = (entries = []) => {
  const entryMap = new Map(entries.map((entry) => [entry.date, entry]));

  return getLastNDates(7).map((date) => {
    const dateKey = getDateKey(date);
    const entry = entryMap.get(dateKey);
    const waterMl = entry?.waterMl || 0;
    const checklist = entry?.checklist || {};
    const completedTasks = getChecklistCompletion(checklist);

    return {
      date: dateKey,
      dayLabel: getShortDayLabel(date),
      waterMl,
      hydrationPercent: Math.min(100, Math.round((waterMl / WATER_TARGET_ML) * 100)),
      completedTasks,
      checklistPercent: Math.round(
        (completedTasks / WELLNESS_CHECKLIST_ITEMS.length) * 100
      )
    };
  });
};

export const buildInsightCards = ({
  messages = [],
  journalEntries = [],
  wellnessEntries = []
}) => {
  const weeklyWellness = buildWeeklyWellnessSeries(wellnessEntries);
  const recentMessages = messages.slice(-14);
  const stressScores = recentMessages
    .filter((message) => message.type === "bot")
    .map((message) => getStressScore(getMessageEmotion(message)));
  const avgStress = stressScores.length
    ? Math.round(stressScores.reduce((sum, value) => sum + value, 0) / stressScores.length)
    : 0;

  const hydratedDays = weeklyWellness.filter(
    (item) => item.hydrationPercent >= 70
  ).length;
  const consistentJournalDays = journalEntries.filter(
    (entry) => countWords(entry.content) >= 20
  ).length;
  const calmMoodDays = journalEntries.filter((entry) =>
    ["Calm", "Hopeful"].includes(entry.moodTag)
  ).length;

  return [
    {
      id: "hydration",
      title: "Hydration and calm",
      body:
        hydratedDays >= 4
          ? "You tended to keep steadier wellness habits on higher hydration days."
          : "Hydration was inconsistent this week, which may be making your check-ins feel less steady."
    },
    {
      id: "stress",
      title: "Stress trend",
      body:
        avgStress >= 65
          ? "Recent AI reflections suggest elevated stress. Lighter routines and shorter journaling prompts may help."
          : "Recent AI reflections look more balanced, with fewer high-stress signals than usual."
    },
    {
      id: "journal",
      title: "Journaling consistency",
      body:
        consistentJournalDays >= 4
          ? "Your writing rhythm stayed consistent, which usually supports clearer weekly reflection."
          : "A shorter daily journal could help rebuild momentum without adding pressure."
    },
    {
      id: "emotion",
      title: "Mood pattern",
      body:
        calmMoodDays >= 3
          ? "You logged calmer or more hopeful journal moods several times this week."
          : "Your journal moods leaned more tense or neutral this week, so gentler recovery moments may be useful."
    }
  ];
};

export const buildPrintableReport = ({
  userName,
  journalEntries = [],
  wellnessEntries = [],
  messages = [],
  insights = []
}) => {
  const weeklyWellness = buildWeeklyWellnessSeries(wellnessEntries);
  const botMessages = messages.filter((message) => message.type === "bot");

  return `
    <html>
      <head>
        <title>MindMate Wellness Report</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 32px; color: #0f172a; }
          h1, h2, h3 { margin-bottom: 8px; }
          section { margin-bottom: 28px; }
          .card { border: 1px solid #dbe4ee; border-radius: 14px; padding: 16px; margin-bottom: 12px; }
          .grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
          .muted { color: #475569; }
          ul { padding-left: 18px; }
        </style>
      </head>
      <body>
        <section>
          <h1>${userName || "MindMate"} Weekly Wellness Report</h1>
          <p class="muted">Generated on ${formatDateLabel(new Date())}</p>
        </section>
        <section>
          <h2>Weekly AI Wellness Insights</h2>
          ${insights
            .map(
              (insight) => `
                <div class="card">
                  <h3>${insight.title}</h3>
                  <p>${insight.body}</p>
                </div>
              `
            )
            .join("")}
        </section>
        <section>
          <h2>Hydration and habits</h2>
          <div class="grid">
            ${weeklyWellness
              .map(
                (entry) => `
                  <div class="card">
                    <strong>${entry.dayLabel}</strong>
                    <p>Water: ${entry.waterMl}ml</p>
                    <p>Checklist: ${entry.completedTasks}/${WELLNESS_CHECKLIST_ITEMS.length}</p>
                  </div>
                `
              )
              .join("")}
          </div>
        </section>
        <section>
          <h2>Journal summaries</h2>
          ${journalEntries.length
            ? journalEntries
                .slice(0, 5)
                .map(
                  (entry) => `
                    <div class="card">
                      <strong>${entry.date}${entry.moodTag ? ` - ${entry.moodTag}` : ""}</strong>
                      <p>${String(entry.content || "").slice(0, 280)}</p>
                    </div>
                  `
                )
                .join("")
            : "<p>No journal entries were available for this report.</p>"}
        </section>
        <section>
          <h2>Conversation mood analytics</h2>
          <p>Total AI replies reviewed: ${botMessages.length}</p>
          <ul>
            ${botMessages
              .slice(-5)
              .map(
                (message) => `
                  <li>${formatDateLabel(message.time, { month: "short", day: "numeric" })}: ${formatEmotionLabel(
                    getMessageEmotion(message)
                  )}</li>
                `
              )
              .join("")}
          </ul>
        </section>
      </body>
    </html>
  `;
};

export const readStorage = (key, fallbackValue) => {
  if (typeof window === "undefined") {
    return fallbackValue;
  }

  try {
    const rawValue = window.localStorage.getItem(key);
    return rawValue ? JSON.parse(rawValue) : fallbackValue;
  } catch (_error) {
    return fallbackValue;
  }
};

export const writeStorage = (key, value) => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(value));
};
