import { useEffect, useState } from "react";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import GuideCard from "../components/GuideCard.jsx";
import heroBg from "../assets/images/img9.jpeg";
import { guidesAPI } from "../services/api/guides.api.js";

const GuideCardSkeleton = () => (
  <div className="animate-pulse rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm">
    <div className="flex items-center gap-3">
      <div className="h-12 w-12 rounded-full bg-slate-200" />
      <div className="space-y-2">
        <div className="h-4 w-32 rounded bg-slate-200" />
        <div className="h-3 w-24 rounded bg-slate-200" />
      </div>
    </div>
    <div className="mt-4 h-3 w-full rounded bg-slate-200" />
    <div className="mt-2 h-3 w-5/6 rounded bg-slate-200" />
    <div className="mt-4 h-6 w-32 rounded-full bg-slate-200" />
  </div>
);

const GuidesPage = () => {
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchGuides = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await guidesAPI.list({ page: 1, limit: 24 });
      const data = res.data?.data?.guides || res.data?.guides || [];
      setGuides(Array.isArray(data) ? data : []);
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to load guides.";
      setError(msg);
      setGuides([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGuides();
  }, []);

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Navbar />
      <main className="pt-16 md:pt-20">
        <section className="relative h-[240px] w-full overflow-hidden md:h-[320px]">
          <img src={heroBg} alt="Bangladesh landscape" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/60" />
          <div className="relative mx-auto flex h-full max-w-6xl items-center px-4 md:px-6">
            <div className="space-y-2 text-white">
              <p className="text-sm uppercase tracking-[0.2em] text-emerald-100">Guides</p>
              <h1 className="text-3xl font-bold md:text-5xl">Meet trusted local guides</h1>
              <p className="max-w-xl text-sm text-emerald-50 md:text-base">
                Browse approved guides with experience, languages, and regional expertise.
              </p>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-16 pt-10 md:px-6">
          {error ? (
            <div className="rounded-2xl border border-rose-100 bg-rose-50 p-4 text-sm text-rose-700">{error}</div>
          ) : null}

          {loading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <GuideCardSkeleton key={index} />
              ))}
            </div>
          ) : guides.length ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {guides.map((guide) => (
                <GuideCard key={guide.id} guide={guide} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-8 text-center">
              <h3 className="text-lg font-semibold text-slate-800">No guides available yet</h3>
              <p className="mt-2 text-sm text-slate-600">Please check back after more guides are approved.</p>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default GuidesPage;
