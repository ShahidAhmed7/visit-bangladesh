import { useEffect, useState } from "react";
import { HiLocationMarker } from "react-icons/hi";
import { useParams } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import { resolveSpotImage } from "../utils/resolveSpotImage.js";
import { spotsAPI } from "../services/api/spots.api.js";

const SpotDetailPage = () => {
  const { id } = useParams();
  const [spot, setSpot] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSpot = async () => {
      try {
        const res = await spotsAPI.getById(id);
        setSpot(res.data?.data || res.data);
      } catch (err) {
        console.error("Failed to load spot", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSpot();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white text-slate-900">
        <Navbar />
        <main className="mx-auto max-w-5xl px-4 py-24 md:px-6">Loading...</main>
      </div>
    );
  }

  if (!spot) {
    return (
      <div className="min-h-screen bg-white text-slate-900">
        <Navbar />
        <main className="mx-auto max-w-5xl px-4 py-24 md:px-6">Spot not found.</main>
      </div>
    );
  }

  const { name, category, location, images = [], description, googleMapsUrl } = spot;
  const mainImage = resolveSpotImage(images[0]);
  const locationText = [location?.district, location?.division].filter(Boolean).join(", ");

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 pb-16 pt-20 md:px-6 md:pt-24">
        <div className="overflow-hidden rounded-3xl border border-emerald-100 shadow-lg">
          <img src={mainImage} alt={name} className="h-72 w-full object-cover md:h-96" loading="lazy" />
          <div className="space-y-3 bg-white p-6 md:p-8">
            <div className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-700 ring-1 ring-emerald-200">
              {category}
            </div>
            <h1 className="text-3xl font-bold text-slate-900">{name}</h1>
            {locationText ? (
              <a
                href={googleMapsUrl || "#"}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 hover:text-emerald-800"
              >
                <HiLocationMarker className="h-5 w-5" />
                <span>{locationText}</span>
              </a>
            ) : null}
            {description ? <p className="text-slate-700 leading-relaxed">{description}</p> : null}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SpotDetailPage;
