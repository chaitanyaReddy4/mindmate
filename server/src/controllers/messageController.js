const axios = require("axios");
const { body } = require("express-validator");
const Message = require("../models/Message");
const AppError = require("../utils/appError");
const {
  buildAnalysisMessages,
  formatAnalysisForChat,
  parseAnalysisResponse
} = require("../utils/aiAnalysis");

const saveMessageValidation = [
  body("text").trim().notEmpty().withMessage("Message text is required."),
  body("type")
    .isIn(["user", "bot"])
    .withMessage("Message type must be user or bot."),
  body("emotion").optional().isString(),
  body("time").optional().isISO8601().withMessage("Invalid message timestamp.")
];

const analyzeValidation = [
  body("text").trim().notEmpty().withMessage("Text is required for analysis.")
];

const getMessages = async (req, res) => {
  const messages = await Message.find({ userId: req.user._id }).sort({ time: 1 });
  res.json({ messages });
};

const saveMessage = async (req, res) => {
  const message = await Message.create({
    userId: req.user._id,
    text: req.body.text,
    emotion: req.body.emotion || "",
    type: req.body.type,
    time: req.body.time ? new Date(req.body.time) : new Date()
  });

  res.status(201).json({ message });
};

const clearMessages = async (req, res) => {
  await Message.deleteMany({ userId: req.user._id });
  res.json({ message: "Conversation history cleared." });
};

const analyze = async (req, res) => {
  if (!process.env.GROQ_API_KEY) {
    throw new AppError("AI service is not configured.", 500);
  }

  const recentMessages = await Message.find({ userId: req.user._id })
    .sort({ time: -1 })
    .limit(8)
    .lean();

  try {
    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.3-70b-versatile",
        temperature: 0.95,
        max_tokens: 220,
        response_format: {
          type: "json_object"
        },
        messages: buildAnalysisMessages({
          userText: req.body.text,
          recentMessages: recentMessages.reverse()
        })
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json"
        },
        timeout: 20000
      }
    );

    const content = response.data?.choices?.[0]?.message?.content || "";
    const analysis = parseAnalysisResponse(content);

    res.json({
      result: formatAnalysisForChat(analysis),
      analysis
    });
  } catch (error) {
    const providerMessage =
      error?.response?.data?.error?.message ||
      error?.response?.data?.message ||
      error.message;

    throw new AppError(
      `We could not generate AI guidance right now. ${providerMessage}`,
      error?.response?.status || 502
    );
  }
};

module.exports = {
  saveMessageValidation,
  analyzeValidation,
  getMessages,
  saveMessage,
  clearMessages,
  analyze
};
