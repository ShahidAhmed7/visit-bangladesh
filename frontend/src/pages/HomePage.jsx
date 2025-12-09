import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import HeroSection from "../components/HeroSection.jsx";
import Navbar from "../components/Navbar.jsx";
import SpotCard from "../components/SpotCard.jsx";
import api from "../utils/apiClient.js";
import BlogCard from "../components/BlogCard.jsx";
import EventsSection from "../components/EventsSection.jsx";
import NewsletterSection from "../components/NewsletterSection.jsx";
import Footer from "../components/Footer.jsx";

const HomePage = () => {
  const [spots, setSpots] = useState([]);
  const [blogs, setBlogs] = useState([]);

  useEffect(() => {
    const fetchSpots = async () => {
      try {
        const res = await api.get("/api/spots");
        const data = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data?.spots)
            ? res.data.spots
            : [];
        setSpots(data);
      } catch (err) {
        console.error("Failed to load spots", err);
        setSpots([]);
      }
    };
    fetchSpots();
  }, []);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const res = await api.get("/api/blogs");
        setBlogs(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Failed to load blogs", err);
        setBlogs([]);
      }
    };
    fetchBlogs();
  }, []);

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Navbar />
      <main className="pt-6 md:pt-10">
        <HeroSection />
        <section className="mx-auto mt-12 max-w-6xl px-4 pb-16 md:mt-16 md:px-6">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-2">
              <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-700 ring-1 ring-emerald-200">
                Explore Bangladesh
              </span>
              <h2 className="text-3xl font-bold text-slate-900">Featured Destinations</h2>
            </div>
            <Link
              to="/spots"
              className="hidden rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 md:inline-flex"
            >
              View All Destinations
            </Link>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {(spots || []).slice(0, 4).map((spot) => (
              <SpotCard key={spot._id} spot={spot} />
            ))}
          </div>

          <div className="mt-8 flex justify-center md:hidden">
            <Link
              to="/spots"
              className="rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
            >
              View All Destinations
            </Link>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-16 md:px-6">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-2">
              <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-700 ring-1 ring-emerald-200">
                Travel Stories
              </span>
              <h2 className="text-3xl font-bold text-slate-900">Latest Stories From Travelers</h2>
            </div>
            <Link
              to="/blogs"
              className="hidden rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 md:inline-flex"
            >
              View All Stories
            </Link>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {(blogs || []).slice(0, 3).map((blog) => (
              <BlogCard
                key={blog._id}
                blog={blog}
                onDelete={(idToRemove) => setBlogs((prev) => prev.filter((b) => b._id !== idToRemove))}
              />
            ))}
            {blogs.length === 0 ? (
              <div className="col-span-full rounded-3xl border border-emerald-100 bg-white px-6 py-10 text-center shadow-sm">
                <p className="text-lg font-semibold text-slate-800">No stories yet.</p>
                <p className="text-sm text-slate-600">Be the first to share your journey.</p>
              </div>
            ) : null}
          </div>

          <div className="mt-8 flex justify-center md:hidden">
            <Link
              to="/blogs"
              className="rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
            >
              View All Stories
            </Link>
          </div>
        </section>

        <EventsSection />

        <NewsletterSection />
      </main>
      <Footer />
    </div>
  );
};

export default HomePage;
