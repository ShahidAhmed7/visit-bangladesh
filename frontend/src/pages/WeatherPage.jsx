import { useEffect, useMemo, useState } from "react";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import { weatherAPI } from "../services/api/weather.api.js";

const weatherCodeLabel = (code) => {
  const map = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Rime fog",
    51: "Light drizzle",
    53: "Moderate drizzle",
    55: "Dense drizzle",
    61: "Slight rain",
    63: "Moderate rain",
    65: "Heavy rain",
    71: "Slight snow",
    73: "Moderate snow",
    75: "Heavy snow",
    80: "Rain showers",
    81: "Heavy showers",
    82: "Violent showers",
    95: "Thunderstorm",
  };
  return map[code] || "Unknown conditions";
};

const WeatherPage = () => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loadingSuggest, setLoadingSuggest] = useState(false);
  const [loadingWeather, setLoadingWeather] = useState(false);
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (query.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      setLoadingSuggest(true);
      try {
        const res = await weatherAPI.suggest(query.trim(), 6);
        const data = res.data?.data?.suggestions || res.data?.suggestions || [];
        setSuggestions(Array.isArray(data) ? data : []);
      } catch {
        setSuggestions([]);
      } finally {
        setLoadingSuggest(false);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [query]);

  const selectedLabel = useMemo(() => {
    if (!selected) return "";
    const parts = [selected.name, selected.admin1, selected.country].filter(Boolean);
    return parts.join(", ");
  }, [selected]);

  const handleCheckWeather = async () => {
    setError("");
    const pick = selected || suggestions[0];
    if (!pick) {
      setError("Please select a place from the suggestions.");
      return;
    }
    setSelected(pick);
    setLoadingWeather(true);
    try {
      const res = await weatherAPI.current(pick.lat, pick.lon);
      const data = res.data?.data || res.data;
      setWeather(data);
    } catch {
      setWeather(null);
      setError("Failed to load weather data. Please try again.");
    } finally {
      setLoadingWeather(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />
      <main className="relative overflow-hidden pb-16 pt-24 md:pt-28">
        <div className="pointer-events-none absolute -top-40 right-0 h-80 w-80 rounded-full bg-emerald-200/40 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 left-10 h-72 w-72 rounded-full bg-sky-200/40 blur-3xl" />
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <header className="weather-fade-up mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div className="space-y-2">
              <span className="inline-flex items-center rounded-full bg-emerald-900 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-50 shadow-sm">
                Live weather
              </span>
              <h1 className="text-4xl font-semibold text-slate-900 md:text-5xl">
                Plan with real conditions
              </h1>
              <p className="max-w-xl text-sm text-slate-600 md:text-base">
                Search any place in Bangladesh and get current conditions instantly.
              </p>
            </div>
            <div className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
              Powered by Open-Meteo
            </div>
          </header>

          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <section className="weather-fade-up weather-delay-1 rounded-3xl border border-emerald-100 bg-white/80 p-6 shadow-lg backdrop-blur md:p-8">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Search location</p>
                <h2 className="text-2xl font-bold text-slate-900">Check Weather</h2>
                <p className="text-sm text-slate-600">Type a place name and select a suggestion.</p>
              </div>
              <div className="mt-5">
                <div className="relative">
                  <input
                    value={query}
                    onChange={(e) => {
                      setQuery(e.target.value);
                      setSelected(null);
                    }}
                    placeholder="Search place name (e.g., Cox's Bazar)"
                    className="w-full rounded-2xl border border-emerald-100 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                  />
                  {loadingSuggest ? (
                    <div className="absolute right-3 top-3 text-xs text-slate-400">Searching...</div>
                  ) : null}
                </div>
                {suggestions.length ? (
                  <div className="mt-2 overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-sm">
                    {suggestions.map((item) => {
                      const label = [item.name, item.admin1, item.country].filter(Boolean).join(", ");
                      return (
                        <button
                          key={`${item.id}-${item.lat}-${item.lon}`}
                          onClick={() => {
                            setSelected(item);
                            setQuery(label);
                            setSuggestions([]);
                          }}
                          className="block w-full border-b border-emerald-50 px-4 py-2 text-left text-sm text-slate-700 hover:bg-emerald-50/60"
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                ) : null}
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <button
                    onClick={handleCheckWeather}
                    className="rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
                  >
                    Search
                  </button>
                  {selectedLabel ? (
                    <span className="text-xs font-semibold text-slate-500">Selected: {selectedLabel}</span>
                  ) : null}
                </div>
                {error ? <div className="mt-3 text-sm font-semibold text-rose-600">{error}</div> : null}
              </div>
            </section>

            <aside className="weather-fade-up weather-delay-2 rounded-3xl border border-emerald-100 bg-gradient-to-br from-emerald-900 via-emerald-700 to-emerald-600 p-6 text-white shadow-xl md:p-8">
              <div className="flex flex-col gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex w-fit rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide">
                    Right now
                  </span>
                  {weather?.current?.time ? (
                    <span className="text-xs text-emerald-100">
                      Updated {new Date(weather.current.time).toLocaleString()}
                    </span>
                  ) : null}
                </div>
                <h3 className="text-2xl font-semibold">
                  {weather?.current ? weather.location?.name || selected?.name || "Select a location" : "Select a location"}
                </h3>
                <p className="text-xs text-emerald-100">
                  {[weather?.location?.admin1, weather?.location?.country].filter(Boolean).join(", ") || "Bangladesh"}
                </p>
              </div>
              <div className="mt-8 rounded-3xl bg-white/10 p-5">
                {loadingWeather ? (
                  <div className="text-sm text-emerald-100">Loading weather...</div>
                ) : weather?.current ? (
                  <>
                    <div className="text-4xl font-semibold">
                      {Math.round(weather.current.temperature_2m)}°C
                    </div>
                    <div className="mt-2 text-sm text-emerald-100">
                      {weatherCodeLabel(weather.current.weather_code)}
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                      <div className="rounded-2xl bg-white/10 p-3">
                        <div className="text-emerald-100">Feels like</div>
                        <div className="text-base font-semibold">{Math.round(weather.current.apparent_temperature)}°C</div>
                      </div>
                      <div className="rounded-2xl bg-white/10 p-3">
                        <div className="text-emerald-100">Humidity</div>
                        <div className="text-base font-semibold">{weather.current.relative_humidity_2m}%</div>
                      </div>
                      <div className="rounded-2xl bg-white/10 p-3">
                        <div className="text-emerald-100">Wind</div>
                        <div className="text-base font-semibold">{weather.current.wind_speed_10m} km/h</div>
                      </div>
                      <div className="rounded-2xl bg-white/10 p-3">
                        <div className="text-emerald-100">Rain</div>
                        <div className="text-base font-semibold">{weather.current.precipitation} mm</div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-sm text-emerald-100">Search a location to see weather details.</div>
                )}
              </div>
            </aside>
          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
};

export default WeatherPage;
