import { connectDB } from "./config/db.js";
import { port } from "./config/env.js";
import app from "./app.js";


const start = async () => {
  await connectDB();
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
};

start().catch((err) => {
  console.error("Failed to start server", err);
  process.exit(1);
});
