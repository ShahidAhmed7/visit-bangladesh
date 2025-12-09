import Navbar from "../components/Navbar.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const ProfilePage = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 pb-16 pt-24 md:px-6 md:pt-28">
        {user ? (
          <div className="space-y-4 rounded-3xl border border-emerald-100 bg-white p-8 shadow-md">
            <h1 className="text-3xl font-bold">Welcome, {user.name}</h1>
            <p className="text-slate-700">Email: {user.email}</p>
            <p className="text-slate-700 capitalize">Role: {user.role}</p>
            <button
              onClick={logout}
              className="rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
            >
              Logout
            </button>
          </div>
        ) : (
          <div className="space-y-3 rounded-3xl border border-emerald-100 bg-white p-8 shadow-md">
            <h1 className="text-2xl font-bold">You are not logged in</h1>
            <p className="text-slate-700">Please login or register to view your profile.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default ProfilePage;
