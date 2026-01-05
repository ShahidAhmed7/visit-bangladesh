import { after, before, describe, it } from "node:test";
import assert from "node:assert/strict";
import ChatMessage from "../src/models/ChatMessage.js";
import ChatThread from "../src/models/ChatThread.js";
import Event from "../src/models/Event.js";
import EventRegistration from "../src/models/EventRegistration.js";
import User from "../src/models/User.js";
import { authHeader, createTestUser, jsonRequest, startTestServer, stopTestServer } from "./testUtils.js";

let server;
let baseUrl;
let guideUser;
let clientUser;
let eventId;
let threadId;

before(async () => {
  ({ server, baseUrl } = await startTestServer());
  guideUser = await createTestUser(baseUrl, { role: "guide", namePrefix: "Guide" });
  clientUser = await createTestUser(baseUrl, { role: "regular", namePrefix: "Client" });

  const event = await Event.create({
    title: "Guide Tour Event",
    description: "Tour for registration tests.",
    eventType: "tour",
    itinerary: "Test itinerary",
    price: 300,
    startDate: new Date(),
    endDate: new Date(Date.now() + 86400000),
    location: { division: "Dhaka", district: "Dhaka", exactSpot: "Test Spot" },
    imageUrl: "https://example.com/event.jpg",
    createdBy: guideUser.id,
    status: "approved",
  });

  eventId = event._id.toString();
});

after(async () => {
  if (threadId) {
    await ChatMessage.deleteMany({ threadId });
    await ChatThread.deleteMany({ _id: threadId });
  }
  if (eventId && clientUser?.id) {
    await EventRegistration.deleteMany({ eventId, userId: clientUser.id });
  }
  if (eventId) {
    await Event.deleteMany({ _id: eventId });
  }
  const userIds = [guideUser?.id, clientUser?.id].filter(Boolean);
  if (userIds.length) {
    await User.deleteMany({ _id: { $in: userIds } });
  }
  await stopTestServer(server);
});

describe("Feature: Manage Tours (ID: 23101234)", () => {
  it("shows guide registrations for their tours", async () => {
    const registerRes = await jsonRequest(baseUrl, `/api/events/${eventId}/register`, {
      method: "POST",
      headers: authHeader(clientUser.token),
      body: {
        fullName: clientUser.name,
        email: clientUser.email,
        contactNumber: "01700000001",
        age: 30,
        sex: "male",
        peopleCount: 2,
        nidNumber: "NID-23101234",
        termsAccepted: true,
      },
    });

    assert.equal(registerRes.status, 201);
    threadId = registerRes.body?.data?.chatThreadId;

    const res = await jsonRequest(baseUrl, "/api/events/me/registrations", {
      method: "GET",
      headers: authHeader(guideUser.token),
    });

    assert.equal(res.status, 200);
    assert.equal(res.body?.status, "success");
    const events = res.body?.data?.events || [];
    const match = events.find((ev) => String(ev.id) === String(eventId));
    assert.ok(match);
    assert.ok(match.registrations.length >= 1);
  });

  it("blocks non-guide access to registrations", async () => {
    const res = await jsonRequest(baseUrl, "/api/events/me/registrations", {
      method: "GET",
      headers: authHeader(clientUser.token),
    });

    assert.equal(res.status, 403);
  });
});
