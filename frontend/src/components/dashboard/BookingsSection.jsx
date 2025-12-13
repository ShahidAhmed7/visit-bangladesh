const BookingsSection = ({ bookings }) => (
  <section className="space-y-4 rounded-3xl bg-white p-6 shadow-lg md:p-8">
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Bookings</p>
      <h2 className="text-2xl font-bold text-slate-900">Your bookings</h2>
    </div>
    <div className="divide-y divide-emerald-50 rounded-2xl border border-emerald-100 shadow-sm">
      {bookings.map((b) => (
        <div key={b.id} className="grid gap-3 p-4 md:grid-cols-[2fr,1fr,1fr,1fr] md:items-center">
          <div>
            <p className="text-sm font-semibold text-slate-900">{b.hotel}</p>
            <p className="text-sm text-slate-600">{b.destination}</p>
          </div>
          <div className="text-sm text-slate-600">
            <p>Check-in: {b.checkIn}</p>
            <p>Check-out: {b.checkOut}</p>
          </div>
          <div>
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                b.status === "Confirmed" ? "bg-emerald-50 text-emerald-700" : b.status === "Pending" ? "bg-amber-50 text-amber-700" : "bg-rose-50 text-rose-700"
              }`}
            >
              {b.status}
            </span>
          </div>
          <div className="flex gap-2">
            <button className="rounded-full bg-emerald-600 px-3 py-2 text-xs font-semibold text-white shadow-sm">View on Booking.com</button>
            <button className="rounded-full border border-emerald-100 px-3 py-2 text-xs font-semibold text-emerald-700">Details</button>
          </div>
        </div>
      ))}
    </div>
  </section>
);

export default BookingsSection;
