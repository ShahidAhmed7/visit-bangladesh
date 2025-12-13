import { useEffect, useState } from "react";
import { FiGrid } from "react-icons/fi";
import { HiOutlineBookmark, HiOutlineCalendar, HiOutlineStar, HiOutlineUser, HiOutlineUsers } from "react-icons/hi";
import toast from "react-hot-toast";
import Navbar from "../components/Navbar.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { usersAPI } from "../services/api/users.api.js";
import BookingsSection from "../components/dashboard/BookingsSection.jsx";
import BookmarksSection from "../components/dashboard/BookmarksSection.jsx";
import BlogCardsSection from "../components/dashboard/BlogCardsSection.jsx";
import GuidesSection from "../components/dashboard/GuidesSection.jsx";
import OverviewCard from "../components/dashboard/OverviewCard.jsx";
import PasswordForm from "../components/dashboard/PasswordForm.jsx";
import ProfileForm from "../components/dashboard/ProfileForm.jsx";
import ReviewsSection from "../components/dashboard/ReviewsSection.jsx";
import SidebarNav from "../components/dashboard/SidebarNav.jsx";
import StatCard from "../components/dashboard/StatCard.jsx";
import AdminUsersSection from "../components/dashboard/AdminUsersSection.jsx";
import ConfirmModal from "../components/dashboard/ConfirmModal.jsx";

const travelPrefs = ["Nature", "Heritage", "Beach", "Hill", "Spiritual"];

const dummyBookmarks = {
  spots: [
    { id: "s1", name: "Cox’s Bazar Sea Beach", category: "Beach", district: "Cox's Bazar", division: "Chattogram", rating: 4.8, image: "/assets/images/tour-img01.jpg" },
    { id: "s2", name: "Sreemangal Tea Gardens", category: "Nature", district: "Moulvibazar", division: "Sylhet", rating: 4.6, image: "/assets/images/tour-img03.jpg" },
  ],
  hotels: [
    { id: "h1", name: "Bayview Resort", location: "Cox's Bazar", rating: 4.5, link: "#" },
    { id: "h2", name: "Tea Valley Lodge", location: "Sreemangal", rating: 4.4, link: "#" },
  ],
  guides: [
    { id: "g1", name: "Rahim Uddin", city: "Sylhet", languages: ["Bangla", "English"], rating: 4.7, avatar: "" },
    { id: "g2", name: "Farhana Akter", city: "Dhaka", languages: ["Bangla", "English", "Hindi"], rating: 4.8, avatar: "" },
  ],
};

const dummyBookings = [
  { id: "b1", hotel: "Bayview Resort", destination: "Cox's Bazar", checkIn: "2025-12-20", checkOut: "2025-12-24", status: "Confirmed" },
  { id: "b2", hotel: "Tea Valley Lodge", destination: "Sreemangal", checkIn: "2026-01-05", checkOut: "2026-01-07", status: "Pending" },
];

const dummyReviews = [
  { id: "r1", target: "Cox’s Bazar Sea Beach", type: "Spot", rating: 5, date: "2025-11-01", text: "Incredible sunsets and long walks along the shore. Highly recommend!" },
  { id: "r2", target: "Bayview Resort", type: "Hotel", rating: 4, date: "2025-10-15", text: "Comfortable stay with sea view. Breakfast could be better." },
];

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
  const baseNavItems = [
    { key: "overview", label: "Overview", icon: FiGrid, colorClass: "text-emerald-600" },
    { key: "profile", label: "Profile & Settings", icon: HiOutlineUser, colorClass: "text-emerald-600" },
    { key: "bookmarks", label: "Bookmarks", icon: HiOutlineBookmark, colorClass: "text-emerald-600" },
    { key: "bookings", label: "Bookings", icon: HiOutlineCalendar, colorClass: "text-cyan-600" },
    { key: "reviews", label: "Reviews", icon: HiOutlineStar, colorClass: "text-amber-600" },
    { key: "guides", label: "Followed Guides", icon: HiOutlineUsers, colorClass: "text-indigo-600" },
  ];
  const navItems = user?.role === "admin" ? [...baseNavItems, { key: "admin", label: "Admin", icon: HiOutlineUsers, colorClass: "text-rose-600" }] : baseNavItems;
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
  const [passwords, setPasswords] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [bookmarkState, setBookmarkState] = useState(dummyBookmarks);
  const [bookmarkTab, setBookmarkTab] = useState("Tourist Spots");
  const [blogs, setBlogs] = useState(dummyBlogs);
  const [adminUsers, setAdminUsers] = useState(adminUsersMock);
  const [adminSearch, setAdminSearch] = useState("");
  const [selectedAdminUser, setSelectedAdminUser] = useState(null);

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
    }
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
    bookmarks: bookmarkState.spots.length + bookmarkState.hotels.length + bookmarkState.guides.length,
    reviews: dummyReviews.length,
    bookings: dummyBookings.length,
    guides: bookmarkState.guides.length,
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

  const toggleBookmark = (type, id) => {
    requestConfirm({
      title: "Remove bookmark?",
      message: "This will remove the item from your saved list.",
      action: () => {
        setBookmarkState((prev) => ({
          ...prev,
          [type]: prev[type].filter((item) => item.id !== id),
        }));
        toast.success("Bookmark updated");
      },
      confirmText: "Remove",
    });
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

  const onSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const payload = { ...profile, preferences: Array.from(profile.preferences) };
      const res = await usersAPI.updateProfile(payload);
      const updatedUser = res.data?.data || res.data;
      setUser(updatedUser);
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
            statsIcons={{ bookmarks: HiOutlineBookmark, reviews: HiOutlineStar, bookings: HiOutlineCalendar, guides: HiOutlineUsers }}
          />
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
        <ProfileForm
          profile={profile}
          onChange={onProfileChange}
          onSave={onSaveProfile}
          saving={savingProfile}
          togglePref={togglePref}
          travelPrefs={travelPrefs}
          logout={logout}
        >
          <PasswordForm passwords={passwords} setPasswords={setPasswords} saving={savingPassword} onSave={onSavePassword} />
        </ProfileForm>
      );
    if (active === "bookmarks")
      return <BookmarksSection bookmarkTab={bookmarkTab} setBookmarkTab={setBookmarkTab} bookmarkState={bookmarkState} toggleBookmark={toggleBookmark} />;
    if (active === "bookings") return <BookingsSection bookings={dummyBookings} />;
    if (active === "reviews") return <ReviewsSection reviews={dummyReviews} />;
    if (active === "guides") return <GuidesSection guides={bookmarkState.guides} />;
    if (active === "admin")
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
    return null;
  };

  const filteredAdminUsers = adminUsers.filter(
    (u) => u.name.toLowerCase().includes(adminSearch.toLowerCase()) || u.email.toLowerCase().includes(adminSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />
      <main className="mx-auto flex max-w-6xl flex-col gap-6 px-4 pb-16 pt-24 md:px-6 md:pt-28 md:flex-row">
        <aside className="w-full md:w-72 space-y-4 rounded-3xl bg-white p-5 shadow-xl ring-1 ring-emerald-100">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-600 text-lg font-bold text-white shadow-sm">
              {user?.name?.[0]?.toUpperCase() || "U"}
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900">{user?.name}</div>
              <div className="text-xs text-slate-600">{user?.email}</div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-slate-700">
            <StatCard icon={HiOutlineBookmark} label="Bookmarks" value={stats.bookmarks} />
            <StatCard icon={HiOutlineStar} label="Reviews" value={stats.reviews} />
            <StatCard icon={HiOutlineCalendar} label="Bookings" value={stats.bookings} />
            <StatCard icon={HiOutlineUsers} label="Guides" value={stats.guides} />
          </div>
          <SidebarNav items={navItems} active={active} onChange={setActive} />
          {user.role === "admin" ? (
            <div className="rounded-2xl bg-emerald-50 p-3 text-xs font-semibold text-emerald-800 shadow-sm ring-1 ring-emerald-100">
              Admin: use Users tab for role changes and blocking.
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

export default ProfilePage;
