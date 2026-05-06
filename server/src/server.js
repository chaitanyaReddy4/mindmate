require("dotenv").config();
const connectDatabase = require("./config/db");
const { getEnv } = require("./config/env");
const createApp = require("./app");

const startServer = async () => {
  const env = getEnv();
  await connectDatabase(env.mongoUri);
  const app = createApp(env);

  app.listen(env.port, () => {
    console.log(`Server running on port ${env.port}`);
  });
};

startServer().catch((error) => {
  console.error("Server failed to start", error);
  process.exit(1);
});
