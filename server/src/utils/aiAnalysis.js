const DEFAULT_ANALYSIS = {
  emotion: "neutral",
  stressLevel: "4",
  cause: "The exact cause is unclear from the message.",
  suggestion:
    "Take one small next step that feels manageable and check in with yourself again after that."
};

const cleanString = (value) =>
  String(value || "")
    .replace(/^["'\s]+|["'\s]+$/g, "")
    .trim();

const clampStressLevel = (value) => {
  const parsedValue = Number.parseInt(String(value || "").match(/\d+/)?.[0] || "4", 10);
  return String(Math.min(10, Math.max(1, parsedValue)));
};

const extractJsonObject = (content = "") => {
  const trimmedContent = String(content || "").trim();

  if (trimmedContent.startsWith("{") && trimmedContent.endsWith("}")) {
    return trimmedContent;
  }

  const firstBrace = trimmedContent.indexOf("{");
  const lastBrace = trimmedContent.lastIndexOf("}");

  if (firstBrace >= 0 && lastBrace > firstBrace) {
    return trimmedContent.slice(firstBrace, lastBrace + 1);
  }

  return "";
};

const extractField = (content, label) => {
  const pattern = new RegExp(`${label}\\s*[:|-]\\s*([^\\n\\r]+)`, "i");
  const match = String(content || "").match(pattern);
  return cleanString(match?.[1] || "");
};

const normalizeAnalysis = (analysis = {}) => ({
  emotion: cleanString(analysis.emotion || DEFAULT_ANALYSIS.emotion).toLowerCase(),
  stressLevel: clampStressLevel(analysis.stressLevel),
  cause: cleanString(analysis.cause || DEFAULT_ANALYSIS.cause),
  suggestion: cleanString(analysis.suggestion || DEFAULT_ANALYSIS.suggestion)
});

const parseAnalysisResponse = (content = "") => {
  const jsonBlock = extractJsonObject(content);

  if (jsonBlock) {
    try {
      return normalizeAnalysis(JSON.parse(jsonBlock));
    } catch (_error) {
      // Fall back to label-based parsing below.
    }
  }

  return normalizeAnalysis({
    emotion: extractField(content, "emotion"),
    stressLevel: extractField(content, "stress\\s*level"),
    cause: extractField(content, "cause"),
    suggestion: extractField(content, "suggestion")
  });
};

const extractPreviousSuggestion = (text = "") =>
  extractField(text, "suggestion") || extractField(text, "suggestions?");

const formatAnalysisForChat = (analysis) =>
  [
    `Emotion: ${analysis.emotion}`,
    `Stress Level: ${analysis.stressLevel}/10`,
    `Cause: ${analysis.cause}`,
    `Suggestion: ${analysis.suggestion}`
  ].join("\n");

const buildAnalysisMessages = ({ userText, recentMessages = [] }) => {
  const recentContext = recentMessages
    .slice(-8)
    .map((message) => {
      const speaker = message.type === "user" ? "User" : "Assistant";
      const previousSuggestion =
        message.type === "bot" ? extractPreviousSuggestion(message.text) : "";

      return `${speaker}: ${message.text}${
        previousSuggestion ? `\nAssistant suggestion used: ${previousSuggestion}` : ""
      }`;
    })
    .join("\n\n");

  return [
    {
      role: "system",
      content: [
        "You are MindMate, an emotionally intelligent wellness assistant.",
        "Your job is to identify the user's primary emotion, estimate stress level, infer the likely cause, and give a practical suggestion tailored to that exact situation.",
        "Avoid generic wellness advice such as 'take deep breaths', 'meditate', or 'take a break' unless the user's message clearly calls for it.",
        "Make the suggestion concise, supportive, specific, and actionable.",
        "Vary your wording and avoid repeating suggestions that were already used recently.",
        "Respond with valid JSON only using this shape:",
        '{"emotion":"","stressLevel":"","cause":"","suggestion":""}'
      ].join(" ")
    },
    {
      role: "user",
      content: [
        "Analyze the latest user message and return JSON only.",
        `Latest user message: "${userText}"`,
        recentContext ? `Recent conversation context:\n${recentContext}` : "",
        "Rules:",
        "- emotion: one short emotional label",
        "- stressLevel: a number from 1 to 10",
        "- cause: likely situation driving the feeling, grounded in the message",
        "- suggestion: one concise personalized action directly tied to the cause",
        "- do not repeat recent suggestions",
        "- do not include markdown or extra commentary"
      ]
        .filter(Boolean)
        .join("\n\n")
    }
  ];
};

module.exports = {
  buildAnalysisMessages,
  formatAnalysisForChat,
  parseAnalysisResponse
};
