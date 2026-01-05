import { after, before, describe, it } from "node:test";
import assert from "node:assert/strict";
import Event from "../src/models/Event.js";
import User from "../src/models/User.js";
import { authHeader, createTestUser, jsonRequest, startTestServer, stopTestServer } from "./testUtils.js";

let server;
let baseUrl;
let guideUser;
let adminUser;
const eventIds = [];

const buildEventPayload = (suffix) => ({
  title: `Tour Event ${suffix}`,
  description: "Guided tour event for testing.",
  eventType: "tour",
  itinerary: "Day 1 itinerary",
  price: 250,
  startDate: new Date().toISOString(),
  endDate: new Date(Date.now() + 86400000).toISOString(),
  location: { division: "Dhaka", district: "Dhaka", exactSpot: "Test Spot" },
  imageUrl: "https://example.com/event.jpg",
});

before(async () => {
  ({ server, baseUrl } = await startTestServer());
  guideUser = await createTestUser(baseUrl, { role: "guide", namePrefix: "Guide" });
  adminUser = await createTestUser(baseUrl, { role: "admin", namePrefix: "Admin" });
});

after(async () => {
  if (eventIds.length) {
    await Event.deleteMany({ _id: { $in: eventIds } });
  }
  const userIds = [guideUser?.id, adminUser?.id].filter(Boolean);
  if (userIds.length) {
    await User.deleteMany({ _id: { $in: userIds } });
  }
  await stopTestServer(server);
});

describe("Feature: Create/Publish Tours (ID: 23101234)", () => {
  it("creates a tour event as guide (pending)", async () => {
    const res = await jsonRequest(baseUrl, "/api/events", {
      method: "POST",
      headers: authHeader(guideUser.token),
      body: buildEventPayload("Guide"),
    });

    assert.equal(res.status, 201);
    assert.equal(res.body?.status, "success");
    assert.equal(res.body?.data?.status, "pending");
    eventIds.push(res.body?.data?._id);
  });

  it("creates a tour event as admin (approved)", async () => {
    const res = await jsonRequest(baseUrl, "/api/events", {
      method: "POST",
      headers: authHeader(adminUser.token),
      body: buildEventPayload("Admin"),
    });

    assert.equal(res.status, 201);
    assert.equal(res.body?.data?.status, "approved");
    eventIds.push(res.body?.data?._id);
  });

  it("updates a guide-owned tour", async () => {
    const createRes = await jsonRequest(baseUrl, "/api/events", {
      method: "POST",
      headers: authHeader(guideUser.token),
      body: buildEventPayload("Update"),
    });
    const eventId = createRes.body?.data?._id;
    eventIds.push(eventId);

    const res = await jsonRequest(baseUrl, `/api/events/${eventId}`, {
      method: "PUT",
      headers: authHeader(guideUser.token),
      body: { title: "Updated Tour Title", status: "approved" },
    });

    assert.equal(res.status, 200);
    assert.equal(res.body?.status, "success");
    assert.equal(res.body?.data?.title, "Updated Tour Title");
    assert.equal(res.body?.data?.status, "pending");
  });
});
