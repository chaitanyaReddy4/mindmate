const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const passport = require("passport");
const configurePassport = require("./config/passport");
const authRoutes = require("./routes/authRoutes");
const messageRoutes = require("./routes/messageRoutes");
const journalRoutes = require("./routes/journalRoutes");
const wellnessRoutes = require("./routes/wellnessRoutes");
const adminRoutes = require("./routes/adminRoutes");
const { notFoundHandler } = require("./middleware/errorMiddleware");

const createApp = (env) => {
  configurePassport(env);

  const app = express();

  app.use(
    helmet({
      crossOriginResourcePolicy: false
    })
  );
  app.use(
    cors({
      origin: env.clientOrigin,
      credentials: true
    })
  );
  app.use(express.json({ limit: "1mb" }));
  app.use(cookieParser());
  app.use(passport.initialize());

  app.get("/", (_req, res) => {
    res.send("MindMate API Running");
  });

  app.use("/api/auth", authRoutes);
  app.use("/api/messages", messageRoutes);
  app.use("/api/journal", journalRoutes);
  app.use("/api/wellness", wellnessRoutes);
  app.use("/api/admin", adminRoutes);

  app.use(notFoundHandler);
  app.use((err, req, res, next) => {
    console.error(err);

    res.status(err.statusCode || 500).json({
      message: err.message || "Something went wrong"
    });
  });

  return app;
};

module.exports = createApp;
