import { after, before, describe, it } from "node:test";
import assert from "node:assert/strict";
import User from "../src/models/User.js";
import { authHeader, createTestUser, jsonRequest, startTestServer, stopTestServer } from "./testUtils.js";

let server;
let baseUrl;
let user;

before(async () => {
  ({ server, baseUrl } = await startTestServer());
  user = await createTestUser(baseUrl, { role: "regular", namePrefix: "Profile" });
});

after(async () => {
  if (user?.id) {
    await User.deleteMany({ _id: user.id });
  }
  await stopTestServer(server);
});

describe("Feature: Profile & Settings (ID: 23341007)", () => {
  it("updates profile information", async () => {
    const res = await jsonRequest(baseUrl, "/api/users/me", {
      method: "PUT",
      headers: authHeader(user.token),
      body: {
        name: "Updated Name",
        bio: "Updated bio for profile tests.",
        phone: "01700000099",
        location: { city: "Dhaka", country: "Bangladesh" },
      },
    });

    assert.equal(res.status, 200);
    assert.equal(res.body?.status, "success");
    assert.equal(res.body?.data?.name, "Updated Name");
  });

  it("changes password and allows login with new password", async () => {
    const newPassword = "NewPassword456!";
    const changeRes = await jsonRequest(baseUrl, "/api/users/me/password", {
      method: "PUT",
      headers: authHeader(user.token),
      body: {
        currentPassword: user.password,
        newPassword,
      },
    });

    assert.equal(changeRes.status, 200);
    assert.equal(changeRes.body?.status, "success");

    const loginRes = await jsonRequest(baseUrl, "/api/auth/login", {
      method: "POST",
      body: { email: user.email, password: newPassword },
    });

    assert.equal(loginRes.status, 200);
    assert.ok(loginRes.body?.data?.token);
  });
});
