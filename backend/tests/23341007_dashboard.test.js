import { after, before, describe, it } from "node:test";
import assert from "node:assert/strict";
import User from "../src/models/User.js";
import { authHeader, createTestUser, jsonRequest, startTestServer, stopTestServer } from "./testUtils.js";

let server;
let baseUrl;
let user;

before(async () => {
  ({ server, baseUrl } = await startTestServer());
  user = await createTestUser(baseUrl, { role: "regular", namePrefix: "Dashboard" });
});

after(async () => {
  if (user?.id) {
    await User.deleteMany({ _id: user.id });
  }
  await stopTestServer(server);
});

describe("Feature: Dashboard (ID: 23341007)", () => {
  it("returns dashboard payload for authenticated users", async () => {
    const res = await jsonRequest(baseUrl, "/api/users/dashboard", {
      method: "GET",
      headers: authHeader(user.token),
    });

    assert.equal(res.status, 200);
    assert.equal(res.body?.status, "success");
    assert.equal(res.body?.data?.role, "regular");
  });

  it("rejects unauthenticated dashboard access", async () => {
    const res = await jsonRequest(baseUrl, "/api/users/dashboard", { method: "GET" });
    assert.equal(res.status, 401);
  });
});
