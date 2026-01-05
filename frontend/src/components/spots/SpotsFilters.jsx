import { useEffect } from "react";

const categories = ["Nature", "Heritage", "Beach", "Hill", "Spiritual"];

const SpotsFilters = ({ filters, setFilters, divisions = {}, onClear }) => {
  useEffect(() => {
    // ensure arrays are initialized
    if (!filters.categories) setFilters((f) => ({ ...f, categories: [] }));
  }, []);

  const toggleCategory = (cat) => {
    const cur = new Set(filters.categories || []);
    if (cur.has(cat)) cur.delete(cat);
    else cur.add(cat);
    setFilters((f) => ({ ...f, categories: Array.from(cur) }));
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-slate-700">Search</label>
        <input
          type="text"
          value={filters.q || ""}
          onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value }))}
          placeholder="Search by name or description"
          className="mt-1 w-full rounded-md border border-emerald-100 px-3 py-2 text-sm outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">Categories</label>
        <div className="mt-2 flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => toggleCategory(cat)}
              className={`rounded-full px-3 py-1 text-sm ring-1 ${
                (filters.categories || []).includes(cat)
                  ? "bg-emerald-600 text-white ring-emerald-600"
                  : "bg-white text-slate-700 ring-emerald-100"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">Location</label>
        <div className="mt-2 flex gap-2">
          <select
            className="rounded-md border border-emerald-100 px-3 py-2 text-sm outline-none"
            value={filters.division || ""}
            onChange={(e) => setFilters((f) => ({ ...f, division: e.target.value, district: "" }))}
          >
            <option value="">All divisions</option>
            {Object.keys(divisions).map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>

          <select
            className="rounded-md border border-emerald-100 px-3 py-2 text-sm outline-none"
            value={filters.district || ""}
            onChange={(e) => setFilters((f) => ({ ...f, district: e.target.value }))}
            disabled={!filters.division}
          >
            <option value="">All districts</option>
            {(divisions[filters.division] || []).map((dist) => (
              <option key={dist} value={dist}>{dist}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">Rating</label>
        <select
          className="mt-1 rounded-md border border-emerald-100 px-3 py-2 text-sm outline-none"
          value={filters.minRating || ""}
          onChange={(e) => setFilters((f) => ({ ...f, minRating: e.target.value }))}
        >
          <option value="">Any</option>
          <option value="3">3+</option>
          <option value="4">4+</option>
          <option value="4.5">4.5+</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">Sort</label>
        <select
          className="mt-1 rounded-md border border-emerald-100 px-3 py-2 text-sm outline-none"
          value={filters.sort || "newest"}
          onChange={(e) => setFilters((f) => ({ ...f, sort: e.target.value }))}
        >
          <option value="newest">Newest</option>
          <option value="rating_desc">Top rated</option>
          <option value="most_reviewed">Most reviewed</option>
        </select>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onClear()}
          className="rounded-full bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700"
        >
          Clear filters
        </button>
      </div>
    </div>
  );
};

export default SpotsFilters;
