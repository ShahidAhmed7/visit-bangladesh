import { useEffect, useMemo, useState } from "react";
import { HiLocationMarker, HiOutlineBookmark } from "react-icons/hi";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import RatingStars from "../components/RatingStars.jsx";
import { resolveSpotImage } from "../utils/resolveSpotImage.js";
import { spotsAPI } from "../services/api/spots.api.js";
import { useAuth } from "../context/AuthContext.jsx";
import { usersAPI } from "../services/api/users.api.js";

const SpotDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [spot, setSpot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsError, setReviewsError] = useState("");
  const [reviewForm, setReviewForm] = useState({ rating: 0, comment: "" });
  const [savingReview, setSavingReview] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarking, setBookmarking] = useState(false);

  const fetchSpot = async () => {
    setLoading(true);
    try {
      const res = await spotsAPI.getById(id);
      setSpot(res.data?.data || res.data);
    } catch (err) {
      console.error("Failed to load spot", err);
      setSpot(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    setReviewsLoading(true);
    setReviewsError("");
    try {
      const res = await spotsAPI.listReviews(id, { limit: 50 });
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

  useEffect(() => {
    if (id) {
      fetchSpot();
      fetchReviews();
    }
  }, [id]);

  useEffect(() => {
    const loadBookmarkState = async () => {
      if (!user || !id) {
        setIsBookmarked(false);
        return;
      }
      try {
        const res = await usersAPI.getBookmarks();
        const data = res.data?.data || res.data;
        const spots = data?.spots || [];
        setIsBookmarked(spots.some((spot) => String(spot.id) === String(id)));
      } catch (err) {
        setIsBookmarked(false);
      }
    };
    loadBookmarkState();
  }, [user, id]);

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
        await spotsAPI.updateReview(id, myReview._id, reviewForm);
        toast.success("Review updated.");
      } else {
        await spotsAPI.createReview(id, reviewForm);
        toast.success("Review submitted.");
      }
      await fetchSpot();
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
      await spotsAPI.deleteReview(id, myReview._id);
      setReviewForm({ rating: 0, comment: "" });
      await fetchSpot();
      await fetchReviews();
      toast.success("Review deleted.");
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to delete review.";
      toast.error(msg);
    } finally {
      setSavingReview(false);
    }
  };

  const handleBookmark = async () => {
    if (!user) {
      toast.error("Please log in to bookmark.");
      return;
    }
    setBookmarking(true);
    try {
      if (isBookmarked) {
        await usersAPI.removeSpotBookmark(id);
      } else {
        await usersAPI.addSpotBookmark(id);
      }
      setIsBookmarked((prev) => !prev);
      toast.success(isBookmarked ? "Bookmark removed." : "Spot saved.");
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to update bookmark.";
      toast.error(msg);
    } finally {
      setBookmarking(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white text-slate-900">
        <Navbar />
        <main className="mx-auto max-w-5xl px-4 py-24 md:px-6">Loading...</main>
      </div>
    );
  }

  if (!spot) {
    return (
      <div className="min-h-screen bg-white text-slate-900">
        <Navbar />
        <main className="mx-auto max-w-5xl px-4 py-24 md:px-6">Spot not found.</main>
      </div>
    );
  }

  const { name, category, location, images = [], description, googleMapsUrl, avgRating, reviewCount } = spot;
  const mainImage = resolveSpotImage(images[0]);
  const locationText = [location?.district, location?.division].filter(Boolean).join(", ");
  const ratingText = avgRating ? avgRating.toFixed(1) : "0.0";

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 pb-16 pt-20 md:px-6 md:pt-24">
        <div className="overflow-hidden rounded-3xl border border-emerald-100 shadow-lg">
          <img src={mainImage} alt={name} className="h-72 w-full object-cover md:h-96" loading="lazy" />
          <div className="space-y-3 bg-white p-6 md:p-8">
            <div className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-700 ring-1 ring-emerald-200">
              {category}
            </div>
            <h1 className="text-3xl font-bold text-slate-900">{name}</h1>
            <div className="flex flex-wrap items-center gap-3">
              {locationText ? (
                <a
                  href={googleMapsUrl || "#"}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 hover:text-emerald-800"
                >
                  <HiLocationMarker className="h-5 w-5" />
                  <span>{locationText}</span>
                </a>
              ) : null}
              <button
                type="button"
                onClick={handleBookmark}
                disabled={bookmarking}
                className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold shadow-sm transition ${
                  isBookmarked ? "bg-emerald-600 text-white" : "border border-emerald-200 bg-white text-emerald-700"
                }`}
              >
                <HiOutlineBookmark className="h-4 w-4" />
                {bookmarking ? "Saving..." : isBookmarked ? "Bookmarked" : "Bookmark"}
              </button>
            </div>
            {description ? <p className="text-slate-700 leading-relaxed">{description}</p> : null}
          </div>
        </div>

        <section className="mt-10 rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm md:p-8">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-emerald-700">Ratings & Reviews</h2>
              <div className="mt-2 flex items-center gap-2 text-sm text-slate-600">
                <RatingStars value={Math.round(Number(ratingText))} />
                <span>{ratingText} average from {reviewCount || 0} reviews</span>
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
                  No reviews yet. Be the first to review this spot.
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/30 p-4">
              <h3 className="text-sm font-semibold text-slate-900">{myReview ? "Update your review" : "Write a review"}</h3>
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
      </main>
      <Footer />
    </div>
  );
};

export default SpotDetailPage;
