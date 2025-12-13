import StatCard from "./StatCard.jsx";

const OverviewCard = ({ user, profile, stats, statsIcons }) => (
  <section className="rounded-3xl bg-emerald-100/60 p-6 shadow-lg ring-1 ring-emerald-100 md:p-8">
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-600 text-2xl font-bold text-white shadow-lg shadow-emerald-200">
          {user?.name?.[0]?.toUpperCase() || "U"}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{user?.name}</h1>
          <p className="text-sm text-slate-600">{user?.email}</p>
          <p className="text-sm text-slate-600">
            Country: {profile.location.country || "Not set"} • Language: {profile.language}
          </p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard icon={statsIcons.bookmarks} label="Bookmarks" value={stats.bookmarks} colorClass="text-emerald-700" />
        <StatCard icon={statsIcons.reviews} label="Reviews" value={stats.reviews} colorClass="text-amber-600" bgClass="bg-amber-50" />
        <StatCard icon={statsIcons.bookings} label="Bookings" value={stats.bookings} colorClass="text-cyan-600" bgClass="bg-cyan-50" />
        <StatCard icon={statsIcons.guides} label="Guides" value={stats.guides} colorClass="text-indigo-600" bgClass="bg-indigo-50" />
      </div>
    </div>
  </section>
);

export default OverviewCard;
