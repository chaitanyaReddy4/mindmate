export const STORAGE_KEYS = {
  wellness: "mindmate:wellness-tracker",
  wellnessWater: "mindmate:wellness-water",
  wellnessChecklist: "mindmate:wellness-checklist",
  journal: "mindmate:journal-entries"
};

export const WATER_TARGET_ML = 2000;

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
    normalized.includes("relaxed")
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

export const readStorage = (key, fallbackValue) => {
  if (typeof window === "undefined") {
    return fallbackValue;
  }

  try {
    const rawValue = window.localStorage.getItem(key);
    return rawValue ? JSON.parse(rawValue) : fallbackValue;
  } catch (error) {
    return fallbackValue;
  }
};

export const writeStorage = (key, value) => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(value));
};
