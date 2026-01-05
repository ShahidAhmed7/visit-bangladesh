import { after, before, describe, it } from "node:test";
import assert from "node:assert/strict";
import ChatMessage from "../src/models/ChatMessage.js";
import ChatThread from "../src/models/ChatThread.js";
import Event from "../src/models/Event.js";
import EventRegistration from "../src/models/EventRegistration.js";
import User from "../src/models/User.js";
import { authHeader, createTestUser, jsonRequest, startTestServer, stopTestServer } from "./testUtils.js";

const runId = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
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
    title: `Chat Event ${runId}`,
    description: "Event for chat tests",
    eventType: "tour",
    itinerary: "Test itinerary",
    price: 120,
    startDate: new Date(),
    endDate: new Date(Date.now() + 86400000),
    location: { division: "Dhaka", district: "Dhaka", exactSpot: "Test Spot" },
    imageUrl: "https://example.com/event.jpg",
    createdBy: guideUser.id,
    status: "approved",
  });

  eventId = event._id.toString();

  const registrationRes = await jsonRequest(baseUrl, `/api/events/${eventId}/register`, {
    method: "POST",
    headers: authHeader(clientUser.token),
    body: {
      fullName: clientUser.name,
      email: clientUser.email,
      contactNumber: "01700000000",
      age: 28,
      sex: "male",
      peopleCount: 2,
      nidNumber: `NID-${runId}`,
      termsAccepted: true,
    },
  });

  assert.equal(registrationRes.status, 201);
  threadId = registrationRes.body?.data?.chatThreadId;
  assert.ok(threadId);
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
  if (guideUser?.id || clientUser?.id) {
    const ids = [guideUser?.id, clientUser?.id].filter(Boolean);
    await User.deleteMany({ _id: { $in: ids } });
  }
  await stopTestServer(server);
});

describe("Feature: Event Chat (ID: 23101234)", () => {
  it("lists chat threads for a guide", async () => {
    const res = await jsonRequest(baseUrl, "/api/chats/threads", {
      method: "GET",
      headers: authHeader(guideUser.token),
    });

    assert.equal(res.status, 200);
    assert.equal(res.body?.status, "success");
    const threads = res.body?.data?.threads || [];
    const match = threads.find((t) => String(t.id) === String(threadId));
    assert.ok(match);
    assert.equal(String(match.event?.id), eventId);
  });

  it("lists messages for a participant", async () => {
    const res = await jsonRequest(baseUrl, `/api/chats/threads/${threadId}/messages`, {
      method: "GET",
      headers: authHeader(clientUser.token),
    });

    assert.equal(res.status, 200);
    assert.equal(res.body?.status, "success");
    const messages = res.body?.data?.messages || [];
    assert.ok(messages.length >= 1);
  });

  it("sends a message in a thread", async () => {
    const text = `Hello from client ${Date.now()}`;
    const res = await jsonRequest(baseUrl, `/api/chats/threads/${threadId}/messages`, {
      method: "POST",
      headers: authHeader(clientUser.token),
      body: { text },
    });

    assert.equal(res.status, 201);
    assert.equal(res.body?.status, "success");
    assert.equal(res.body?.data?.text, text);
  });

  it("rejects missing auth token", async () => {
    const res = await jsonRequest(baseUrl, "/api/chats/threads", { method: "GET" });
    assert.equal(res.status, 401);
  });

  it("rejects empty message text", async () => {
    const res = await jsonRequest(baseUrl, `/api/chats/threads/${threadId}/messages`, {
      method: "POST",
      headers: authHeader(clientUser.token),
      body: { text: "   " },
    });

    assert.equal(res.status, 400);
  });
});
