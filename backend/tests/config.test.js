import test from "node:test";
import assert from "node:assert";

test("config parser respects defaults and env overrides", async () => {
  process.env.PORT = "5050";
  process.env.MONGO_URI = "mongodb://localhost:27017/test-db";
  process.env.JWT_SECRET = "test-secret-123";
  process.env.JWT_EXPIRES_IN = "2d";

  const { config } = await import("../src/config/index.js");
  assert.equal(config.PORT, 5050);
  assert.equal(config.MONGO_URI, "mongodb://localhost:27017/test-db");
  assert.equal(config.JWT_SECRET, "test-secret-123");
  assert.equal(config.JWT_EXPIRES_IN, "2d");
});
