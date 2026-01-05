import { after, before, describe, it } from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import TouristSpot from "../src/models/TouristSpot.js";
import { jsonRequest, startTestServer, stopTestServer } from "./testUtils.js";

const runId = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
let server;
let baseUrl;
let natureSpotId;
let beachSpotId;

before(async () => {
  ({ server, baseUrl } = await startTestServer());

  const natureSpot = await TouristSpot.create({
    name: `Nature Spot ${runId}`,
    slug: `nature-spot-${runId}`,
    description: "A serene nature spot for testing.",
    category: "Nature",
    location: { division: "Dhaka", district: "Gazipur", upazila: "Sreepur" },
    images: ["https://example.com/nature.jpg"],
    googleMapsUrl: "https://maps.example.com/nature",
    avgRating: 4.5,
    reviewCount: 12,
  });

  const beachSpot = await TouristSpot.create({
    name: `Beach Spot ${runId}`,
    slug: `beach-spot-${runId}`,
    description: "A sunny beach spot for testing.",
    category: "Beach",
    location: { division: "Chattogram", district: "Cox's Bazar", upazila: "Teknaf" },
    images: ["https://example.com/beach.jpg"],
    googleMapsUrl: "https://maps.example.com/beach",
    avgRating: 3.2,
    reviewCount: 5,
  });

  natureSpotId = natureSpot._id.toString();
  beachSpotId = beachSpot._id.toString();
});

after(async () => {
  const ids = [natureSpotId, beachSpotId].filter(Boolean);
  if (ids.length) {
    await TouristSpot.deleteMany({ _id: { $in: ids } });
  }
  await stopTestServer(server);
});

describe("Feature: Tourist Spot Exploration (ID: 23101017)", () => {
  it("filters spots by category and location", async () => {
    const res = await jsonRequest(
      baseUrl,
      "/api/spots?categories=Nature&division=Dhaka&minRating=4",
      { method: "GET" }
    );

    assert.equal(res.status, 200);
    assert.equal(res.body?.status, "success");
    const data = res.body?.data || [];
    assert.ok(data.some((spot) => String(spot._id) === natureSpotId));
    assert.ok(!data.some((spot) => String(spot._id) === beachSpotId));
  });

  it("searches spots by name prefix", async () => {
    const query = encodeURIComponent("Nature Spot");
    const res = await jsonRequest(baseUrl, `/api/spots?q=${query}`, { method: "GET" });

    assert.equal(res.status, 200);
    const data = res.body?.data || [];
    assert.ok(data.some((spot) => String(spot._id) === natureSpotId));
  });

  it("fetches a spot by id", async () => {
    const res = await jsonRequest(baseUrl, `/api/spots/${natureSpotId}`, { method: "GET" });

    assert.equal(res.status, 200);
    assert.equal(res.body?.status, "success");
    assert.equal(String(res.body?.data?._id), natureSpotId);
  });

  it("returns 404 for a missing spot", async () => {
    const missingId = new mongoose.Types.ObjectId().toString();
    const res = await jsonRequest(baseUrl, `/api/spots/${missingId}`, { method: "GET" });

    assert.equal(res.status, 404);
  });
});
