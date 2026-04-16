require("dotenv").config();
const express = require("express");
const cors = require("cors");
const axios = require("axios");
const mongoose = require("mongoose");

const app = express();

// ✅ Middleware
app.use(cors());
app.use(express.json());

// ✅ MongoDB connect
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected ✅"))
  .catch(err => console.log("Mongo Error ❌:", err));



// ✅ Schema
const Message = mongoose.model("Message", {
  text: String,
  emotion: String,
  type: String,
  time: Date
});

// ✅ Test route
app.get("/", (req, res) => {
  res.send("MindMate API Running 🚀");
});

// ✅ Save API
app.post("/save", async (req, res) => {
  try {
    const msg = new Message(req.body);
    await msg.save();
    res.send("Saved");
  } catch (err) {
    console.log(err);
    res.status(500).send("Error saving");
  }
});

// ✅ Fetch API
app.get("/messages", async (req, res) => {
  try {
    const data = await Message.find();
    res.json(data);
  } catch (err) {
    res.status(500).send("Error fetching");
  }
});

// ✅ AI Analyze Route (ONLY ONE)
app.post("/analyze", async (req, res) => {
  const { text } = req.body;

  console.log("User input:", text);

  try {
    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: "You are a helpful mental wellness assistant."
          },
          {
            role: "user",
            content: `Analyze this message:
"${text}"

Give output in this format ONLY:

Emotion:
Stress Level (1-10):
Suggestions (2 points):`
          }
        ],
        max_tokens: 100
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    const result = response.data.choices[0].message.content;

    res.json({ result });

  } catch (error) {
    console.log("ERROR DETAILS:");
    console.log(error.response?.data || error.message);

    res.status(500).send("Error analyzing text");
  }
});

// ✅ Start server (ONLY ONE)
app.listen(5000, () => {
  console.log("Server running on port 5000");
});