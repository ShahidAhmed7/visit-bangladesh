import { after, before, describe, it } from "node:test";
import assert from "node:assert/strict";
import Event from "../src/models/Event.js";
import User from "../src/models/User.js";
import { authHeader, createTestUser, jsonRequest, startTestServer, stopTestServer } from "./testUtils.js";

let server;
let baseUrl;
let adminUser;
let regularUser;
const eventIds = [];

before(async () => {
  ({ server, baseUrl } = await startTestServer());
  adminUser = await createTestUser(baseUrl, { role: "admin", namePrefix: "Admin" });
  regularUser = await createTestUser(baseUrl, { role: "regular", namePrefix: "Regular" });
});

after(async () => {
  if (eventIds.length) {
    await Event.deleteMany({ _id: { $in: eventIds } });
  }
  const userIds = [adminUser?.id, regularUser?.id].filter(Boolean);
  if (userIds.length) {
    await User.deleteMany({ _id: { $in: userIds } });
  }
  await stopTestServer(server);
});

describe("Feature: Admin Events/Festivals (ID: 23341007)", () => {
  it("allows admins to publish events", async () => {
    const res = await jsonRequest(baseUrl, "/api/events", {
      method: "POST",
      headers: authHeader(adminUser.token),
      body: {
        title: "Admin Festival",
        description: "Admin created event.",
        eventType: "festival",
        itinerary: "Admin itinerary",
        price: 500,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 86400000).toISOString(),
        location: { division: "Dhaka", district: "Dhaka", exactSpot: "Test Spot" },
        imageUrl: "https://example.com/event.jpg",
      },
    });

    assert.equal(res.status, 201);
    assert.equal(res.body?.data?.status, "approved");
    const eventId = res.body?.data?._id;
    eventIds.push(eventId);

    const listRes = await jsonRequest(baseUrl, "/api/events/admin/all/list?status=approved", {
      method: "GET",
      headers: authHeader(adminUser.token),
    });

    assert.equal(listRes.status, 200);
    const events = listRes.body?.data || [];
    assert.ok(events.some((ev) => String(ev._id) === String(eventId)));
  });

  it("blocks non-admin access to admin list", async () => {
    const res = await jsonRequest(baseUrl, "/api/events/admin/all/list", {
      method: "GET",
      headers: authHeader(regularUser.token),
    });

    assert.equal(res.status, 403);
  });
});
