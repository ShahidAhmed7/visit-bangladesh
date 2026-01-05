import { Link } from "react-router-dom";
import { formatDate } from "../../utils/format.js";
import { resolveBlogImage, resolveSpotImage } from "../../utils/resolveSpotImage.js";

const BookmarksSection = ({ bookmarkTab, setBookmarkTab, bookmarkState, toggleBookmark, requestConfirm }) => (
  <section className="space-y-6 rounded-3xl bg-white p-6 shadow-lg md:p-8">
    <header className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Bookmarks</p>
        <h2 className="text-2xl font-bold text-slate-900">Your saved items</h2>
        <p className="text-sm text-slate-600">Spots and events you've saved.</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {["Tourist Spots", "Events"].map((tab) => (
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
      <>
        {bookmarkState.spots.length ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {bookmarkState.spots.map((spot) => {
              const spotId = spot.id ?? spot._id;
              return (
                <div key={spotId} className="flex flex-col rounded-2xl bg-white shadow-md ring-1 ring-emerald-100">
                <div className="h-32 w-full overflow-hidden rounded-t-2xl bg-emerald-50">
                  <div
                    className="h-full w-full bg-cover bg-center"
                    style={{ backgroundImage: `url(${resolveSpotImage(spot.image)})` }}
                  />
                </div>
                <div className="flex flex-1 flex-col gap-2 p-4">
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-100">
                      {spot.category}
                    </span>
                    <button
                      onClick={() => requestConfirm?.({ message: "Remove this bookmark?", action: () => toggleBookmark("spots", spotId) })}
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
                    <span>{spot.rating ? `Rating: ${spot.rating.toFixed(1)}` : "No ratings yet"}</span>
                    <Link to={`/spots/${spotId}`} className="rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold text-white">
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-6 text-sm text-slate-600">
            No saved tourist spots yet.
          </div>
        )}
      </>
    )}
    {bookmarkTab === "Events" && (
      <>
        {bookmarkState.events.length ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {bookmarkState.events.map((event) => {
              const eventId = event.id ?? event._id;
              const cover = resolveBlogImage(event.imageUrl);
              const dateLabel =
                event.startDate && event.endDate
                  ? `${formatDate(event.startDate)} - ${formatDate(event.endDate)}`
                  : event.startDate
                  ? formatDate(event.startDate)
                  : "Date coming soon";
              const locationText = [event.location?.district, event.location?.division].filter(Boolean).join(", ") || "Bangladesh";
              return (
                <div key={eventId} className="flex flex-col rounded-2xl bg-white shadow-md ring-1 ring-emerald-100">
                  <div className="h-32 w-full overflow-hidden rounded-t-2xl bg-emerald-50">
                    {cover ? (
                      <img src={cover} alt={event.title} className="h-full w-full object-cover" loading="lazy" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-emerald-700">No image</div>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col gap-2 p-4">
                    <div className="flex items-center justify-between">
                      <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-100">
                        {event.eventType === "festival" ? "Festival" : "Tour Event"}
                      </span>
                      <button
                        onClick={() => requestConfirm?.({ message: "Remove this bookmark?", action: () => toggleBookmark("events", eventId) })}
                        className="text-sm font-semibold text-rose-700 hover:text-rose-800"
                      >
                        Remove
                      </button>
                    </div>
                    <h3 className="text-base font-bold text-slate-900">{event.title}</h3>
                    <p className="text-xs text-slate-600">{dateLabel}</p>
                    <p className="text-sm text-slate-600">{locationText}</p>
                    <div className="mt-auto flex items-center justify-between text-sm font-semibold text-slate-700">
                      <span>Saved</span>
                      <Link to={`/events/${eventId}`} className="rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold text-white">
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-6 text-sm text-slate-600">
            No saved events yet.
          </div>
        )}
      </>
    )}
  </section>
);

export default BookmarksSection;
