import { useEffect, useState } from "react";
import EventCard from "./events/EventCard.jsx";
import { eventsAPI } from "../services/api/events.api.js";
import { getEventStatus } from "../utils/format.js";

const EventsSection = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await eventsAPI.list();
        const data = res.data?.data || res.data || [];
        const upcoming = (Array.isArray(data) ? data : [])
          .filter((ev) => getEventStatus(ev.startDate, ev.endDate) === "upcoming")
          .sort((a, b) => new Date(a.startDate || a.createdAt) - new Date(b.startDate || b.createdAt))
          .slice(0, 4);
        setEvents(upcoming);
      } catch (err) {
        setError("Failed to load upcoming events.");
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  return (
    <section className="mx-auto max-w-6xl px-4 pb-16 md:px-6">
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-2">
            <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-700 ring-1 ring-emerald-200">
              Events
            </span>
            <h2 className="text-3xl font-bold text-slate-900">Upcoming Events & Festivals</h2>
            <p className="text-sm text-slate-600">
              Stay updated on cultural events, traditional festivals, and travel highlights across Bangladesh.
            </p>
          </div>
        </div>

        {error ? <p className="text-sm text-rose-600">{error}</p> : null}

        {loading ? (
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="rounded-3xl border border-emerald-100 bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="h-28 rounded-2xl bg-emerald-50" />
                <div className="mt-4 space-y-2">
                  <div className="h-4 w-2/3 rounded bg-emerald-100" />
                  <div className="h-3 w-1/2 rounded bg-emerald-50" />
                  <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                    Loading
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : events.length ? (
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {events.map((ev) => (
              <EventCard key={ev._id} event={ev} />
            ))}
          </div>
        ) : (
          <div className="mt-6 rounded-3xl border border-emerald-100 bg-white p-6 text-sm text-slate-600 shadow-sm">
            No upcoming events right now. Check back soon.
          </div>
        )}
      </div>
    </section>
  );
};

export default EventsSection;
