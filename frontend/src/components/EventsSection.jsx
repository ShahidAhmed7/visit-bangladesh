const EventsSection = () => {
  return (
    <section className="mx-auto max-w-6xl px-4 pb-16 md:px-6">
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-2">
            <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-700 ring-1 ring-emerald-200">
              Events
            </span>
            <h2 className="text-3xl font-bold text-slate-900">Upcoming Events & Festivals</h2>
            <p className="text-sm text-slate-600">
              Stay updated on cultural events, traditional festivals, and travel highlights across Bangladesh.
            </p>
          </div>
        </div>
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="rounded-3xl border border-emerald-100 bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="h-28 rounded-2xl bg-emerald-50" />
              <div className="mt-4 space-y-2">
                <div className="h-4 w-2/3 rounded bg-emerald-100" />
                <div className="h-3 w-1/2 rounded bg-emerald-50" />
                <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                  Coming Soon
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default EventsSection;
