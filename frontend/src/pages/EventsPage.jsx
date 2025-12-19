import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import EventsHero from "../components/events/EventsHero.jsx";
import EventFilters from "../components/events/EventFilters.jsx";
import EventsGrid from "../components/events/EventsGrid.jsx";
import { eventsAPI } from "../services/api/events.api.js";
import { useAuth } from "../context/AuthContext.jsx";
import useAsync from "../hooks/useAsync.js";

const EventsPage = () => {
  const { user } = useAuth();
  const [filters, setFilters] = useState({ type: "", division: "", district: "" });
  const { data: events = [], loading, run } = useAsync(async (params) => {
    const res = await eventsAPI.list(params);
    return res.data?.data || res.data || [];
  }, [], { initialData: [] });

  const fetchEvents = () =>
    run({
      type: filters.type || undefined,
      division: filters.division || undefined,
      district: filters.district || undefined,
    }).catch(() => toast.error("Failed to load events"));

  useEffect(() => {
    fetchEvents();
  }, [filters.type, filters.division, filters.district, run]);

  const canCreate = user?.role === "admin" || user?.role === "guide";
  const handleCreate = () => {
    window.location.href = "/events/new";
  };

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Navbar />
      <main className="pb-16 pt-24 md:pt-28">
        <EventsHero canCreate={canCreate} onCreate={handleCreate}>
          <EventFilters filters={filters} onChange={setFilters} />
        </EventsHero>

        <div className="mx-auto mt-8 max-w-6xl px-4 md:px-6">
          <EventsGrid events={events} loading={loading} />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default EventsPage;
