import { after, before, describe, it } from "node:test";
import assert from "node:assert/strict";
import { jsonRequest, startTestServer, stopTestServer } from "./testUtils.js";

let server;
let baseUrl;
let originalFetch;

before(async () => {
  ({ server, baseUrl } = await startTestServer());
  originalFetch = globalThis.fetch;
  globalThis.fetch = async (url) => {
    if (String(url).includes("geocoding-api.open-meteo.com")) {
      return {
        ok: true,
        json: async () => ({
          results: [
            {
              id: 123,
              name: "Dhaka",
              admin1: "Dhaka",
              country: "Bangladesh",
              latitude: 23.81,
              longitude: 90.41,
            },
          ],
        }),
      };
    }

    if (String(url).includes("api.open-meteo.com")) {
      return {
        ok: true,
        json: async () => ({
          current: {
            temperature_2m: 30,
            relative_humidity_2m: 60,
            apparent_temperature: 32,
            precipitation: 0,
            weather_code: 1,
            wind_speed_10m: 5,
            wind_direction_10m: 180,
          },
        }),
      };
    }

    return { ok: false, json: async () => ({}) };
  };
});

after(async () => {
  globalThis.fetch = originalFetch;
  await stopTestServer(server);
});

describe("Feature: Weather Search (ID: 22301624)", () => {
  it("returns place suggestions", async () => {
    const res = await jsonRequest(baseUrl, "/api/weather/suggest?query=Dh", { method: "GET" });
    assert.equal(res.status, 200);
    assert.equal(res.body?.status, "success");
    const suggestions = res.body?.data?.suggestions || [];
    assert.equal(suggestions[0]?.name, "Dhaka");
  });

  it("returns current weather", async () => {
    const res = await jsonRequest(baseUrl, "/api/weather/current?lat=23.81&lon=90.41", {
      method: "GET",
    });
    assert.equal(res.status, 200);
    assert.equal(res.body?.status, "success");
    assert.equal(res.body?.data?.current?.temperature_2m, 30);
  });

  it("validates query length", async () => {
    const res = await jsonRequest(baseUrl, "/api/weather/suggest?query=a", { method: "GET" });
    assert.equal(res.status, 400);
  });
});
