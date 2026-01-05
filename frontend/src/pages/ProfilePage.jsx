import { useEffect, useMemo, useState } from "react";
import { FiGrid } from "react-icons/fi";
import { HiOutlineBookmark, HiOutlineCalendar, HiOutlineStar, HiOutlineUser, HiOutlineUsers } from "react-icons/hi";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { usersAPI } from "../services/api/users.api.js";
import { guidesAPI } from "../services/api/guides.api.js";
import { eventsAPI } from "../services/api/events.api.js";
import { spotsAPI } from "../services/api/spots.api.js";
import { guideApplicationsAPI } from "../services/api/guideApplications.api.js";
import BookmarksSection from "../components/dashboard/BookmarksSection.jsx";
import BlogCardsSection from "../components/dashboard/BlogCardsSection.jsx";
import GuidesSection from "../components/dashboard/GuidesSection.jsx";
import OverviewCard from "../components/dashboard/OverviewCard.jsx";
import PasswordForm from "../components/dashboard/PasswordForm.jsx";
import ProfileForm from "../components/dashboard/ProfileForm.jsx";
import RegisteredSection from "../components/dashboard/RegisteredSection.jsx";
import ReviewsSection from "../components/dashboard/ReviewsSection.jsx";
import SidebarNav from "../components/dashboard/SidebarNav.jsx";
import StatCard from "../components/dashboard/StatCard.jsx";
import AdminUsersSection from "../components/dashboard/AdminUsersSection.jsx";
import ConfirmModal from "../components/dashboard/ConfirmModal.jsx";
import AdminGuideApplicationsPanel from "../components/dashboard/AdminGuideApplicationsPanel.jsx";
import AdminPendingGuideEventsPanel from "../components/dashboard/AdminPendingGuideEventsPanel.jsx";

const travelPrefs = ["Nature", "Heritage", "Beach", "Hill", "Spiritual"];

const emptyBookmarks = { spots: [], events: [] };

const dummyBlogs = [
  { id: "b1", title: "Sunrise at Cox’s Bazar", snippet: "The golden light reflecting off the waves was surreal...", createdAt: "2025-12-05", likes: 8, comments: 2 },
  { id: "b2", title: "Tea Trails in Sreemangal", snippet: "Mist over tea gardens and the aroma of fresh leaves...", createdAt: "2025-11-22", likes: 5, comments: 1 },
];

const adminUsersMock = [
  { id: "u1", name: "Demo User One", email: "demo1@example.com", role: "regular", status: "active" },
  { id: "u2", name: "Demo User Two", email: "demo2@example.com", role: "regular", status: "active" },
  { id: "u3", name: "Admin User One", email: "admin1@example.com", role: "admin", status: "active" },
  { id: "u4", name: "Guide Rahim", email: "guide@example.com", role: "guide", status: "active" },
];

const ProfilePage = () => {
  const { user, setUser, logout, loading } = useAuth();
  const isAdmin = user?.role === "admin";
  const isGuide = user?.role === "guide";
  const baseNavItems = [
    { key: "overview", label: "Overview", icon: FiGrid, colorClass: "text-emerald-600" },
    { key: "profile", label: "Profile & Settings", icon: HiOutlineUser, colorClass: "text-emerald-600" },
    { key: "bookmarks", label: "Bookmarks", icon: HiOutlineBookmark, colorClass: "text-emerald-600" },
    { key: "registered", label: "Registered", icon: HiOutlineCalendar, colorClass: "text-cyan-600" },
    { key: "reviews", label: "Reviews", icon: HiOutlineStar, colorClass: "text-amber-600" },
    { key: "guides", label: "Followed Guides", icon: HiOutlineUsers, colorClass: "text-indigo-600" },
  ];
  const adminNavItems = [
    { key: "admin-users", label: "Admin: Users", icon: HiOutlineUsers, colorClass: "text-rose-600" },
    { key: "admin-guide-apps", label: "Admin: Guide Applications", icon: HiOutlineBookmark, colorClass: "text-emerald-700" },
    { key: "admin-guide-events", label: "Admin: Guide Events", icon: HiOutlineCalendar, colorClass: "text-cyan-600" },
  ];
  const navItems = isAdmin ? [...baseNavItems, ...adminNavItems] : baseNavItems;
  const [active, setActive] = useState("overview");
  const [confirmAction, setConfirmAction] = useState(null);
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    bio: "",
    avatarUrl: "",
    location: { city: "", country: "" },
    language: "English",
    preferences: new Set(["Nature", "Beach"]),
  });
  const [editMode, setEditMode] = useState(false);
  const [passwords, setPasswords] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [bookmarkState, setBookmarkState] = useState(emptyBookmarks);
  const [followedGuides, setFollowedGuides] = useState([]);
  const [bookmarkTab, setBookmarkTab] = useState("Tourist Spots");
  const [blogs, setBlogs] = useState(dummyBlogs);
  const [reviews, setReviews] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [guideRegistrations, setGuideRegistrations] = useState([]);
  const [adminUsers, setAdminUsers] = useState(adminUsersMock);
  const [adminSearch, setAdminSearch] = useState("");
  const [selectedAdminUser, setSelectedAdminUser] = useState(null);
  const [guideApplication, setGuideApplication] = useState(null);
  const [loadingGuideApplication, setLoadingGuideApplication] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const filteredAdminUsers = useMemo(
    () =>
      adminUsers.filter(
        (u) => u.name.toLowerCase().includes(adminSearch.toLowerCase()) || u.email.toLowerCase().includes(adminSearch.toLowerCase())
      ),
    [adminSearch, adminUsers]
  );

  useEffect(() => {
    if (user) {
      setProfile((prev) => ({
        ...prev,
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        bio: user.bio || "",
        avatarUrl: user.avatarUrl || "",
        location: {
          city: user.location?.city || "",
          country: user.location?.country || "",
        },
      }));
      setAvatarPreview(user.avatarUrl || "");
    }
  }, [user]);

  useEffect(() => {
    return () => {
      if (avatarPreview?.startsWith("blob:")) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

  useEffect(() => {
    const loadGuideApplication = async () => {
      if (!user || isAdmin || isGuide) return;
      try {
        setLoadingGuideApplication(true);
        const res = await guideApplicationsAPI.getMine();
        const apps = res.data?.data?.applications || res.data?.applications || [];
        setGuideApplication(apps[0] || { status: "none" });
      } catch (err) {
        setGuideApplication({ status: "none" });
      } finally {
        setLoadingGuideApplication(false);
      }
    };
    loadGuideApplication();
  }, [user, isAdmin, isGuide]);

  useEffect(() => {
    const loadFollowedGuides = async () => {
      if (!user) return;
      try {
        const res = await usersAPI.getFollowedGuides();
        const data = res.data?.data?.guides || res.data?.guides || [];
        setFollowedGuides(Array.isArray(data) ? data : []);
      } catch (err) {
        setFollowedGuides([]);
      }
    };
    loadFollowedGuides();
  }, [user]);

  useEffect(() => {
    const loadBookmarks = async () => {
      if (!user) return;
      try {
        const res = await usersAPI.getBookmarks();
        const data = res.data?.data || res.data;
        setBookmarkState({
          spots: data?.spots || [],
          events: data?.events || [],
        });
      } catch (err) {
        setBookmarkState(emptyBookmarks);
      }
    };
    loadBookmarks();
  }, [user]);

  const fetchReviews = async () => {
    if (!user) return;
    try {
      const res = await usersAPI.getReviews();
      const data = res.data?.data?.reviews || res.data?.reviews || [];
      setReviews(Array.isArray(data) ? data : []);
    } catch (err) {
      setReviews([]);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [user]);

  const loadRegistrations = async () => {
    if (!user) return;
    try {
      if (user.role === "guide") {
        const res = await eventsAPI.myRegistrations();
        const data = res.data?.data?.events || res.data?.events || [];
        setGuideRegistrations(Array.isArray(data) ? data : []);
        setRegistrations([]);
      } else {
        const res = await usersAPI.getRegistrations();
        const data = res.data?.data?.registrations || res.data?.registrations || [];
        setRegistrations(Array.isArray(data) ? data : []);
        setGuideRegistrations([]);
      }
    } catch (err) {
      setRegistrations([]);
      setGuideRegistrations([]);
    }
  };

  useEffect(() => {
    loadRegistrations();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900">
        <Navbar />
        <main className="mx-auto max-w-5xl px-4 pb-16 pt-24 md:px-6 md:pt-28">
          <div className="space-y-4 rounded-3xl border border-emerald-100 bg-white p-8 shadow-md">
            <div className="h-4 w-32 animate-pulse rounded bg-slate-200" />
            <div className="h-3 w-64 animate-pulse rounded bg-slate-200" />
            <div className="grid grid-cols-2 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-20 animate-pulse rounded-2xl bg-slate-200" />
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-white text-slate-900">
        <Navbar />
        <main className="mx-auto max-w-5xl px-4 pb-16 pt-24 md:px-6 md:pt-28">
          <div className="space-y-3 rounded-3xl border border-emerald-100 bg-white p-8 shadow-md">
            <h1 className="text-2xl font-bold">You are not logged in</h1>
            <p className="text-slate-700">Please login or register to view your profile.</p>
          </div>
        </main>
      </div>
    );
  }

  const stats = {
    bookmarks: bookmarkState.spots.length + bookmarkState.events.length,
    reviews: reviews.length,
    registered: user?.role === "guide"
      ? guideRegistrations.reduce((sum, event) => sum + (event.registrations?.length || 0), 0)
      : registrations.length,
    guides: followedGuides.length,
  };

  const requestConfirm = ({ title = "Confirm action", message, confirmText = "Confirm", action }) =>
    setConfirmAction({ title, message, confirmText, action });

  const togglePref = (pref) => {
    setProfile((prev) => {
      const next = new Set(prev.preferences);
      next.has(pref) ? next.delete(pref) : next.add(pref);
      return { ...prev, preferences: next };
    });
  };

  const toggleBookmark = async (type, id) => {
    try {
      if (type === "spots") {
        await usersAPI.removeSpotBookmark(id);
      } else if (type === "events") {
        await eventsAPI.toggleBookmark(id);
      }
      setBookmarkState((prev) => ({
        ...prev,
        [type]: prev[type].filter((item) => String(item.id ?? item._id) !== String(id)),
      }));
      toast.success("Bookmark updated");
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to update bookmark";
      toast.error(msg);
    }
  };

  const handleUpdateReview = async (review, updates) => {
    if (!updates?.rating) {
      toast.error("Select a rating between 1 and 5.");
      return false;
    }
    if (!updates?.comment || updates.comment.trim().length < 2) {
      toast.error("Write a short review before saving.");
      return false;
    }
    try {
      if (review.type === "Spot") {
        await spotsAPI.updateReview(review.targetId, review.reviewId, updates);
      } else if (review.type === "Guide") {
        await guidesAPI.updateReview(review.targetId, review.reviewId, updates);
      } else {
        toast.error("Unsupported review type.");
        return false;
      }
      await fetchReviews();
      toast.success("Review updated");
      return true;
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to update review";
      toast.error(msg);
      return false;
    }
  };

  const handleDeleteReview = async (review) => {
    try {
      if (review.type === "Spot") {
        await spotsAPI.deleteReview(review.targetId, review.reviewId);
      } else if (review.type === "Guide") {
        await guidesAPI.deleteReview(review.targetId, review.reviewId);
      } else {
        toast.error("Unsupported review type.");
        return false;
      }
      await fetchReviews();
      toast.success("Review deleted");
      return true;
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to delete review";
      toast.error(msg);
      return false;
    }
  };

  const onProfileChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("location.")) {
      const key = name.split(".")[1];
      setProfile((prev) => ({ ...prev, location: { ...prev.location, [key]: value } }));
    } else {
      setProfile((prev) => ({ ...prev, [name]: value }));
    }
  };

  const onAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (avatarPreview?.startsWith("blob:")) {
      URL.revokeObjectURL(avatarPreview);
    }
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    } else {
      setAvatarFile(null);
      setAvatarPreview(user?.avatarUrl || "");
    }
  };

  const onSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const basePayload = { ...profile, preferences: Array.from(profile.preferences) };
      let payload = basePayload;

      if (avatarFile) {
        payload = new FormData();
        payload.append("avatar", avatarFile);
        payload.append("name", profile.name);
        if (profile.phone) payload.append("phone", profile.phone);
        if (profile.bio) payload.append("bio", profile.bio);
        if (profile.location?.city || profile.location?.country) {
          payload.append("location", JSON.stringify(profile.location));
        }
      } else {
        if (!basePayload.avatarUrl) {
          delete basePayload.avatarUrl;
        }
        payload = basePayload;
      }

      const res = await usersAPI.updateProfile(payload);
      const updatedUser = res.data?.data || res.data;
      setUser(updatedUser);
      setAvatarFile(null);
      setAvatarPreview(updatedUser?.avatarUrl || "");
      toast.success("Profile updated");
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to update profile";
      toast.error(msg);
    } finally {
      setSavingProfile(false);
    }
  };

  const onSavePassword = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    setSavingPassword(true);
    try {
      await usersAPI.changePassword({
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });
      toast.success("Password updated");
      setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to update password";
      toast.error(msg);
    } finally {
      setSavingPassword(false);
    }
  };

  const updateAdminRole = (id, role) => {
    setAdminUsers((prev) => prev.map((u) => (u.id === id ? { ...u, role } : u)));
    if (selectedAdminUser?.id === id) setSelectedAdminUser((prev) => ({ ...prev, role }));
    toast.success(`Role updated to ${role}`);
  };

  const toggleSuspend = (id) => {
    setAdminUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, status: u.status === "active" ? "suspended" : "active" } : u))
    );
    if (selectedAdminUser?.id === id) {
      setSelectedAdminUser((prev) => ({ ...prev, status: prev.status === "active" ? "suspended" : "active" }));
    }
    toast.success("Status updated");
  };

  const renderContent = () => {
    if (active === "overview")
      return (
        <>
          <OverviewCard
            user={user}
            profile={profile}
            stats={stats}
            statsIcons={{ bookmarks: HiOutlineBookmark, reviews: HiOutlineStar, registered: HiOutlineCalendar, guides: HiOutlineUsers }}
          />
          {!isAdmin && !isGuide ? (
            <GuideApplicationStatusCard application={guideApplication} loading={loadingGuideApplication} />
          ) : null}
          <BlogCardsSection
            blogs={blogs}
            onDelete={(blog) =>
              requestConfirm({
                title: "Delete this post?",
                message: "This cannot be undone.",
                confirmText: "Delete",
                action: () => {
                  setBlogs((prev) => prev.filter((b) => b.id !== blog.id));
                  toast.success("Blog deleted");
                },
              })
            }
          />
        </>
      );
    if (active === "profile")
      return (
        <div className="space-y-3 rounded-3xl border border-emerald-100 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-800">Profile & Settings</p>
              <p className="text-xs text-slate-500">Toggle edit mode to change your info</p>
            </div>
            <button
              onClick={() => setEditMode((prev) => !prev)}
              className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ${
                editMode ? "bg-emerald-600 text-white ring-emerald-600" : "bg-slate-100 text-slate-700 ring-slate-200"
              }`}
            >
              {editMode ? "Editing" : "Edit"}
            </button>
          </div>
          <ProfileForm
            profile={profile}
            onChange={onProfileChange}
            onSave={onSaveProfile}
            saving={savingProfile}
            togglePref={togglePref}
            travelPrefs={travelPrefs}
            logout={logout}
            disabled={!editMode}
            avatarPreview={avatarPreview}
            onAvatarChange={onAvatarChange}
          >
            <PasswordForm passwords={passwords} setPasswords={setPasswords} saving={savingPassword} onSave={onSavePassword} />
          </ProfileForm>
        </div>
      );
    if (active === "bookmarks")
      return (
        <BookmarksSection
          bookmarkTab={bookmarkTab}
          setBookmarkTab={setBookmarkTab}
          bookmarkState={bookmarkState}
          toggleBookmark={toggleBookmark}
          requestConfirm={requestConfirm}
        />
      );
    if (active === "registered")
      return (
        <RegisteredSection
          role={user?.role}
          registrations={registrations}
          guideEvents={guideRegistrations}
          onRefresh={loadRegistrations}
        />
      );
    if (active === "reviews") return <ReviewsSection reviews={reviews} onUpdate={handleUpdateReview} onDelete={handleDeleteReview} />;
    if (active === "guides")
      return (
        <GuidesSection
          guides={followedGuides}
          onUnfollow={(guide) => {
            if (!guide?.id) return;
            requestConfirm({
              title: "Unfollow guide?",
              message: `Stop following ${guide.name || "this guide"}?`,
              confirmText: "Unfollow",
              action: async () => {
                try {
                  await guidesAPI.unfollow(guide.id);
                  setFollowedGuides((prev) => prev.filter((g) => g.id !== guide.id));
                  setBookmarkState((prev) =>
                    Array.isArray(prev.guides) ? { ...prev, guides: prev.guides.filter((g) => g.id !== guide.id) } : prev
                  );
                  toast.success("Unfollowed guide");
                } catch (err) {
                  const msg = err.response?.data?.message || "Failed to unfollow";
                  toast.error(msg);
                }
              },
            });
          }}
        />
      );
    if (active === "admin-users")
      return (
        <AdminUsersSection
          users={filteredAdminUsers}
          adminSearch={adminSearch}
          setAdminSearch={setAdminSearch}
          onSelect={setSelectedAdminUser}
          onUpdateRole={updateAdminRole}
          onToggleSuspend={toggleSuspend}
          selected={selectedAdminUser}
          requestConfirm={requestConfirm}
        />
      );
    if (active === "admin-guide-apps") return <AdminGuideApplicationsPanel />;
    if (active === "admin-guide-events") return <AdminPendingGuideEventsPanel />;
    return null;
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />
      <main className="mx-auto flex max-w-6xl flex-col gap-6 px-4 pb-16 pt-24 md:px-6 md:pt-28 md:flex-row">
        <aside className="w-full md:w-72 space-y-4 rounded-3xl bg-white p-5 shadow-xl ring-1 ring-emerald-100">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-emerald-600 text-lg font-bold text-white shadow-sm">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt="Profile" className="h-full w-full object-cover" />
              ) : (
                user?.name?.[0]?.toUpperCase() || "U"
              )}
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900">{user?.name}</div>
              <div className="text-xs text-slate-600">{user?.email}</div>
              <div className="mt-1 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 ring-1 ring-emerald-100">
                Role: {user?.role}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-slate-700">
            <StatCard icon={HiOutlineBookmark} label="Bookmarks" value={stats.bookmarks} />
            <StatCard icon={HiOutlineStar} label="Reviews" value={stats.reviews} />
            <StatCard icon={HiOutlineCalendar} label="Registered" value={stats.registered} />
            <StatCard icon={HiOutlineUsers} label="Guides" value={stats.guides} />
          </div>
          <SidebarNav items={navItems} active={active} onChange={setActive} />
          {isAdmin ? (
            <div className="rounded-2xl bg-emerald-50 p-3 text-xs font-semibold text-emerald-800 shadow-sm ring-1 ring-emerald-100">
              Admin: manage users and guide applications from the sidebar.
            </div>
          ) : null}
          <button
            onClick={logout}
            className="w-full rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100"
          >
            Logout
          </button>
        </aside>
        <section className="flex-1 space-y-4">
          {renderContent()}
        </section>
      </main>
      <ConfirmModal
        open={!!confirmAction}
        title={confirmAction?.title}
        message={confirmAction?.message}
        confirmText={confirmAction?.confirmText}
        onConfirm={() => confirmAction?.action?.()}
        onClose={() => setConfirmAction(null)}
      />
    </div>
  );
};

const GuideApplicationStatusCard = ({ application, loading }) => {
  if (loading) {
    return (
      <div className="rounded-3xl border border-emerald-100 bg-white p-5 shadow-sm">
        <div className="h-4 w-32 animate-pulse rounded bg-slate-200" />
        <div className="mt-2 h-3 w-56 animate-pulse rounded bg-slate-200" />
      </div>
    );
  }

  if (!application || application.status === "none") {
    return (
      <div className="rounded-3xl border border-dashed border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-800">
        No guide application yet.{" "}
        <Link to="/apply-guide" className="font-semibold text-emerald-700 underline underline-offset-4">
          Apply as Guide
        </Link>
      </div>
    );
  }

  const statusStyles = {
    pending: "bg-amber-100 text-amber-800 ring-amber-200",
    rejected: "bg-rose-100 text-rose-800 ring-rose-200",
    approved: "bg-emerald-100 text-emerald-800 ring-emerald-200",
  };
  const statusLabel = application.status ? application.status[0].toUpperCase() + application.status.slice(1) : "Unknown";

  return (
    <div className="rounded-3xl border border-emerald-100 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-800">Guide Application Status</p>
          <p className="text-xs text-slate-600">
            Submitted {application.createdAt ? new Date(application.createdAt).toLocaleDateString() : new Date().toLocaleDateString()}
          </p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ${statusStyles[application.status] || ""}`}>
          {statusLabel}
        </span>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-700">
        {application.cv?.url || application.cvUrl ? (
          <a
            href={application.cv?.url || application.cvUrl}
            target="_blank"
            rel="noreferrer"
            className="rounded-full bg-emerald-50 px-3 py-1 font-semibold text-emerald-700 ring-1 ring-emerald-100 transition hover:bg-emerald-100"
          >
            View CV
          </a>
        ) : null}
        {application.adminNotes && application.status === "rejected" ? (
          <span className="rounded-full bg-rose-50 px-3 py-1 font-semibold text-rose-700 ring-1 ring-rose-100">
            Reason: {application.adminNotes}
          </span>
        ) : null}
        {application.status === "rejected" ? (
          <Link
            to="/apply-guide"
            className="rounded-full border border-emerald-200 bg-white px-3 py-1 font-semibold text-emerald-700 transition hover:bg-emerald-50"
          >
            Re-apply
          </Link>
        ) : null}
        {application.status === "pending" ? (
          <Link
            to="/apply-guide"
            className="rounded-full border border-slate-200 bg-white px-3 py-1 font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            View details
          </Link>
        ) : null}
      </div>
    </div>
  );
};

export default ProfilePage;
