import { useEffect, useState } from "react";
import { FiSearch } from "react-icons/fi";
import Navbar from "../components/Navbar.jsx";
import SpotCard from "../components/SpotCard.jsx";
import heroBg from "../assets/images/tour-img05.jpg";
import Footer from "../components/Footer.jsx";
import { spotsAPI } from "../services/api/spots.api.js";

const SpotsPage = () => {
  const [spots, setSpots] = useState([]);

  useEffect(() => {
    const fetchSpots = async () => {
      try {
        const res = await spotsAPI.getAll();
        const data = Array.isArray(res.data?.data) ? res.data.data : Array.isArray(res.data) ? res.data : [];
        setSpots(data);
      } catch (err) {
        console.error("Failed to load spots", err);
        setSpots([]);
      }
    };
    fetchSpots();
  }, []);

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Navbar />
      <main className="pt-16 md:pt-20">
        <section className="relative h-[300px] w-full overflow-hidden md:h-[400px]">
          <img src={heroBg} alt="Bangladesh landscape" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/60" />
          <div className="relative mx-auto flex h-full max-w-6xl items-center justify-center px-4 text-center md:px-6">
            <div className="space-y-3 text-white">
              <h1 className="text-3xl font-bold md:text-5xl">Explore All Destinations</h1>
              <p className="max-w-2xl text-sm text-emerald-50 md:text-base">
                Discover the rivers, hills, forests, and heritage of Bangladesh — curated in one place.
              </p>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-16 pt-10 md:px-6">
          <div className="mb-6 rounded-2xl border border-emerald-100 bg-white px-4 py-3 shadow-sm md:px-6 md:py-4">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_auto] md:items-center">
              <div className="flex items-center gap-3 rounded-xl border border-emerald-100 px-4 py-3 shadow-sm">
                <FiSearch className="h-5 w-5 text-emerald-600" />
                <input
                  type="text"
                  placeholder="Search destinations (coming soon)"
                  className="w-full bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
                />
              </div>
              <button
                disabled
                className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-80"
              >
                Filters coming soon
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {(spots || []).map((spot) => (
              <SpotCard key={spot._id} spot={spot} />
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default SpotsPage;
