import { useState } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { eventsAPI } from "../../services/api/events.api.js";
import { formatDate } from "../../utils/format.js";
import { resolveBlogImage } from "../../utils/resolveSpotImage.js";

const formatInputDate = (dateValue) => {
  if (!dateValue) return "";
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
};

const RegisteredSection = ({ role, registrations, guideEvents, onRefresh }) => {
  const [selected, setSelected] = useState(null);
  const [postponeEvent, setPostponeEvent] = useState(null);
  const [postponeDates, setPostponeDates] = useState({ startDate: "", endDate: "" });
  const [updatingEventId, setUpdatingEventId] = useState(null);
  const isGuide = role === "guide";

  const handleCancelEvent = async (event) => {
    if (!event?.id) return;
    if (!window.confirm("Cancel this event? It will be hidden from users.")) return;
    setUpdatingEventId(event.id);
    try {
      await eventsAPI.update(event.id, { status: "canceled" });
      toast.success("Event canceled");
      onRefresh?.();
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to cancel event";
      toast.error(msg);
    } finally {
      setUpdatingEventId(null);
    }
  };

  const openPostpone = (event) => {
    setPostponeEvent(event);
    setPostponeDates({
      startDate: formatInputDate(event?.startDate),
      endDate: formatInputDate(event?.endDate),
    });
  };

  const handlePostponeSave = async (eventObj) => {
    eventObj.preventDefault();
    if (!postponeEvent?.id) return;
    if (!postponeDates.startDate) {
      toast.error("Please choose a new start date.");
      return;
    }
    setUpdatingEventId(postponeEvent.id);
    try {
      const payload = { startDate: postponeDates.startDate };
      if (postponeDates.endDate) payload.endDate = postponeDates.endDate;
      await eventsAPI.update(postponeEvent.id, payload);
      toast.success("Event rescheduled");
      setPostponeEvent(null);
      onRefresh?.();
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to reschedule event";
      toast.error(msg);
    } finally {
      setUpdatingEventId(null);
    }
  };

  return (
    <section className="space-y-4 rounded-3xl bg-white p-6 shadow-lg md:p-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Registered</p>
        <h2 className="text-2xl font-bold text-slate-900">{isGuide ? "Event registrations" : "Your registrations"}</h2>
      </div>

      {isGuide ? (
        guideEvents.length ? (
          <div className="grid gap-4 md:grid-cols-2">
            {guideEvents.map((event) => (
              <div key={event.id} className="rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="h-14 w-14 overflow-hidden rounded-2xl bg-emerald-50">
                    {event.imageUrl ? (
                      <img src={resolveBlogImage(event.imageUrl)} alt={event.title} className="h-full w-full object-cover" />
                    ) : null}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-900">{event.title}</div>
                    <div className="text-xs text-slate-600">{formatDate(event.startDate)}</div>
                    {event.status === "canceled" ? (
                      <span className="mt-1 inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 ring-1 ring-slate-200">
                        Canceled
                      </span>
                    ) : null}
                  </div>
                </div>
                {event.registrations?.length ? (
                  <ol className="mt-3 space-y-1 text-sm text-slate-700">
                    {event.registrations.map((reg, idx) => (
                      <li key={reg.id} className="flex items-center gap-2">
                        <button
                          onClick={() => setSelected({ reg, event })}
                          className="text-sm font-semibold text-emerald-700 hover:underline"
                        >
                          {idx + 1}. {reg.fullName}
                        </button>
                      </li>
                    ))}
                  </ol>
                ) : (
                  <div className="mt-3 rounded-2xl border border-emerald-100 bg-emerald-50/40 p-3 text-xs text-slate-600">
                    No registrations yet.
                  </div>
                )}
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    onClick={() => openPostpone(event)}
                    disabled={event.status === "canceled" || updatingEventId === event.id}
                    className="rounded-full border border-emerald-200 px-3 py-1 text-xs font-semibold text-emerald-700 disabled:opacity-60"
                  >
                    Postpone
                  </button>
                  <button
                    onClick={() => handleCancelEvent(event)}
                    disabled={event.status === "canceled" || updatingEventId === event.id}
                    className="rounded-full border border-rose-200 px-3 py-1 text-xs font-semibold text-rose-700 disabled:opacity-60"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-6 text-sm text-slate-600">
            No registrations for your events yet.
          </div>
        )
      ) : registrations.length ? (
        <div className="grid gap-4 md:grid-cols-2">
          {registrations.map((item) => (
            <div key={item.id} className="flex flex-col gap-3 rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="h-14 w-14 overflow-hidden rounded-2xl bg-emerald-50">
                  {item.event?.imageUrl ? (
                    <img src={resolveBlogImage(item.event.imageUrl)} alt={item.event?.title} className="h-full w-full object-cover" />
                  ) : null}
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-900">{item.event?.title || "Event"}</div>
                  <div className="text-xs text-slate-600">
                    {formatDate(item.event?.startDate)} {item.event?.endDate ? `- ${formatDate(item.event.endDate)}` : ""}
                  </div>
                </div>
              </div>
              <div className="text-xs text-slate-600">
                People: {item.peopleCount || 1} - Registered on {formatDate(item.createdAt)}
              </div>
              <div className="text-xs text-slate-600">
                Organizer: {item.event?.organizer?.name || "N/A"}
              </div>
              <div className="text-xs text-slate-600">
                Email: {item.event?.organizer?.email || "Not available"}
              </div>
              <div className="text-xs text-slate-600">
                Phone: {item.event?.organizer?.phone || "Not available"}
              </div>
              <div>
                <Link to={`/events/${item.event?.id}`} className="text-sm font-semibold text-emerald-700 hover:underline">
                  View event details
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-6 text-sm text-slate-600">
          You have not registered for any events yet.
        </div>
      )}

      {selected ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Registration details</p>
                <h3 className="text-xl font-bold text-slate-900">{selected.event?.title}</h3>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600"
              >
                Close
              </button>
            </div>
            <div className="mt-4 space-y-2 text-sm text-slate-700">
              <div><span className="font-semibold">Name:</span> {selected.reg.fullName}</div>
              <div><span className="font-semibold">Email:</span> {selected.reg.email}</div>
              <div><span className="font-semibold">Contact:</span> {selected.reg.contactNumber}</div>
              <div><span className="font-semibold">Age:</span> {selected.reg.age}</div>
              <div><span className="font-semibold">Sex:</span> {selected.reg.sex}</div>
              <div><span className="font-semibold">People:</span> {selected.reg.peopleCount}</div>
              <div><span className="font-semibold">NID:</span> {selected.reg.nidNumber}</div>
              <div><span className="font-semibold">Registered:</span> {formatDate(selected.reg.createdAt)}</div>
            </div>
          </div>
        </div>
      ) : null}

      {postponeEvent ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Postpone event</p>
                <h3 className="text-xl font-bold text-slate-900">{postponeEvent.title}</h3>
              </div>
              <button
                onClick={() => setPostponeEvent(null)}
                className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600"
              >
                Close
              </button>
            </div>
            <form onSubmit={handlePostponeSave} className="mt-4 space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">New start date</label>
                <input
                  type="date"
                  value={postponeDates.startDate}
                  onChange={(e) => setPostponeDates((prev) => ({ ...prev, startDate: e.target.value }))}
                  className="w-full rounded-2xl border border-emerald-100 px-3 py-2 text-sm"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">New end date (optional)</label>
                <input
                  type="date"
                  value={postponeDates.endDate}
                  onChange={(e) => setPostponeDates((prev) => ({ ...prev, endDate: e.target.value }))}
                  className="w-full rounded-2xl border border-emerald-100 px-3 py-2 text-sm"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setPostponeEvent(null)}
                  className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updatingEventId === postponeEvent.id}
                  className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-70"
                >
                  {updatingEventId === postponeEvent.id ? "Saving..." : "Save dates"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </section>
  );
};

export default RegisteredSection;
