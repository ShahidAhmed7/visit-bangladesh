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
    title: "Registration Event",
    description: "Event for registration tests.",
    eventType: "festival",
    itinerary: "Festival itinerary",
    price: 100,
    startDate: new Date(),
    endDate: new Date(Date.now() + 86400000),
    location: { division: "Khulna", district: "Khulna", exactSpot: "Test Spot" },
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

describe("Feature: Event Registration (ID: 23101017)", () => {
  it("registers a client for an event", async () => {
    const res = await jsonRequest(baseUrl, `/api/events/${eventId}/register`, {
      method: "POST",
      headers: authHeader(clientUser.token),
      body: {
        fullName: clientUser.name,
        email: clientUser.email,
        contactNumber: "01700000002",
        age: 26,
        sex: "female",
        peopleCount: 1,
        nidNumber: "NID-23101017",
        termsAccepted: true,
      },
    });

    assert.equal(res.status, 201);
    assert.equal(res.body?.status, "success");
    threadId = res.body?.data?.chatThreadId;
    assert.ok(threadId);
  });

  it("rejects duplicate registration", async () => {
    const res = await jsonRequest(baseUrl, `/api/events/${eventId}/register`, {
      method: "POST",
      headers: authHeader(clientUser.token),
      body: {
        fullName: clientUser.name,
        email: clientUser.email,
        contactNumber: "01700000003",
        age: 26,
        sex: "female",
        peopleCount: 1,
        nidNumber: "NID-23101017-dup",
        termsAccepted: true,
      },
    });

    assert.equal(res.status, 409);
  });

  it("requires authentication", async () => {
    const res = await jsonRequest(baseUrl, `/api/events/${eventId}/register`, {
      method: "POST",
      body: {
        fullName: "No Auth",
        email: "noauth@example.com",
        contactNumber: "01700000004",
        age: 26,
        sex: "female",
        peopleCount: 1,
        nidNumber: "NID-23101017-unauth",
        termsAccepted: true,
      },
    });

    assert.equal(res.status, 401);
  });
});
