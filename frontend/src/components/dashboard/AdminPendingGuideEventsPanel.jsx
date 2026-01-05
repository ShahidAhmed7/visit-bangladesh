import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { eventsAPI } from "../../services/api/events.api.js";
import { formatDate } from "../../utils/format.js";

const AdminPendingGuideEventsPanel = () => {
  const [pendingGuideEvents, setPendingGuideEvents] = useState([]);
  const [pendingEventsLoading, setPendingEventsLoading] = useState(false);
  const [pendingEventsError, setPendingEventsError] = useState("");
  const [selectedPendingEvent, setSelectedPendingEvent] = useState(null);

  const loadPendingGuideEvents = async () => {
    setPendingEventsLoading(true);
    setPendingEventsError("");
    try {
      const res = await eventsAPI.adminList({ status: "pending" });
      const data = res.data?.data || res.data || [];
      const pendingGuidesOnly = (Array.isArray(data) ? data : []).filter(
        (event) => event.createdBy?.role === "guide"
      );
      setPendingGuideEvents(pendingGuidesOnly);
    } catch (err) {
      setPendingEventsError("Failed to load pending guide events.");
      setPendingGuideEvents([]);
    } finally {
      setPendingEventsLoading(false);
    }
  };

  useEffect(() => {
    loadPendingGuideEvents();
  }, []);

  const handlePendingDecision = async (eventId, action) => {
    try {
      if (action === "approve") await eventsAPI.approve(eventId);
      else await eventsAPI.reject(eventId);
      setPendingGuideEvents((prev) => prev.filter((event) => event._id !== eventId));
      if (selectedPendingEvent?._id === eventId) setSelectedPendingEvent(null);
      toast.success(action === "approve" ? "Event approved" : "Event rejected");
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to update event status";
      toast.error(msg);
    }
  };

  return (
    <div className="rounded-3xl border border-emerald-100 bg-white p-5 shadow-lg">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Pending Guide Events</h3>
          <p className="text-xs text-slate-600">Approve or reject events submitted by guides.</p>
        </div>
        <button
          onClick={loadPendingGuideEvents}
          className="rounded-full border border-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700"
        >
          Refresh
        </button>
      </div>

      {pendingEventsError ? (
        <p className="mt-3 text-sm text-rose-600">{pendingEventsError}</p>
      ) : null}

      {pendingEventsLoading ? (
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-4">
              <div className="h-4 w-2/3 rounded bg-emerald-100" />
              <div className="mt-2 h-3 w-1/2 rounded bg-emerald-50" />
            </div>
          ))}
        </div>
      ) : pendingGuideEvents.length ? (
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {pendingGuideEvents.map((ev) => (
            <div key={ev._id} className="rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-slate-900">{ev.title}</p>
                  <p className="text-xs text-slate-600">
                    {ev.createdBy?.name || "Guide"} - {formatDate(ev.startDate)}
                  </p>
                </div>
                <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">Pending</span>
              </div>
              <p className="mt-2 text-sm text-slate-600">{ev.description?.slice(0, 120)}...</p>
              <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold">
                <button
                  onClick={() => handlePendingDecision(ev._id, "approve")}
                  className="rounded-full bg-emerald-600 px-3 py-1 text-white"
                >
                  Approve
                </button>
                <button
                  onClick={() => handlePendingDecision(ev._id, "reject")}
                  className="rounded-full border border-emerald-100 px-3 py-1 text-emerald-700"
                >
                  Reject
                </button>
                <button
                  onClick={() => setSelectedPendingEvent(ev)}
                  className="rounded-full border border-emerald-100 px-3 py-1 text-emerald-700"
                >
                  View details
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-4 text-sm text-slate-600">No pending guide events.</p>
      )}

      {selectedPendingEvent ? (
        <div className="mt-6 rounded-2xl border border-emerald-100 bg-emerald-50/30 p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-bold text-slate-900">{selectedPendingEvent.title}</p>
              <p className="text-xs text-slate-600">
                Submitted by {selectedPendingEvent.createdBy?.name || "Guide"} - {formatDate(selectedPendingEvent.createdAt)}
              </p>
            </div>
            <button
              onClick={() => setSelectedPendingEvent(null)}
              className="rounded-full border border-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700"
            >
              Close
            </button>
          </div>
          <div className="mt-3 grid gap-3 text-sm text-slate-700 md:grid-cols-2">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Type</span>
              <p className="mt-1">{selectedPendingEvent.eventType}</p>
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Dates</span>
              <p className="mt-1">
                {formatDate(selectedPendingEvent.startDate)} - {formatDate(selectedPendingEvent.endDate)}
              </p>
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Location</span>
              <p className="mt-1">
                {[selectedPendingEvent.location?.district, selectedPendingEvent.location?.division]
                  .filter(Boolean)
                  .join(", ") || "Bangladesh"}
              </p>
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Status</span>
              <p className="mt-1">Pending</p>
            </div>
          </div>
          <div className="mt-4">
            <span className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Description</span>
            <p className="mt-2 text-sm text-slate-700">{selectedPendingEvent.description || "No description provided."}</p>
          </div>
          <div className="mt-4 flex gap-2 text-xs font-semibold">
            <button
              onClick={() => handlePendingDecision(selectedPendingEvent._id, "approve")}
              className="rounded-full bg-emerald-600 px-3 py-1 text-white"
            >
              Approve
            </button>
            <button
              onClick={() => handlePendingDecision(selectedPendingEvent._id, "reject")}
              className="rounded-full border border-emerald-100 px-3 py-1 text-emerald-700"
            >
              Reject
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default AdminPendingGuideEventsPanel;
