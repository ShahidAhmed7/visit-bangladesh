import { useEffect, useMemo, useState } from "react";
import { HiCheckCircle, HiExclamation, HiLocationMarker, HiOutlineBookmark, HiOutlineCalendar, HiOutlineSparkles, HiOutlineStar, HiShieldCheck, HiTrash } from "react-icons/hi";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { eventsAPI } from "../services/api/events.api.js";
import { formatDate, getEventStatus } from "../utils/format.js";
import { resolveBlogImage } from "../utils/resolveSpotImage.js";
import ConfirmModal from "../components/dashboard/ConfirmModal.jsx";
import { usersAPI } from "../services/api/users.api.js";
import ChatPanel from "../components/chat/ChatPanel.jsx";

const typeMeta = {
  tour: { label: "Tour Event", pill: "bg-emerald-50 text-emerald-700", icon: HiOutlineSparkles },
  festival: { label: "Festival", pill: "bg-purple-50 text-purple-700", icon: HiOutlineSparkles },
};

const statusMeta = {
  approved: { label: "Approved", className: "bg-emerald-50 text-emerald-700 ring-emerald-100" },
  pending: { label: "Pending", className: "bg-amber-50 text-amber-700 ring-amber-100" },
  rejected: { label: "Rejected", className: "bg-rose-50 text-rose-700 ring-rose-100" },
  canceled: { label: "Canceled", className: "bg-slate-100 text-slate-700 ring-slate-200" },
};

const badge = (meta) => `inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold shadow-sm ring-1 ${meta}`;

const EventDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [activeChatId, setActiveChatId] = useState("");
  const [registerForm, setRegisterForm] = useState({
    fullName: "",
    email: "",
    contactNumber: "",
    age: "",
    sex: "",
    peopleCount: 1,
    nidNumber: "",
    termsAccepted: false,
  });

  const cover = resolveBlogImage(event?.imageUrl);
  const meta = typeMeta[event?.eventType] || typeMeta.tour;
  const status = statusMeta[event?.status] || statusMeta.pending;
  const isAdmin = user?.role === "admin";
  const isCreator = user && event?.createdBy && String(event.createdBy._id || event.createdBy.id) === String(user.id);
  const canView = event?.status === "approved" || isAdmin || isCreator;
  const [confirmAction, setConfirmAction] = useState(null);
  const eventStatus = getEventStatus(event?.startDate, event?.endDate);
  const canRegister = eventStatus === "upcoming" && event?.status === "approved";

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await eventsAPI.getById(id);
        setEvent(res.data?.data || res.data);
      } catch (err) {
        toast.error("Failed to load event");
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  useEffect(() => {
    if (!user) return;
    setRegisterForm((prev) => ({
      ...prev,
      fullName: prev.fullName || user.name || "",
      email: prev.email || user.email || "",
    }));
  }, [user]);

  useEffect(() => {
    const loadRegistrationState = async () => {
      if (!user || !event?._id) {
        setIsRegistered(false);
        return;
      }
      try {
        const res = await usersAPI.getRegistrations();
        const items = res.data?.data?.registrations || res.data?.registrations || [];
        const match = items.some((item) => String(item.event?.id || item.event?._id) === String(event._id));
        setIsRegistered(match);
      } catch (err) {
        setIsRegistered(false);
      }
    };
    loadRegistrationState();
  }, [user, event?._id]);

  const isInterested = useMemo(() => {
    if (!event || !user) return false;
    return (event.interestedUsers || []).map(String).includes(String(user.id));
  }, [event, user]);

  const isBookmarked = useMemo(() => {
    if (!event || !user) return false;
    return (event.bookmarkedBy || []).map(String).includes(String(user.id));
  }, [event, user]);

  const handleToggle = async (field, apiCall) => {
    if (!user) {
      navigate("/login");
      return;
    }
    const optimistic = { ...event };
    const arr = new Set((optimistic[field] || []).map(String));
    if (arr.has(String(user.id))) arr.delete(String(user.id));
    else arr.add(String(user.id));
    optimistic[field] = Array.from(arr);
    setEvent(optimistic);
    try {
      const res = await apiCall(id);
      setEvent(res.data?.data || res.data);
      toast.success(field === "interestedUsers" ? "Interest updated" : "Bookmark updated");
    } catch (err) {
      toast.error("Action failed");
      setEvent(event); // revert
    }
  };

  const handleApprove = async (action) => {
    try {
      const res = await eventsAPI[action](id);
      setEvent(res.data?.data || res.data);
      toast.success(`Event ${action === "approve" ? "approved" : "rejected"}`);
    } catch (err) {
      toast.error("Update failed");
    }
  };

  const handleComment = async () => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (!commentText.trim()) return;
    setSubmitting(true);
    try {
      const res = await eventsAPI.addComment(id, commentText.trim());
      setEvent(res.data?.data || res.data);
      setCommentText("");
      toast.success("Comment added");
    } catch (err) {
      toast.error("Failed to comment");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (eventObj) => {
    eventObj.preventDefault();
    if (!user) {
      toast.error("Please log in to register.");
      navigate("/login");
      return;
    }
    const payload = {
      fullName: registerForm.fullName.trim(),
      email: registerForm.email.trim(),
      contactNumber: registerForm.contactNumber.trim(),
      age: Number(registerForm.age),
      sex: registerForm.sex,
      peopleCount: Number(registerForm.peopleCount),
      nidNumber: registerForm.nidNumber.trim(),
      termsAccepted: registerForm.termsAccepted,
    };
    if (
      !payload.fullName ||
      !payload.email ||
      !payload.contactNumber ||
      !payload.age ||
      !payload.sex ||
      !payload.peopleCount ||
      !payload.nidNumber
    ) {
      toast.error("Please fill out all fields.");
      return;
    }
    if (payload.peopleCount < 1 || payload.peopleCount > 5) {
      toast.error("People count must be between 1 and 5.");
      return;
    }
    if (!payload.termsAccepted) {
      toast.error("You must agree to the terms and conditions.");
      return;
    }
    setRegistering(true);
    try {
      const res = await eventsAPI.register(id, payload);
      toast.success("Registration submitted.");
      setIsRegistered(true);
      setShowRegister(false);
      const chatThreadId = res.data?.data?.chatThreadId || res.data?.chatThreadId || "";
      setActiveChatId(chatThreadId);
      setShowChat(true);
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to register.";
      toast.error(msg);
    } finally {
      setRegistering(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white text-slate-900">
        <Navbar />
        <main className="mx-auto max-w-6xl px-4 pb-16 pt-24 md:px-6 md:pt-28">
          <div className="grid gap-4 lg:grid-cols-[360px,1fr]">
            <div className="h-[420px] animate-pulse rounded-3xl bg-slate-100" />
            <div className="h-[420px] animate-pulse rounded-3xl bg-slate-100" />
          </div>
        </main>
      </div>
    );
  }

  if (!event || !canView) {
    return (
      <div className="min-h-screen bg-white text-slate-900">
        <Navbar />
        <main className="mx-auto max-w-5xl px-4 pb-16 pt-24 md:px-6 md:pt-28">
          <div className="rounded-3xl border border-emerald-100 bg-emerald-50 p-6 text-emerald-800 shadow-sm">Event not available.</div>
        </main>
      </div>
    );
  }

  const dateLabel =
    event.startDate && event.endDate
      ? `${formatDate(event.startDate)} – ${formatDate(event.endDate)}`
      : event.startDate
      ? formatDate(event.startDate)
      : "Date coming soon";

  const itineraryItems = (event.itinerary || "").split("\n").filter(Boolean);
  const festivalHighlights =
    event.eventType === "festival"
      ? (event.itinerary || "")
          .split("\n")
          .filter(Boolean)
          .slice(0, 12) // reuse itinerary lines as highlight chips if provided
      : [];

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 pb-16 pt-20 md:px-6 md:pt-24">
        <div className="rounded-3xl bg-gradient-to-r from-emerald-50 to-cyan-50 p-4 shadow-md md:p-6">
          <div className="grid gap-4 lg:grid-cols-[1.2fr,1fr]">
            <div className="overflow-hidden rounded-3xl bg-white shadow-lg">
              {cover ? (
                <img src={cover} alt={event.title} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full min-h-[260px] items-center justify-center bg-emerald-50 text-emerald-700">No image</div>
              )}
            </div>
            <div className="space-y-3 rounded-3xl bg-white p-5 shadow-lg md:p-6">
              <div className="flex flex-wrap items-center gap-2">
                <span className={badge(meta.pill)}>
                  <meta.icon className="h-4 w-4" /> {meta.label}
                </span>
                <span className={badge(status.className)}>{status.label}</span>
              </div>
              <h1 className="text-3xl font-bold text-slate-900 md:text-4xl">{event.title}</h1>
              <div className="flex flex-wrap items-center gap-3">
                {canRegister ? (
                  <button
                    onClick={() => {
                      if (!user) {
                        toast.error("Please log in to register.");
                        navigate("/login");
                        return;
                      }
                      if (!isRegistered) {
                        setShowRegister(true);
                      }
                    }}
                    disabled={isRegistered}
                    className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold shadow-md transition ${
                      isRegistered
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-emerald-700 text-white hover:bg-emerald-800"
                    }`}
                  >
                    {isRegistered ? (
                      <>
                        <HiCheckCircle className="h-4 w-4" />
                        Already registered
                      </>
                    ) : (
                      <>
                        <HiOutlineCalendar className="h-4 w-4" />
                        Register for the event
                      </>
                    )}
                  </button>
                ) : (
                  <span className="rounded-full bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-600">
                    Registration available for upcoming events only
                  </span>
                )}
                <span className="text-xs font-semibold text-slate-500">
                  {eventStatus === "ongoing" ? "Ongoing event" : eventStatus === "done" ? "Event completed" : "Upcoming event"}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-sm font-semibold text-slate-700">
                <span className="inline-flex items-center gap-2 text-emerald-700">
                  <HiLocationMarker className="h-5 w-5" />
                  {[event.location?.division, event.location?.district, event.location?.exactSpot].filter(Boolean).join(", ") || "Bangladesh"}
                </span>
                <span className="inline-flex items-center gap-2 text-slate-600">
                  <HiOutlineCalendar className="h-5 w-5" />
                  {dateLabel}
                </span>
              </div>
              {(isAdmin || isCreator) && event.status !== "approved" ? (
                <div
                  className={`flex items-center gap-2 rounded-2xl px-3 py-2 text-sm font-semibold ${
                    event.status === "pending" ? "bg-amber-50 text-amber-700" : "bg-rose-50 text-rose-700"
                  }`}
                >
                  <HiExclamation className="h-5 w-5" />
                  {event.status === "pending"
                    ? "Pending review—only you and admins can see this."
                    : "Rejected—this is hidden from users."}
                </div>
              ) : null}
              <div className="flex flex-wrap gap-2 pt-2 text-xs font-semibold text-slate-600">
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-emerald-700 ring-1 ring-emerald-100">
                  <HiShieldCheck className="h-4 w-4" /> {event.createdBy?.role || "Guide"}
                </span>
                <span className="rounded-full bg-slate-50 px-3 py-1 ring-1 ring-slate-100">Organizer: {event.createdBy?.name || "N/A"}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.6fr,0.9fr]">
          <div className="space-y-6">
            <section className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-md md:p-8">
              <h2 className="text-xl font-bold text-slate-900">About this Event</h2>
              <div className="mt-3 space-y-4 text-sm leading-relaxed text-slate-700">
                <p className="whitespace-pre-line">{event.description}</p>
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-emerald-700">What to Expect</h3>
                  <p className="text-sm text-slate-700">
                    {event.eventType === "tour"
                      ? "Guided experiences, local insights, and curated stops to make your journey memorable."
                      : "Cultural celebrations, performances, and authentic local vibes."}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-emerald-700">Who this is for</h3>
                  <p className="text-sm text-slate-700">
                    Perfect for travelers seeking {event.eventType === "tour" ? "adventure and discovery." : "vibrant cultural experiences."}
                  </p>
                </div>
              </div>
              {event.eventType === "tour" && itineraryItems.length ? (
                <div className="mt-6 space-y-3">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-emerald-700">Itinerary</h3>
                  <div className="space-y-3">
                    {itineraryItems.map((it, idx) => (
                      <div key={idx} className="flex gap-3 rounded-2xl border border-emerald-50 bg-emerald-50/50 p-3">
                        <div className="mt-1 h-6 w-6 rounded-full bg-emerald-100 text-center text-xs font-bold text-emerald-700 leading-6">{idx + 1}</div>
                        <div className="text-sm text-slate-700 whitespace-pre-line">{it}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
              {event.eventType === "festival" && festivalHighlights.length ? (
                <div className="mt-6 space-y-3">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-emerald-700">Festival Highlights</h3>
                  <div className="flex flex-wrap gap-2">
                    {festivalHighlights.map((h) => (
                      <span key={h} className="rounded-full bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-700 ring-1 ring-purple-100">
                        {h}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}
            </section>

            <section className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-md md:p-8">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900">Comments & Questions</h2>
                <span className="text-xs font-semibold text-slate-500">{event.comments?.length || 0} total</span>
              </div>
              {user ? (
                <div className="mt-4 flex gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-800">
                    {(user.name || "U")[0]}
                  </div>
                  <div className="flex-1 space-y-3">
                    <textarea
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      rows={3}
                      className="w-full rounded-2xl border border-emerald-100 px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                      placeholder="Ask a question or share your thoughts..."
                    />
                    <div className="flex gap-2">
                      <button
                        disabled={submitting}
                        onClick={handleComment}
                        className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-70"
                      >
                        {submitting ? "Posting..." : "Post Comment"}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mt-3 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                  <button onClick={() => navigate("/login")} className="font-semibold underline">
                    Login
                  </button>{" "}
                  to comment.
                </div>
              )}
              <div className="mt-4 space-y-3">
                {event.comments?.length ? (
                  event.comments.map((c) => (
                    <div key={c._id} className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-sm font-semibold text-emerald-800">
                        {(c.user?.name || "U")[0]}
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex flex-wrap items-center gap-2 text-sm font-semibold text-slate-900">
                          <span>{c.user?.name || "User"}</span>
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-slate-600">
                            {c.user?.role || "User"}
                          </span>
                          <span className="text-xs text-slate-500">{formatDate(c.createdAt)}</span>
                        </div>
                        <p className="text-sm text-slate-700">{c.text}</p>
                      </div>
                      {(isAdmin || String(c.user?._id || c.user) === String(user?.id)) && (
                        <button
                          onClick={async () => {
                            try {
                              const res = await eventsAPI.deleteComment(id, c._id);
                              setEvent(res.data?.data || res.data);
                              toast.success("Comment deleted");
                            } catch (err) {
                              toast.error("Failed to delete comment");
                            }
                          }}
                          className="rounded-full p-2 text-rose-600 transition hover:bg-rose-50"
                        >
                          <HiTrash className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-600">No comments yet – be the first to ask something!</p>
                )}
              </div>
            </section>
          </div>

          <div className="space-y-4">
            {isAdmin ? (
              <section className="rounded-3xl border border-emerald-100 bg-white p-5 shadow-md md:p-6">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-emerald-700">Admin panel</h3>
                <p className="text-xs text-slate-500">Review status and actions</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {event.status !== "approved" && (
                    <button
                      onClick={() =>
                        setConfirmAction({
                          title: "Approve event",
                          message: "Make this event live for users?",
                          confirmText: "Approve",
                          action: () => handleApprove("approve"),
                        })
                      }
                      className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
                    >
                      Approve
                    </button>
                  )}
                  {event.status !== "rejected" && (
                    <button
                      onClick={() =>
                        setConfirmAction({
                          title: "Reject event",
                          message: "Reject and hide this event?",
                          confirmText: "Reject",
                          action: () => handleApprove("reject"),
                        })
                      }
                      className="rounded-full bg-rose-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-700"
                    >
                      Reject
                    </button>
                  )}
                  <button
                    onClick={() => navigate(`/events/${id}/edit`)}
                    className="rounded-full border border-emerald-200 px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:border-emerald-300"
                  >
                    Edit
                  </button>
                </div>
                <div className="mt-3 grid gap-2 text-xs font-semibold text-slate-600">
                  <span>Created by: {event.createdBy?.name} ({event.createdBy?.role})</span>
                  <span>Submitted: {formatDate(event.createdAt)}</span>
                  <span>Last updated: {formatDate(event.updatedAt)}</span>
                  <span>
                    💚 {(event.interestedUsers || []).length} · ⭐ {(event.bookmarkedBy || []).length} · 💬 {(event.comments || []).length}
                  </span>
                </div>
              </section>
            ) : null}

            <section className="rounded-3xl border border-emerald-100 bg-white p-5 shadow-md md:p-6">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-emerald-700">Your actions</h3>
              <div className="mt-3 space-y-3">
                <button
                  onClick={() => handleToggle("interestedUsers", eventsAPI.toggleInterested)}
                  className={`flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold shadow-sm transition ${
                    isInterested ? "bg-emerald-600 text-white scale-[1.01]" : "border border-emerald-200 bg-white text-emerald-700 hover:border-emerald-300"
                  }`}
                >
                  {isInterested ? "Interested ✓" : "💚 I'm Interested"}
                </button>
                <button
                  onClick={() => handleToggle("bookmarkedBy", eventsAPI.toggleBookmark)}
                  className={`flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold shadow-sm transition ${
                    isBookmarked ? "bg-amber-100 text-amber-800 scale-[1.01]" : "border border-amber-200 bg-white text-amber-700 hover:border-amber-300"
                  }`}
                >
                  <HiOutlineBookmark className="h-5 w-5" /> {isBookmarked ? "Bookmarked ✓" : "Bookmark"}
                </button>
              </div>
              <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold text-slate-600">
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700 ring-1 ring-emerald-100">
                  💚 {(event.interestedUsers || []).length} interested
                </span>
                <span className="rounded-full bg-amber-50 px-3 py-1 text-amber-700 ring-1 ring-amber-100">
                  ⭐ {(event.bookmarkedBy || []).length} bookmarks
                </span>
              </div>
            </section>

            <section className="rounded-3xl border border-emerald-100 bg-white p-5 shadow-md md:p-6">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-emerald-700">Quick info</h3>
              <div className="mt-3 space-y-2 text-sm text-slate-700">
                {event.price ? (
                  <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-lg font-bold text-emerald-700 shadow-sm">৳ {event.price} / person</div>
                ) : null}
                <div className="rounded-2xl border border-slate-100 px-4 py-3">
                  <p className="font-semibold text-slate-900">Organizer</p>
                  <p className="text-sm text-slate-700">{event.createdBy?.name || "Unknown"}</p>
                  <p className="text-xs text-slate-500">{event.createdBy?.role || "Guide"}</p>
                  {event.createdByGuideId ? (
                    <button
                      onClick={() => navigate(`/guides/${event.createdByGuideId}`)}
                      className="mt-2 text-sm font-semibold text-sky-600 hover:underline"
                    >
                      View more tours from this guide
                    </button>
                  ) : null}
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-emerald-100 bg-white p-5 shadow-md md:p-6">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-emerald-700">Location</h3>
              <div className="mt-3 space-y-2 text-sm text-slate-700">
                <p>{[event.location?.division, event.location?.district, event.location?.exactSpot].filter(Boolean).join(", ") || "Bangladesh"}</p>
                <div className="h-28 rounded-2xl bg-slate-100" />
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    [event.location?.exactSpot, event.location?.district, event.location?.division].filter(Boolean).join(", ")
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-sky-600 hover:underline"
                >
                  Open in Google Maps
                </a>
              </div>
            </section>
          </div>
        </div>
      </main>
      <Footer />
      <ConfirmModal
        open={!!confirmAction}
        title={confirmAction?.title}
        message={confirmAction?.message}
        confirmText={confirmAction?.confirmText}
        onConfirm={() => confirmAction?.action?.()}
        onClose={() => setConfirmAction(null)}
      />
      <ChatPanel open={showChat} onClose={() => setShowChat(false)} user={user} initialThreadId={activeChatId} />
      {showRegister ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Event Registration</p>
                <h3 className="text-2xl font-bold text-slate-900">Register for this event</h3>
              </div>
              <button
                onClick={() => setShowRegister(false)}
                className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600"
              >
                Close
              </button>
            </div>
            <form onSubmit={handleRegisterSubmit} className="mt-4 space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">Full name</label>
                  <input
                    value={registerForm.fullName}
                    onChange={(e) => setRegisterForm((prev) => ({ ...prev, fullName: e.target.value }))}
                    className="w-full rounded-2xl border border-emerald-100 px-3 py-2 text-sm"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">Email</label>
                  <input
                    type="email"
                    value={registerForm.email}
                    onChange={(e) => setRegisterForm((prev) => ({ ...prev, email: e.target.value }))}
                    className="w-full rounded-2xl border border-emerald-100 px-3 py-2 text-sm"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">Contact number</label>
                  <input
                    value={registerForm.contactNumber}
                    onChange={(e) => setRegisterForm((prev) => ({ ...prev, contactNumber: e.target.value }))}
                    className="w-full rounded-2xl border border-emerald-100 px-3 py-2 text-sm"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">Age</label>
                  <input
                    type="number"
                    min="1"
                    max="120"
                    value={registerForm.age}
                    onChange={(e) => setRegisterForm((prev) => ({ ...prev, age: e.target.value }))}
                    className="w-full rounded-2xl border border-emerald-100 px-3 py-2 text-sm"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">Sex</label>
                  <select
                    value={registerForm.sex}
                    onChange={(e) => setRegisterForm((prev) => ({ ...prev, sex: e.target.value }))}
                    className="w-full rounded-2xl border border-emerald-100 px-3 py-2 text-sm"
                    required
                  >
                    <option value="">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">How many people (max 5)</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={registerForm.peopleCount}
                    onChange={(e) => setRegisterForm((prev) => ({ ...prev, peopleCount: e.target.value }))}
                    className="w-full rounded-2xl border border-emerald-100 px-3 py-2 text-sm"
                    required
                  />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <label className="text-xs font-semibold text-slate-600">NID number</label>
                  <input
                    value={registerForm.nidNumber}
                    onChange={(e) => setRegisterForm((prev) => ({ ...prev, nidNumber: e.target.value }))}
                    className="w-full rounded-2xl border border-emerald-100 px-3 py-2 text-sm"
                    required
                  />
                </div>
              </div>
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-4 text-xs text-slate-700">
                <p className="font-semibold text-emerald-700">Terms and conditions</p>
                <ul className="mt-2 list-disc space-y-1 pl-4">
                  <li>Registrations are confirmed only for approved events and may close when capacity is reached.</li>
                  <li>Please arrive on time and carry a valid ID that matches your registration details.</li>
                  <li>Respect local culture, the environment, and the guide's safety instructions at all times.</li>
                  <li>Event schedules may change due to weather or safety concerns; organizers will notify you.</li>
                  <li>No refunds for no-shows. If you must cancel, inform the organizer early.</li>
                </ul>
              </div>
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={registerForm.termsAccepted}
                  onChange={(e) => setRegisterForm((prev) => ({ ...prev, termsAccepted: e.target.checked }))}
                />
                I agree to the terms and conditions
              </label>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowRegister(false)}
                  className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={registering}
                  className="rounded-full bg-emerald-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-70"
                >
                  {registering ? "Registering..." : "Register"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default EventDetailPage;
