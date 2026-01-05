import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import logo from "../assets/images/logo.png";
import { HiBell, HiChatAlt2, HiUserCircle } from "react-icons/hi";
import { useAuth } from "../context/AuthContext.jsx";
import { notificationsAPI } from "../services/api/notifications.api.js";
import ChatPanel from "./chat/ChatPanel.jsx";
import { chatsAPI } from "../services/api/chats.api.js";
import { getChatLastSeen, setChatLastSeen } from "../utils/chatReadState.js";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [chatHasUnread, setChatHasUnread] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { label: "Home", to: "/" },
    { label: "Blogs", to: "/blogs" },
    { label: "Events", to: "/events" },
    { label: "Spots", to: "/spots" },
    { label: "Guides", to: "/guides" },
    { label: "Weather", to: "/weather" },
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const loadNotifications = async () => {
      if (!user) {
        setNotifications([]);
        return;
      }
      setLoadingNotifications(true);
      try {
        const res = await notificationsAPI.list({ limit: 30 });
        const data = res.data?.data?.notifications || res.data?.notifications || [];
        setNotifications(Array.isArray(data) ? data : []);
      } catch {
        setNotifications([]);
      } finally {
        setLoadingNotifications(false);
      }
    };
    loadNotifications();
  }, [user]);

  useEffect(() => {
    if (!user?.id) {
      setChatHasUnread(false);
      return;
    }
    let active = true;
    const checkUnread = async () => {
      try {
        const res = await chatsAPI.listThreads();
        const data = res.data?.data?.threads || res.data?.threads || [];
        const list = Array.isArray(data) ? data : [];
        const lastSeen = getChatLastSeen(user.id);
        const hasUnread = list.some((thread) => {
          const ts = new Date(thread.lastMessage?.createdAt || 0).getTime();
          return ts > lastSeen;
        });
        if (active) setChatHasUnread(hasUnread);
      } catch {
        if (active) setChatHasUnread(false);
      }
    };
    checkUnread();
    const intervalId = setInterval(checkUnread, 30000);
    return () => {
      active = false;
      clearInterval(intervalId);
    };
  }, [user?.id]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleNotificationClick = async (notification) => {
    if (!notification) return;
    if (!notification.isRead) {
      try {
        await notificationsAPI.markRead(notification._id);
        setNotifications((prev) =>
          prev.map((item) => (item._id === notification._id ? { ...item, isRead: true } : item))
        );
      } catch {
        // ignore
      }
    }
    if (notification.link) {
      setShowNotifications(false);
      navigate(notification.link);
    }
  };

  const handleToggleNotifications = async () => {
    const next = !showNotifications;
    setShowNotifications(next);
    if (next && user) {
      try {
        const res = await notificationsAPI.list({ limit: 30 });
        const data = res.data?.data?.notifications || res.data?.notifications || [];
        setNotifications(Array.isArray(data) ? data : []);
      } catch {
        setNotifications([]);
      }
    }
  };

  return (
    <header
      className={`fixed inset-x-0 top-0 z-30 transition-all ${
        scrolled ? "bg-white/90 shadow-md backdrop-blur" : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 md:px-6">
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="Visit Bangladesh logo" className="h-14 w-auto md:h-16 transition-all" />
        </Link>
        <nav className="flex items-center gap-4 text-sm font-semibold text-slate-800">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `px-2 py-1 transition hover:text-emerald-600 ${
                  isActive ? "text-emerald-600 underline underline-offset-8 decoration-2" : ""
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
          {user?.role === "regular" ? (
            <Link
              to="/apply-guide"
              className="rounded-full bg-emerald-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
            >
              Apply as Guide
            </Link>
          ) : null}
          {user ? (
            <div className="relative flex items-center gap-2">
              <button
                onClick={() => {
                  setShowChat((prev) => {
                    const next = !prev;
                    if (next && user?.id) {
                      setChatLastSeen(user.id, new Date().toISOString());
                      setChatHasUnread(false);
                    }
                    return next;
                  });
                }}
                className={`relative rounded-full border px-2.5 py-2 transition ${
                  chatHasUnread ? "border-emerald-200 text-emerald-700 shadow-sm" : "border-slate-200 text-slate-500"
                }`}
                aria-label="Chat"
              >
                <HiChatAlt2 className="h-5 w-5" />
                {chatHasUnread ? (
                  <>
                    <span className="absolute -right-0.5 -top-0.5 h-2 w-2 animate-ping rounded-full bg-rose-500" />
                    <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-rose-500" />
                  </>
                ) : null}
              </button>
              <div className="relative">
                <button
                  onClick={handleToggleNotifications}
                  className={`relative rounded-full border px-2.5 py-2 transition ${
                    unreadCount ? "border-emerald-200 text-emerald-700 shadow-sm" : "border-slate-200 text-slate-500"
                  }`}
                  aria-label="Notifications"
                >
                  <HiBell className="h-5 w-5" />
                  {unreadCount ? (
                    <>
                      <span className="absolute -right-0.5 -top-0.5 h-2 w-2 animate-ping rounded-full bg-rose-500" />
                      <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-rose-500" />
                    </>
                  ) : null}
                </button>
                {showNotifications ? (
                  <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-emerald-100 bg-white p-3 shadow-xl">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Notifications</span>
                      {unreadCount ? (
                        <button
                          onClick={async () => {
                            try {
                              await notificationsAPI.markAllRead();
                              setNotifications((prev) => prev.map((item) => ({ ...item, isRead: true })));
                            } catch {
                              // ignore
                            }
                          }}
                          className="text-xs font-semibold text-emerald-700 hover:underline"
                        >
                          Mark all read
                        </button>
                      ) : null}
                    </div>
                    <div className="mt-2 max-h-80 space-y-2 overflow-y-auto">
                      {loadingNotifications ? (
                        <div className="rounded-xl bg-emerald-50/50 p-3 text-xs text-slate-600">Loading notifications...</div>
                      ) : notifications.length ? (
                        notifications.map((note) => (
                          <button
                            key={note._id}
                            onClick={() => handleNotificationClick(note)}
                            className={`w-full rounded-xl border px-3 py-2 text-left text-sm transition ${
                              note.isRead ? "border-slate-100 bg-white" : "border-emerald-100 bg-emerald-50/40"
                            }`}
                          >
                            <div className="text-xs font-semibold text-slate-700">{note.title}</div>
                            {note.message ? <div className="text-xs text-slate-600">{note.message}</div> : null}
                            <div className="mt-1 text-[11px] text-slate-400">
                              {note.actor?.name ? `${note.actor.name} - ` : ""}{new Date(note.createdAt).toLocaleString()}
                            </div>
                          </button>
                        ))
                      ) : (
                        <div className="rounded-xl bg-emerald-50/50 p-3 text-xs text-slate-600">No notifications yet.</div>
                      )}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          ) : null}
          {user ? (
            <Link
              to="/profile"
              className="flex items-center gap-2 rounded-full border border-emerald-100 bg-white px-3 py-1.5 text-emerald-700 shadow-sm transition hover:border-emerald-300 hover:text-emerald-800"
            >
              <HiUserCircle className="h-6 w-6" />
              <span className="hidden sm:inline text-sm font-semibold">{user.name || "Profile"}</span>
            </Link>
          ) : (
            <>
              <Link to="/login" className="hidden text-slate-800 hover:text-emerald-700 transition md:inline">
                Login
              </Link>
              <Link
                to="/register"
                className="rounded-full bg-emerald-600 px-4 py-2 text-white shadow-md transition hover:bg-emerald-700"
              >
                Register
              </Link>
            </>
          )}
        </nav>
      </div>
      <ChatPanel open={showChat} onClose={() => setShowChat(false)} user={user} />
    </header>
  );
};

export default Navbar;
