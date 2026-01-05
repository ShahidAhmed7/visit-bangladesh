import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import RatingStars from "../components/RatingStars.jsx";
import { guidesAPI } from "../services/api/guides.api.js";
import { usersAPI } from "../services/api/users.api.js";
import { useAuth } from "../context/AuthContext.jsx";
import { resolveBlogImage } from "../utils/resolveSpotImage.js";
import { getEventStatus } from "../utils/format.js";

const GuideProfilePage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [guide, setGuide] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsError, setReviewsError] = useState("");
  const [reviewForm, setReviewForm] = useState({ rating: 0, comment: "" });
  const [savingReview, setSavingReview] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [events, setEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [eventsError, setEventsError] = useState("");
  const [blogs, setBlogs] = useState([]);
  const [blogsLoading, setBlogsLoading] = useState(false);
  const [blogsError, setBlogsError] = useState("");

  const fetchGuide = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await guidesAPI.getById(id);
      const data = res.data?.data || res.data?.guide;
      setGuide(data);
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to load guide profile.";
      setError(msg);
      setGuide(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    setReviewsLoading(true);
    setReviewsError("");
    try {
      const res = await guidesAPI.listReviews(id, { limit: 50 });
      const data = res.data?.data?.reviews || res.data?.reviews || [];
      setReviews(Array.isArray(data) ? data : []);
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to load reviews.";
      setReviewsError(msg);
      setReviews([]);
    } finally {
      setReviewsLoading(false);
    }
  };

  const fetchFollowStatus = async () => {
    if (!user) {
      setIsFollowing(false);
      return;
    }
    try {
      const res = await usersAPI.getFollowedGuides();
      const data = res.data?.data?.guides || res.data?.guides || [];
      const found = Array.isArray(data) ? data.some((guideItem) => guideItem.id === id) : false;
      setIsFollowing(found);
    } catch (err) {
      setIsFollowing(false);
    }
  };

  const fetchGuideEvents = async () => {
    setEventsLoading(true);
    setEventsError("");
    try {
      const res = await guidesAPI.listEvents(id);
      const data = res.data?.data?.events || res.data?.events || [];
      setEvents(Array.isArray(data) ? data : []);
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to load events.";
      setEventsError(msg);
      setEvents([]);
    } finally {
      setEventsLoading(false);
    }
  };

  const fetchGuideBlogs = async () => {
    setBlogsLoading(true);
    setBlogsError("");
    try {
      const res = await guidesAPI.listBlogs(id);
      const data = res.data?.data?.blogs || res.data?.blogs || [];
      setBlogs(Array.isArray(data) ? data : []);
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to load blogs.";
      setBlogsError(msg);
      setBlogs([]);
    } finally {
      setBlogsLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchGuide();
      fetchReviews();
      fetchGuideEvents();
      fetchGuideBlogs();
    }
  }, [id]);

  useEffect(() => {
    fetchFollowStatus();
  }, [id, user]);

  const myReview = useMemo(() => {
    if (!user) return null;
    return reviews.find((review) => {
      const reviewUserId = review.userId?._id || review.userId?.id || review.userId;
      return reviewUserId === user.id;
    });
  }, [reviews, user]);

  useEffect(() => {
    if (myReview) {
      setReviewForm({ rating: myReview.rating || 0, comment: myReview.comment || "" });
    } else {
      setReviewForm({ rating: 0, comment: "" });
    }
  }, [myReview?._id]);

  const handleReviewSubmit = async (event) => {
    event.preventDefault();
    if (!user) {
      toast.error("Please log in to leave a review.");
      return;
    }
    if (!reviewForm.rating) {
      toast.error("Select a rating between 1 and 5.");
      return;
    }
    if (reviewForm.comment.trim().length < 2) {
      toast.error("Write a short review before submitting.");
      return;
    }

    setSavingReview(true);
    try {
      if (myReview) {
        await guidesAPI.updateReview(id, myReview._id, reviewForm);
        toast.success("Review updated.");
      } else {
        await guidesAPI.createReview(id, reviewForm);
        toast.success("Review submitted.");
      }
      await fetchGuide();
      await fetchReviews();
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to save review.";
      toast.error(msg);
    } finally {
      setSavingReview(false);
    }
  };

  const handleDelete = async () => {
    if (!myReview) return;
    setSavingReview(true);
    try {
      await guidesAPI.deleteReview(id, myReview._id);
      setReviewForm({ rating: 0, comment: "" });
      await fetchGuide();
      await fetchReviews();
      toast.success("Review deleted.");
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to delete review.";
      toast.error(msg);
    } finally {
      setSavingReview(false);
    }
  };

  const handleFollowToggle = async () => {
    if (!user) {
      toast.error("Please log in to follow guides.");
      return;
    }
    setFollowLoading(true);
    try {
      if (isFollowing) {
        await guidesAPI.unfollow(id);
        setIsFollowing(false);
        toast.success("Unfollowed guide.");
      } else {
        await guidesAPI.follow(id);
        setIsFollowing(true);
        toast.success("Following guide.");
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to update follow status.";
      toast.error(msg);
    } finally {
      setFollowLoading(false);
    }
  };

  const avgRating = guide?.avgRating ? guide.avgRating.toFixed(1) : "0.0";
  const reviewCount = guide?.reviewCount || 0;

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Navbar />
      <main className="pt-16 md:pt-20">
        <section className="bg-gradient-to-br from-emerald-50 via-white to-emerald-100/50">
          <div className="mx-auto max-w-5xl px-4 pb-16 pt-10 md:px-6">
            <Link to="/guides" className="text-sm font-semibold text-emerald-700 hover:text-emerald-800">
              &larr; Back to guides
            </Link>

            {loading ? (
              <div className="mt-6 animate-pulse rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm">
                <div className="h-6 w-40 rounded bg-slate-200" />
                <div className="mt-4 h-4 w-3/4 rounded bg-slate-200" />
                <div className="mt-2 h-4 w-2/3 rounded bg-slate-200" />
              </div>
            ) : error ? (
              <div className="mt-6 rounded-2xl border border-rose-100 bg-rose-50 p-4 text-sm text-rose-700">{error}</div>
            ) : guide ? (
              <div className="mt-6 grid gap-6 lg:grid-cols-[320px_1fr]">
                <aside className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm">
                  <div className="flex flex-col items-center text-center">
                    <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-emerald-600 text-3xl font-bold text-white shadow-sm">
                      {guide.avatarUrl ? (
                        <img src={guide.avatarUrl} alt={guide.name || "Guide"} className="h-full w-full object-cover" />
                      ) : (
                        guide.name?.[0]?.toUpperCase() || "G"
                      )}
                    </div>
                    <h1 className="mt-4 text-2xl font-bold text-slate-900">{guide.name || "Guide profile"}</h1>
                    <p className="mt-1 text-sm text-slate-600">
                      {guide.location?.city || "Bangladesh"}
                      {guide.location?.country ? `, ${guide.location.country}` : ""}
                    </p>
                    <p className="mt-3 text-sm text-slate-600">
                      {guide.bio || "This guide has not added a bio yet."}
                    </p>
                    <button
                      type="button"
                      onClick={handleFollowToggle}
                      disabled={followLoading}
                      className={`mt-4 w-full rounded-full px-4 py-2 text-sm font-semibold shadow-sm transition ${
                        isFollowing
                          ? "border border-emerald-200 bg-white text-emerald-700 hover:bg-emerald-50"
                          : "bg-emerald-600 text-white hover:bg-emerald-700"
                      }`}
                    >
                      {followLoading ? "Please wait..." : isFollowing ? "Following" : "Follow"}
                    </button>
                  </div>

                  <div className="mt-6 grid gap-3 text-center">
                    <div className="rounded-2xl bg-emerald-50 px-3 py-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Rating</p>
                      <p className="mt-1 text-sm font-semibold text-slate-900">{avgRating}</p>
                      <p className="text-xs text-slate-500">{reviewCount} reviews</p>
                    </div>
                    <div className="rounded-2xl bg-emerald-50 px-3 py-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Experience</p>
                      <p className="mt-1 text-sm font-semibold text-slate-900">
                        {guide.yearsOfExperience !== undefined && guide.yearsOfExperience !== null
                          ? `${guide.yearsOfExperience} years`
                          : "Not listed"}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-emerald-50 px-3 py-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Languages</p>
                      <p className="mt-1 text-sm font-semibold text-slate-900">
                        {(guide.languages || []).length || "Not listed"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 space-y-4 text-left">
                    <div className="rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm">
                      <h2 className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Experience</h2>
                      <p className="mt-2 text-sm text-slate-700">
                        {guide.experienceText || "No experience details provided."}
                      </p>
                      {guide.yearsOfExperience !== undefined && guide.yearsOfExperience !== null ? (
                        <p className="mt-2 text-xs text-slate-600">
                          Years of experience: <span className="font-semibold">{guide.yearsOfExperience}</span>
                        </p>
                      ) : null}
                    </div>

                    <div className="rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm">
                      <h2 className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Travel Preferences</h2>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {(guide.specialties || []).length ? (
                          guide.specialties.map((pref) => (
                            <span key={pref} className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                              {pref}
                            </span>
                          ))
                        ) : (
                          <p className="text-sm text-slate-600">Not specified.</p>
                        )}
                      </div>
                    </div>

                    <div className="rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm">
                      <h2 className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Languages</h2>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {(guide.languages || []).length ? (
                          guide.languages.map((lang) => (
                            <span key={lang} className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                              {lang}
                            </span>
                          ))
                        ) : (
                          <p className="text-sm text-slate-600">Not specified.</p>
                        )}
                      </div>
                    </div>

                    <div className="rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm">
                      <h2 className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Available Areas</h2>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {(guide.regions || []).length ? (
                          guide.regions.map((region) => (
                            <span key={region} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                              {region}
                            </span>
                          ))
                        ) : (
                          <p className="text-sm text-slate-600">Not specified.</p>
                        )}
                      </div>
                    </div>
                  </div>
                </aside>

                <div className="space-y-6">
                  <section className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm">
                    <h2 className="text-sm font-semibold uppercase tracking-wide text-emerald-700">Events by this guide</h2>
                    {eventsLoading ? (
                      <p className="mt-3 text-sm text-slate-600">Loading events...</p>
                    ) : eventsError ? (
                      <p className="mt-3 text-sm text-rose-600">{eventsError}</p>
                    ) : events.length ? (
                      <div className="mt-4 grid gap-4 md:grid-cols-2">
                        {events.map((event) => {
                          const eventImage = resolveBlogImage(event.imageUrl);
                          const status = getEventStatus(event.startDate, event.endDate);
                          const statusLabel = status === "ongoing" ? "Ongoing" : status === "done" ? "Done" : "Upcoming";
                          const statusColor = status === "ongoing" ? "text-amber-600" : status === "done" ? "text-slate-500" : "text-emerald-600";
                          return (
                            <Link
                              key={event._id}
                              to={`/events/${event._id}`}
                              className="group overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                            >
                              <div className="h-32 w-full overflow-hidden bg-slate-100">
                                {eventImage ? (
                                  <img
                                    src={eventImage}
                                    alt={event.title || "Event"}
                                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                                    loading="lazy"
                                  />
                                ) : (
                                  <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-slate-500">
                                    No image
                                  </div>
                                )}
                              </div>
                              <div className="p-4">
                                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">{event.eventType}</p>
                                <h3 className="mt-1 text-sm font-semibold text-slate-900">{event.title}</h3>
                                <p className={`mt-1 text-xs font-semibold ${statusColor}`}>{statusLabel}</p>
                                {event.startDate ? (
                                  <p className="mt-1 text-xs text-slate-500">
                                    {new Date(event.startDate).toLocaleDateString()}
                                  </p>
                                ) : null}
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="mt-3 text-sm text-slate-600">No events posted yet.</p>
                    )}
                  </section>

                  <section className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm">
                    <h2 className="text-sm font-semibold uppercase tracking-wide text-emerald-700">Blogs by this guide</h2>
                    {blogsLoading ? (
                      <p className="mt-3 text-sm text-slate-600">Loading blogs...</p>
                    ) : blogsError ? (
                      <p className="mt-3 text-sm text-rose-600">{blogsError}</p>
                    ) : blogs.length ? (
                      <div className="mt-4 grid gap-4 md:grid-cols-2">
                        {blogs.map((blog) => {
                          const blogImage = resolveBlogImage(blog.images?.[0]);
                          return (
                            <Link
                              key={blog._id}
                              to={`/blogs/${blog._id}`}
                              className="group overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                            >
                              <div className="h-32 w-full overflow-hidden bg-slate-100">
                                {blogImage ? (
                                  <img
                                    src={blogImage}
                                    alt={blog.title || "Blog"}
                                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                                    loading="lazy"
                                  />
                                ) : (
                                  <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-slate-500">
                                    No image
                                  </div>
                                )}
                              </div>
                              <div className="p-4">
                                <h3 className="text-sm font-semibold text-slate-900">{blog.title}</h3>
                                {blog.createdAt ? (
                                  <p className="mt-1 text-xs text-slate-500">
                                    {new Date(blog.createdAt).toLocaleDateString()}
                                  </p>
                                ) : null}
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="mt-3 text-sm text-slate-600">No blogs posted yet.</p>
                    )}
                  </section>

                  <section className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <h2 className="text-sm font-semibold uppercase tracking-wide text-emerald-700">Ratings & Reviews</h2>
                        <div className="mt-2 flex items-center gap-2 text-sm text-slate-600">
                          <RatingStars value={Math.round(Number(avgRating))} />
                          <span>
                            {avgRating} average from {reviewCount} reviews
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
                      <div className="space-y-3">
                        {reviewsLoading ? (
                          <div className="rounded-2xl border border-emerald-100 bg-emerald-50/30 p-4 text-sm text-slate-600">
                            Loading reviews...
                          </div>
                        ) : reviewsError ? (
                          <div className="rounded-2xl border border-rose-100 bg-rose-50 p-4 text-sm text-rose-700">{reviewsError}</div>
                        ) : reviews.length ? (
                          reviews.map((review) => (
                            <div key={review._id} className="rounded-2xl border border-emerald-100 bg-white p-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-emerald-600 text-sm font-bold text-white">
                                    {review.userId?.avatarUrl ? (
                                      <img
                                        src={review.userId.avatarUrl}
                                        alt={review.userId?.name || "Reviewer"}
                                        className="h-full w-full object-cover"
                                      />
                                    ) : (
                                      review.userId?.name?.[0]?.toUpperCase() || "U"
                                    )}
                                  </div>
                                  <div>
                                    <p className="text-sm font-semibold text-slate-900">{review.userId?.name || "Anonymous"}</p>
                                    <p className="text-xs text-slate-500">{new Date(review.createdAt).toLocaleDateString()}</p>
                                  </div>
                                </div>
                                <RatingStars value={review.rating} />
                              </div>
                              <p className="mt-3 text-sm text-slate-700">{review.comment}</p>
                            </div>
                          ))
                        ) : (
                          <div className="rounded-2xl border border-emerald-100 bg-emerald-50/30 p-4 text-sm text-slate-600">
                            No reviews yet. Be the first to review this guide.
                          </div>
                        )}
                      </div>

                      <div className="rounded-2xl border border-emerald-100 bg-emerald-50/30 p-4">
                        <h3 className="text-sm font-semibold text-slate-900">
                          {myReview ? "Update your review" : "Write a review"}
                        </h3>
                        {!user ? (
                          <p className="mt-2 text-xs text-slate-600">Log in to share your experience.</p>
                        ) : (
                          <form onSubmit={handleReviewSubmit} className="mt-3 space-y-3">
                            <RatingStars
                              value={reviewForm.rating}
                              onChange={(rating) => setReviewForm((prev) => ({ ...prev, rating }))}
                              interactive
                              sizeClass="text-xl"
                            />
                            <textarea
                              value={reviewForm.comment}
                              onChange={(event) => setReviewForm((prev) => ({ ...prev, comment: event.target.value }))}
                              rows={4}
                              className="w-full rounded-2xl border border-emerald-100 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                              placeholder="Share your experience..."
                            />
                            <div className="flex flex-wrap gap-2">
                              <button
                                type="submit"
                                disabled={savingReview}
                                className="rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-70"
                              >
                                {savingReview ? "Saving..." : myReview ? "Update review" : "Submit review"}
                              </button>
                              {myReview ? (
                                <button
                                  type="button"
                                  onClick={handleDelete}
                                  disabled={savingReview}
                                  className="rounded-full border border-rose-200 bg-white px-4 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-50 disabled:opacity-70"
                                >
                                  Delete review
                                </button>
                              ) : null}
                            </div>
                          </form>
                        )}
                      </div>
                    </div>
                  </section>
                </div>
              </div>
            ) : null}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default GuideProfilePage;
