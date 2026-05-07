const requiredVariables = [
  "MONGO_URI",
  "JWT_ACCESS_SECRET",
  "JWT_REFRESH_SECRET"
];

const getEnv = () => {
  requiredVariables.forEach((key) => {
    if (!process.env[key]) {
      throw new Error(`Missing required environment variable: ${key}`);
    }
  });

  return {
    port: Number(process.env.PORT) || 5000,
    mongoUri: process.env.MONGO_URI,
    clientOrigin: process.env.CLIENT_ORIGIN || "http://localhost:3000",
    googleClientId: process.env.GOOGLE_CLIENT_ID || "",
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    googleCallbackUrl:
      process.env.GOOGLE_CALLBACK_URL ||
      "https://mindmate-0ee2.onrender.com/api/auth/google/callback"
  };
};

module.exports = { getEnv };
