import { FiSearch } from "react-icons/fi";

const Tabs = {
  ALL: "all",
  MINE: "mine",
  LIKED: "liked",
};

export const BlogTabsEnum = Tabs;

const BlogTabs = ({ tab, setTab, search, setSearch, sort, setSort }) => {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        {[Tabs.ALL, Tabs.MINE, Tabs.LIKED].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              tab === t ? "bg-emerald-600 text-white shadow-md" : "bg-emerald-50 text-emerald-700"
            }`}
          >
            {t === Tabs.ALL ? "All Stories" : t === Tabs.MINE ? "My Stories" : "Liked Stories"}
          </button>
        ))}
      </div>

      <div className="grid gap-3 md:grid-cols-[2fr,1fr]">
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-100 px-3 py-2 shadow-sm">
          <FiSearch className="h-5 w-5 text-emerald-600" />
          <input
            type="text"
            placeholder="Search stories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
          />
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="rounded-2xl border border-emerald-100 px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
        >
          <option value="latest">Sort by: Latest</option>
          <option value="oldest">Sort by: Oldest</option>
          <option value="liked">Sort by: Most liked</option>
        </select>
      </div>
    </div>
  );
};

export default BlogTabs;
