const GuidesSection = ({ guides }) => (
  <section className="space-y-4 rounded-3xl bg-white p-6 shadow-lg md:p-8">
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Guides</p>
      <h2 className="text-2xl font-bold text-slate-900">Followed guides</h2>
    </div>
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {guides.map((guide) => (
        <div key={guide.id} className="space-y-2 rounded-2xl bg-white p-4 shadow-md ring-1 ring-emerald-100">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-lg font-bold text-emerald-700">
              {guide.name[0]}
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900">{guide.name}</div>
              <div className="text-xs text-slate-600">{guide.city}</div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 text-xs font-semibold text-emerald-700">
            {guide.languages.map((lang) => (
              <span key={lang} className="rounded-full bg-emerald-50 px-2 py-1 ring-1 ring-emerald-200">
                {lang}
              </span>
            ))}
          </div>
          <div className="flex items-center justify-between text-sm font-semibold text-slate-700">
            <span>⭐ {guide.rating}</span>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs text-emerald-700 ring-1 ring-emerald-100">Following</span>
          </div>
          <div className="flex gap-2">
            <button className="rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold text-white shadow-sm">View Guide</button>
            <button className="rounded-full border border-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">Unfollow</button>
          </div>
        </div>
      ))}
    </div>
  </section>
);

export default GuidesSection;
