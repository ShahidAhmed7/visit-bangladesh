import { after, before, describe, it } from "node:test";
import assert from "node:assert/strict";
import Event from "../src/models/Event.js";
import Notification from "../src/models/Notification.js";
import TouristSpot from "../src/models/TouristSpot.js";
import User from "../src/models/User.js";
import { authHeader, createTestUser, jsonRequest, startTestServer, stopTestServer } from "./testUtils.js";

let server;
let baseUrl;
let user;
let creator;
let spotId;
let eventId;

before(async () => {
  ({ server, baseUrl } = await startTestServer());
  user = await createTestUser(baseUrl, { role: "regular", namePrefix: "Bookmark" });
  creator = await createTestUser(baseUrl, { role: "guide", namePrefix: "Creator" });

  const spot = await TouristSpot.create({
    name: "Bookmark Spot",
    slug: `bookmark-spot-${Date.now()}`,
    description: "Spot for bookmarking tests.",
    category: "Nature",
    location: { division: "Sylhet", district: "Sylhet" },
    images: ["https://example.com/spot.jpg"],
    avgRating: 4.2,
    reviewCount: 3,
  });

  const event = await Event.create({
    title: "Bookmark Event",
    description: "Event for bookmarking tests.",
    eventType: "tour",
    itinerary: "Test itinerary",
    price: 200,
    startDate: new Date(),
    endDate: new Date(Date.now() + 86400000),
    location: { division: "Sylhet", district: "Sylhet" },
    imageUrl: "https://example.com/event.jpg",
    createdBy: creator.id,
    status: "approved",
  });

  spotId = spot._id.toString();
  eventId = event._id.toString();
});

after(async () => {
  if (spotId) {
    await TouristSpot.deleteMany({ _id: spotId });
  }
  if (eventId) {
    await Event.deleteMany({ _id: eventId });
    await Notification.deleteMany({ entityId: eventId });
  }
  const userIds = [user?.id, creator?.id].filter(Boolean);
  if (userIds.length) {
    await User.deleteMany({ _id: { $in: userIds } });
  }
  await stopTestServer(server);
});

describe("Feature: Bookmarking (ID: 23101017)", () => {
  it("bookmarks and unbookmarks a tourist spot", async () => {
    const addRes = await jsonRequest(baseUrl, `/api/users/me/bookmarks/spots/${spotId}`, {
      method: "POST",
      headers: authHeader(user.token),
    });

    assert.equal(addRes.status, 201);
    assert.equal(addRes.body?.status, "success");

    const listRes = await jsonRequest(baseUrl, "/api/users/me/bookmarks", {
      method: "GET",
      headers: authHeader(user.token),
    });

    assert.equal(listRes.status, 200);
    const spots = listRes.body?.data?.spots || [];
    assert.ok(spots.some((spot) => String(spot.id) === String(spotId)));

    const removeRes = await jsonRequest(baseUrl, `/api/users/me/bookmarks/spots/${spotId}`, {
      method: "DELETE",
      headers: authHeader(user.token),
    });

    assert.equal(removeRes.status, 200);
  });

  it("bookmarks an event", async () => {
    const bookmarkRes = await jsonRequest(baseUrl, `/api/events/${eventId}/bookmark`, {
      method: "POST",
      headers: authHeader(user.token),
    });

    assert.equal(bookmarkRes.status, 200);
    assert.equal(bookmarkRes.body?.status, "success");

    const listRes = await jsonRequest(baseUrl, "/api/users/me/bookmarks", {
      method: "GET",
      headers: authHeader(user.token),
    });

    assert.equal(listRes.status, 200);
    const events = listRes.body?.data?.events || [];
    assert.ok(events.some((event) => String(event.id) === String(eventId)));
  });
});
