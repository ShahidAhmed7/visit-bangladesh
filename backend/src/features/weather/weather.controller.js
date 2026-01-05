import { ValidationError } from "../../shared/errors.js";
import { asyncHandler, successResponse } from "../../shared/utils.js";

const ensureQuery = (query) => {
  if (!query || query.trim().length < 2) {
    throw new ValidationError("Query must be at least 2 characters");
  }
  return query.trim();
};

const ensureCoords = (lat, lon) => {
  const latNum = Number(lat);
  const lonNum = Number(lon);
  if (Number.isNaN(latNum) || Number.isNaN(lonNum)) {
    throw new ValidationError("Latitude and longitude are required");
  }
  return { lat: latNum, lon: lonNum };
};

export const suggestPlaces = asyncHandler(async (req, res) => {
  const query = ensureQuery(req.query.query);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 6, 1), 10);
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=${limit}&language=en&format=json`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new ValidationError("Failed to fetch suggestions");
  }
  const payload = await response.json();
  const suggestions = (payload.results || []).map((item) => ({
    id: item.id,
    name: item.name,
    admin1: item.admin1,
    country: item.country,
    lat: item.latitude,
    lon: item.longitude,
  }));
  res.json(successResponse({ suggestions }));
});

export const getCurrentWeather = asyncHandler(async (req, res) => {
  const { lat, lon } = ensureCoords(req.query.lat, req.query.lon);
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,wind_direction_10m&timezone=auto`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new ValidationError("Failed to fetch weather");
  }
  const payload = await response.json();
  const data = {
    location: {
      name: payload?.name,
      country: payload?.country,
      admin1: payload?.admin1,
      lat,
      lon,
    },
    current: payload.current,
  };
  res.json(successResponse(data));
});
