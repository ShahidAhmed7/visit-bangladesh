const BookmarksSection = ({ bookmarkTab, setBookmarkTab, bookmarkState, toggleBookmark, requestConfirm }) => (
  <section className="space-y-6 rounded-3xl bg-white p-6 shadow-lg md:p-8">
    <header className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Bookmarks</p>
        <h2 className="text-2xl font-bold text-slate-900">Your saved items</h2>
        <p className="text-sm text-slate-600">Spots, hotels, and guides you’ve saved.</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {["Tourist Spots", "Hotels", "Guides"].map((tab) => (
          <button
            key={tab}
            onClick={() => setBookmarkTab(tab)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              bookmarkTab === tab ? "bg-emerald-600 text-white shadow-sm" : "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
    </header>
    {bookmarkTab === "Tourist Spots" && (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {bookmarkState.spots.map((spot) => (
          <div key={spot.id} className="flex flex-col rounded-2xl bg-white shadow-md ring-1 ring-emerald-100">
            <div className="h-32 w-full overflow-hidden rounded-t-2xl bg-emerald-50">
              <div className="h-full w-full bg-cover bg-center" style={{ backgroundImage: `url(${spot.image})` }} />
            </div>
            <div className="flex flex-1 flex-col gap-2 p-4">
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-100">{spot.category}</span>
                <button
                  onClick={() => requestConfirm?.({ message: "Remove this bookmark?", action: () => toggleBookmark("spots", spot.id) })}
                  className="text-sm font-semibold text-rose-700 hover:text-rose-800"
                >
                  Remove
                </button>
              </div>
              <h3 className="text-base font-bold text-slate-900">{spot.name}</h3>
              <p className="text-sm text-slate-600">
                {spot.district}, {spot.division}
              </p>
              <div className="mt-auto flex items-center justify-between text-sm font-semibold text-slate-700">
                <span>⭐ {spot.rating}</span>
                <button className="rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold text-white">View Details</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    )}
    {bookmarkTab === "Hotels" && (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {bookmarkState.hotels.map((hotel) => (
          <div key={hotel.id} className="flex flex-col gap-2 rounded-2xl bg-white p-4 shadow-md ring-1 ring-emerald-100">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">{hotel.name}</h3>
              <span className="text-sm font-semibold text-slate-600">{hotel.rating} ★</span>
            </div>
            <p className="text-sm text-slate-600">{hotel.location}</p>
            <div className="mt-auto flex items-center justify-between">
              <button className="rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold text-white shadow-sm">Check on Booking.com</button>
              <button
                onClick={() => requestConfirm?.({ message: "Remove this hotel bookmark?", action: () => toggleBookmark("hotels", hotel.id) })}
                className="text-sm font-semibold text-rose-700 hover:text-rose-800"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    )}
    {bookmarkTab === "Guides" && (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {bookmarkState.guides.map((guide) => (
          <div key={guide.id} className="flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-md ring-1 ring-emerald-100">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-lg font-bold text-emerald-700">
                {guide.name[0]}
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">{guide.name}</h3>
                <p className="text-sm text-slate-600">{guide.city}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 text-xs font-semibold text-emerald-700">
              {guide.languages.map((lang) => (
                <span key={lang} className="rounded-full bg-emerald-50 px-2 py-1 ring-1 ring-emerald-200">
                  {lang}
                </span>
              ))}
            </div>
            <div className="mt-auto flex items-center justify-between text-sm font-semibold text-slate-700">
              <span>⭐ {guide.rating}</span>
              <div className="flex gap-2">
                <button className="rounded-full bg-emerald-600 px-3 py-1 text-xs text-white shadow-sm">View Guide</button>
                <button
                  onClick={() => requestConfirm?.({ message: "Unfollow this guide?", action: () => toggleBookmark("guides", guide.id) })}
                  className="rounded-full border border-rose-200 px-3 py-1 text-xs text-rose-700 hover:bg-rose-50"
                >
                  Unfollow
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    )}
  </section>
);

export default BookmarksSection;
