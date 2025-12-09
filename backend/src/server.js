import { connectDB } from "./config/db.js";
import app from "./app.js";
import { config } from "./config/index.js";


const start = async () => {
  await connectDB();
  app.listen(config.PORT, () => {
    console.log(`Server running on port ${config.PORT}`);
  });
};

start().catch((err) => {
  console.error("Failed to start server", err);
  process.exit(1);
});
