import { useEffect, useMemo, useState } from "react";
import { FiSearch } from "react-icons/fi";
import { useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import SpotCard from "../components/SpotCard.jsx";
import heroBg from "../assets/images/tour-img05.jpg";
import Footer from "../components/Footer.jsx";
import { spotsAPI } from "../services/api/spots.api.js";
import SpotsFilters from "../components/spots/SpotsFilters.jsx";
import SkeletonSpotCard from "../components/spots/SkeletonSpotCard.jsx";
import Pagination from "../components/spots/Pagination.jsx";
import { DIVISIONS } from "../utils/divisions.js";

const SpotsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState(() => ({
    q: searchParams.get("q") || "",
    categories: searchParams.get("categories") ? searchParams.get("categories").split(",") : [],
    division: searchParams.get("division") || "",
    district: searchParams.get("district") || "",
    minRating: searchParams.get("minRating") || "",
    sort: searchParams.get("sort") || "newest",
    page: Number(searchParams.get("page") || 1),
    limit: Number(searchParams.get("limit") || 12),
  }));

  const [spots, setSpots] = useState([]);
  const [meta, setMeta] = useState({ page: 1, limit: 12, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const params = {};
    if (filters.q) params.q = filters.q;
    if ((filters.categories || []).length) params.categories = filters.categories.join(",");
    if (filters.division) params.division = filters.division;
    if (filters.district) params.district = filters.district;
    if (filters.minRating) params.minRating = filters.minRating;
    if (filters.sort) params.sort = filters.sort;
    if (filters.page) params.page = filters.page;
    if (filters.limit) params.limit = filters.limit;
    setSearchParams(params, { replace: true });
  }, [filters, setSearchParams]);

  useEffect(() => {
    const handle = setTimeout(() => fetchSpots(), 350);
    return () => clearTimeout(handle);
  }, [filters.q, filters.categories, filters.division, filters.district, filters.minRating, filters.sort, filters.page, filters.limit]);

  const fetchSpots = async () => {
    setLoading(true);
    try {
      const params = {
        q: filters.q || undefined,
        categories: (filters.categories || []).length ? filters.categories.join(",") : undefined,
        division: filters.division || undefined,
        district: filters.district || undefined,
        minRating: filters.minRating || undefined,
        sort: filters.sort || undefined,
        page: filters.page || 1,
        limit: filters.limit || 12,
      };
      const res = await spotsAPI.getAll(params);
      const data = Array.isArray(res.data?.data) ? res.data.data : [];
      setSpots(data);
      setMeta(res.data?.meta || { page: 1, limit: 12, total: 0, totalPages: 0 });
    } catch (err) {
      console.error("Failed to load spots", err);
      setSpots([]);
      setMeta({ page: 1, limit: 12, total: 0, totalPages: 0 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSpots();
  }, []);

  const onClear = () => setFilters({ q: "", categories: [], division: "", district: "", minRating: "", sort: "newest", page: 1, limit: 12 });

  const onPage = (p) => setFilters((f) => ({ ...f, page: p }));

  const activeChips = useMemo(() => {
    const chips = [];
    if (filters.q) chips.push({ label: `"${filters.q}"`, onRemove: () => setFilters((f) => ({ ...f, q: "" })) });
    (filters.categories || []).forEach((c) => chips.push({ label: c, onRemove: () => setFilters((f) => ({ ...f, categories: (f.categories || []).filter((x) => x !== c) })) }));
    if (filters.division) chips.push({ label: filters.division, onRemove: () => setFilters((f) => ({ ...f, division: "", district: "" })) });
    if (filters.district) chips.push({ label: filters.district, onRemove: () => setFilters((f) => ({ ...f, district: "" })) });
    if (filters.minRating) chips.push({ label: `${filters.minRating}+`, onRemove: () => setFilters((f) => ({ ...f, minRating: "" })) });
    return chips;
  }, [filters]);

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
                  value={filters.q}
                  onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value, page: 1 }))}
                  placeholder="Search destinations"
                  className="w-full bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
                />
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setFilters((f) => ({ ...f, page: 1 }))}
                  className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-[320px_1fr]">
            <aside className="hidden md:block">
              <div className="sticky top-24 rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm">
                <SpotsFilters filters={filters} setFilters={setFilters} divisions={DIVISIONS} onClear={onClear} />
              </div>
            </aside>

            <div>
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {activeChips.map((c) => (
                    <button
                      key={c.label}
                      onClick={c.onRemove}
                      className="rounded-full bg-emerald-50 px-3 py-1 text-sm text-emerald-700"
                    >
                      {c.label} &times;
                    </button>
                  ))}
                </div>

                <div className="text-sm text-slate-600">{meta.total || 0} results</div>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <SkeletonSpotCard key={i} />
                  ))}
                </div>
              ) : spots.length ? (
                <>
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                    {spots.map((spot) => (
                      <SpotCard key={spot._id} spot={spot} />
                    ))}
                  </div>

                  <Pagination page={meta.page} totalPages={meta.totalPages} onPage={onPage} />
                </>
              ) : (
                <div className="rounded-2xl border border-emerald-100 bg-white p-8 text-center">
                  <h3 className="text-lg font-semibold">No results</h3>
                  <p className="mt-2 text-sm text-slate-600">Try clearing filters or search terms.</p>
                  <div className="mt-4">
                    <button onClick={onClear} className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white">Clear filters</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default SpotsPage;
