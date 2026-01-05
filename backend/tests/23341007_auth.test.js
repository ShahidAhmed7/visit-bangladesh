import { after, before, describe, it } from "node:test";
import assert from "node:assert/strict";
import User from "../src/models/User.js";
import { jsonRequest, startTestServer, stopTestServer } from "./testUtils.js";

let server;
let baseUrl;
let userId;

before(async () => {
  ({ server, baseUrl } = await startTestServer());
});

after(async () => {
  if (userId) {
    await User.deleteMany({ _id: userId });
  }
  await stopTestServer(server);
});

describe("Feature: Auth (ID: 23341007)", () => {
  it("registers, logs in, and fetches profile via token", async () => {
    const email = `auth-${Date.now()}@example.com`;
    const password = "Password123!";
    const name = "Auth User";

    const registerRes = await jsonRequest(baseUrl, "/api/auth/register", {
      method: "POST",
      body: { name, email, password },
    });

    assert.equal(registerRes.status, 201);
    userId = registerRes.body?.data?.user?.id;
    assert.ok(userId);

    const loginRes = await jsonRequest(baseUrl, "/api/auth/login", {
      method: "POST",
      body: { email, password },
    });

    assert.equal(loginRes.status, 200);
    const token = loginRes.body?.data?.token;
    assert.ok(token);

    const meRes = await jsonRequest(baseUrl, "/api/auth/me", {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });

    assert.equal(meRes.status, 200);
    assert.equal(meRes.body?.data?.email, email);
  });

  it("rejects access without token", async () => {
    const res = await jsonRequest(baseUrl, "/api/auth/me", { method: "GET" });
    assert.equal(res.status, 401);
  });
});
