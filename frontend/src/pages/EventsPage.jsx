import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import EventCard from "../components/events/EventCard.jsx";
import { eventsAPI } from "../services/api/events.api.js";
import { useAuth } from "../context/AuthContext.jsx";
import heroImg from "../assets/images/pohela-boishakh-celebration-01.webp";

const typeFilters = [
  { value: "", label: "All" },
  { value: "tour", label: "Tours" },
  { value: "festival", label: "Festivals" },
];

const EventsPage = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ type: "", division: "", district: "" });

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await eventsAPI.list({
        type: filters.type || undefined,
        division: filters.division || undefined,
        district: filters.district || undefined,
      });
      setEvents(res.data?.data || res.data || []);
    } catch (err) {
      toast.error("Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [filters.type, filters.division, filters.district]);

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Navbar />
      <main className="pb-16 pt-24 md:pt-28">
        <div className="relative overflow-hidden rounded-none bg-slate-900 shadow-xl md:mx-auto md:max-w-6xl md:rounded-[32px]">
          <img src={heroImg} alt="Events hero" className="absolute inset-0 h-full w-full object-cover opacity-70" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 via-slate-900/75 to-emerald-900/65" />
          <div className="relative flex flex-col gap-6 px-6 py-10 text-white md:px-10 md:py-14">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="space-y-3">
                <p className="inline-flex w-fit items-center rounded-full bg-white/15 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-100 ring-1 ring-white/30">
                  Events & Festivals
                </p>
                <h1 className="max-w-4xl text-3xl font-bold md:text-5xl">Explore Bangladesh’s Most Exciting Events</h1>
                <p className="max-w-3xl text-sm md:text-base text-emerald-50">
                  Discover cultural festivals, guided tours, and celebrations happening across Bangladesh. Join, bookmark, and share your next adventure.
                </p>
              </div>
              {(user?.role === "admin" || user?.role === "guide") && (
                <button
                  onClick={() => (window.location.href = "/events/new")}
                  className="inline-flex items-center gap-2 rounded-full bg-white/90 px-5 py-3 text-sm font-semibold text-emerald-700 shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">+</span>
                  Create Event
                </button>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {typeFilters.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setFilters((prev) => ({ ...prev, type: f.value }))}
                  className={`rounded-full px-4 py-2 text-sm font-semibold shadow-sm transition ${
                    filters.type === f.value ? "bg-white text-emerald-700" : "bg-white/15 text-white ring-1 ring-white/30 hover:bg-white/20"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <div className="grid max-w-4xl gap-3 md:grid-cols-2">
              <input
                type="text"
                placeholder="Filter by division..."
                value={filters.division}
                onChange={(e) => setFilters((prev) => ({ ...prev, division: e.target.value }))}
                className="rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/80 outline-none focus:border-white focus:ring-2 focus:ring-white/50"
              />
              <input
                type="text"
                placeholder="Filter by district..."
                value={filters.district}
                onChange={(e) => setFilters((prev) => ({ ...prev, district: e.target.value }))}
                className="rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/80 outline-none focus:border-white focus:ring-2 focus:ring-white/50"
              />
            </div>
          </div>
        </div>

        <div className="mx-auto mt-8 max-w-6xl px-4 md:px-6">
          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-72 animate-pulse rounded-3xl bg-slate-100" />
              ))}
            </div>
          ) : events.length ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {events.map((ev) => (
                <EventCard key={ev._id} event={ev} />
              ))}
            </div>
          ) : (
            <div className="mt-8 rounded-3xl border border-emerald-100 bg-emerald-50 p-6 text-emerald-800 shadow-sm">
              No events found with current filters.
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default EventsPage;
