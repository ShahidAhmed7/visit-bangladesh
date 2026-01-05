import { useMemo, useState } from "react";
import { HiOutlineCalendar, HiOutlineChartBar, HiOutlineInformationCircle, HiOutlineUserGroup, HiOutlineUsers } from "react-icons/hi";
import Navbar from "../components/Navbar.jsx";
import toast from "react-hot-toast";
import StatCard from "../components/dashboard/StatCard.jsx";
import SidebarNav from "../components/dashboard/SidebarNav.jsx";
import Input from "../components/dashboard/inputs/Input.jsx";
import ConfirmModal from "../components/dashboard/ConfirmModal.jsx";

const adminNav = [
  { key: "overview", label: "Overview", icon: HiOutlineChartBar, colorClass: "text-emerald-600" },
  { key: "users", label: "Users", icon: HiOutlineUsers, colorClass: "text-emerald-600" },
  { key: "guides", label: "Guides", icon: HiOutlineUserGroup, colorClass: "text-indigo-600" },
  { key: "events", label: "Events & Festivals", icon: HiOutlineCalendar, colorClass: "text-cyan-600" },
  { key: "info", label: "Information", icon: HiOutlineInformationCircle, colorClass: "text-amber-600" },
];

const AdminDashboardPage = () => {
  const [active, setActive] = useState("overview");
  const [users, setUsers] = useState([
    { id: "u1", name: "Shahid Ahmed", email: "shahid@example.com", role: "user", status: "active", createdAt: "2025-10-01" },
    { id: "u2", name: "Tasmiha Zaman", email: "tasmiha@example.com", role: "guide", status: "active", createdAt: "2025-09-10" },
    { id: "u3", name: "Admin One", email: "admin@example.com", role: "admin", status: "active", createdAt: "2025-08-12" },
  ]);
  const [guideApps, setGuideApps] = useState([
    { id: "g1", name: "Rahim Uddin", email: "rahim@example.com", city: "Sylhet", languages: ["Bangla", "English"], experience: "5 years as eco-tour guide", status: "pending" },
    { id: "g2", name: "Farhana Akter", email: "farhana@example.com", city: "Dhaka", languages: ["Bangla", "English", "Hindi"], experience: "Cultural tours specialist", status: "pending" },
  ]);
  const [events, setEvents] = useState([
    { id: "e1", title: "Pohela Boishakh", type: "Festival", location: "Dhaka", start: "2026-04-14", end: "2026-04-14", status: "Published" },
  ]);
  const [newEvent, setNewEvent] = useState({ title: "", type: "Festival", location: "", start: "", end: "", link: "", status: "Draft", description: "" });
  const [confirmAction, setConfirmAction] = useState(null);

  const totals = useMemo(
    () => ({
      users: users.length,
      guides: users.filter((u) => u.role === "guide").length,
      pendingGuides: guideApps.filter((g) => g.status === "pending").length,
      events: events.length,
    }),
    [users, guideApps, events]
  );

  const runWithConfirm = (action) => setConfirmAction(action);

  const promote = (id, role) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, role } : u)));
    toast.success(`Role changed to ${role}`);
  };

  const suspendToggle = (id) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, status: u.status === "active" ? "suspended" : "active" } : u))
    );
    toast.success("Status updated");
  };

  const handleGuideAction = (id, action) => {
    setGuideApps((prev) => prev.map((g) => (g.id === id ? { ...g, status: action } : g)));
    toast.success(`Application ${action}`);
  };

  const saveEvent = (publish = false) => {
    const event = { ...newEvent, id: `e${Date.now()}`, status: publish ? "Published" : "Draft" };
    setEvents((prev) => [...prev, event]);
    setNewEvent({ title: "", type: "Festival", location: "", start: "", end: "", link: "", status: "Draft", description: "" });
    toast.success(publish ? "Event published" : "Event saved as draft");
  };


  const renderOverview = () => (
    <div className="grid gap-4 md:grid-cols-4">
      <StatCard label="Total Users" value={totals.users} />
      <StatCard label="Guides (approved)" value={totals.guides} />
      <StatCard label="Guide Applications" value={totals.pendingGuides} />
      <StatCard label="Events" value={totals.events} />
    </div>
  );

  const renderUsers = () => (
    <div className="overflow-hidden rounded-3xl border border-emerald-100 bg-white shadow-lg">
      <table className="min-w-full divide-y divide-emerald-50">
        <thead className="bg-emerald-50 text-left text-xs font-semibold uppercase text-emerald-800">
          <tr>
            <th className="px-4 py-3">Name</th>
            <th className="px-4 py-3">Email</th>
            <th className="px-4 py-3">Role</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-emerald-50 text-sm text-slate-800">
          {users.map((u) => (
            <tr key={u.id} className="odd:bg-white even:bg-slate-50 hover:bg-slate-100 transition">
              <td className="px-4 py-3 font-semibold">{u.name}</td>
              <td className="px-4 py-3">{u.email}</td>
              <td className="px-4 py-3">
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-100">{u.role}</span>
              </td>
              <td className="px-4 py-3">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    u.status === "active" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
                  }`}
                >
                  {u.status}
                </span>
              </td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-2 text-xs font-semibold">
                  {u.role !== "guide" && (
                    <button
                      onClick={() => runWithConfirm(() => promote(u.id, "guide"))}
                      className="rounded-full border border-emerald-100 px-3 py-1 text-emerald-700"
                    >
                      Promote to Guide
                    </button>
                  )}
                  {u.role !== "admin" && (
                    <button
                      onClick={() => runWithConfirm(() => promote(u.id, "admin"))}
                      className="rounded-full border border-emerald-100 px-3 py-1 text-emerald-700"
                    >
                      Promote to Admin
                    </button>
                  )}
                  <button
                    onClick={() => runWithConfirm(() => suspendToggle(u.id))}
                    className="rounded-full border border-rose-200 px-3 py-1 text-rose-700 hover:bg-rose-50"
                  >
                    {u.status === "active" ? "Block" : "Unblock"}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderGuides = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-slate-900">Pending Applications</h3>
        <div className="mt-3 grid gap-4 md:grid-cols-2">
          {guideApps.filter((g) => g.status === "pending").map((g) => (
            <div key={g.id} className="space-y-2 rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-slate-900">{g.name}</p>
                  <p className="text-xs text-slate-600">
                    {g.email} • {g.city}
                  </p>
                </div>
                <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">Pending</span>
              </div>
              <p className="text-xs text-slate-600">Languages: {g.languages.join(", ")}</p>
              <p className="text-sm text-slate-700">{g.experience}</p>
              <div className="flex gap-2 text-xs font-semibold">
                <button onClick={() => runWithConfirm(() => handleGuideAction(g.id, "approved"))} className="rounded-full bg-emerald-600 px-3 py-2 text-white">
                  Approve
                </button>
                <button onClick={() => runWithConfirm(() => handleGuideAction(g.id, "rejected"))} className="rounded-full border border-emerald-100 px-3 py-2 text-emerald-700">
                  Reject
                </button>
                <button className="rounded-full border border-emerald-100 px-3 py-2 text-emerald-700">View Full Application</button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div>
        <h3 className="text-lg font-bold text-slate-900">Approved Guides</h3>
        <div className="overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-emerald-50 text-sm">
            <thead className="bg-emerald-50 text-left text-xs font-semibold uppercase text-emerald-800">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">City</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-50">
              {guideApps
                .filter((g) => g.status === "approved")
                .map((g) => (
                  <tr key={g.id}>
                    <td className="px-4 py-3 font-semibold">{g.name}</td>
                    <td className="px-4 py-3 text-slate-700">{g.city}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">Approved</span>
                    </td>
                    <td className="px-4 py-3 flex flex-wrap gap-2 text-xs font-semibold">
                      <button onClick={() => runWithConfirm(() => handleGuideAction(g.id, "suspended"))} className="rounded-full border border-emerald-100 px-3 py-1 text-emerald-700">
                        Suspend
                      </button>
                      <button onClick={() => runWithConfirm(() => handleGuideAction(g.id, "user"))} className="rounded-full border border-emerald-100 px-3 py-1 text-emerald-700">
                        Demote to User
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderEvents = () => (
    <div className="space-y-6">
      <div className="rounded-3xl border border-emerald-100 bg-white p-5 shadow-lg">
        <h3 className="text-lg font-bold text-slate-900">Create / Edit Event</h3>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <Input label="Title" value={newEvent.title} onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })} />
          <Input label="Type" value={newEvent.type} onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value })} />
          <Input label="Location" value={newEvent.location} onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })} />
          <Input label="Start Date" type="date" value={newEvent.start} onChange={(e) => setNewEvent({ ...newEvent, start: e.target.value })} />
          <Input label="End Date" type="date" value={newEvent.end} onChange={(e) => setNewEvent({ ...newEvent, end: e.target.value })} />
          <Input label="Link" value={newEvent.link} onChange={(e) => setNewEvent({ ...newEvent, link: e.target.value })} />
          <div className="md:col-span-2">
            <label className="text-sm font-semibold text-slate-700">Description</label>
            <textarea
              value={newEvent.description}
              onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
              className="mt-2 w-full rounded-2xl border border-emerald-100 px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
              rows={3}
            />
          </div>
          <div className="md:col-span-2 flex gap-2">
            <button onClick={() => saveEvent(false)} className="rounded-full border border-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-700">
              Save as Draft
            </button>
            <button onClick={() => saveEvent(true)} className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white">
              Publish
            </button>
          </div>
        </div>
      </div>
      <div className="rounded-3xl border border-emerald-100 bg-white p-5 shadow-lg">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900">Events List</h3>
          <div className="flex gap-2 text-xs font-semibold">
            <button className="rounded-full border border-emerald-100 px-3 py-1 text-emerald-700">Filter: All</button>
            <button className="rounded-full border border-emerald-100 px-3 py-1 text-emerald-700">Filter: Published</button>
          </div>
        </div>
        <div className="mt-3 divide-y divide-emerald-50">
          {events.map((ev) => (
            <div key={ev.id} className="grid gap-3 p-3 md:grid-cols-[2fr,1fr,1fr,auto] md:items-center">
              <div>
                <p className="text-sm font-bold text-slate-900">{ev.title}</p>
                <p className="text-xs text-slate-600">{ev.location}</p>
              </div>
              <p className="text-xs text-slate-600">
                {ev.start} → {ev.end}
              </p>
              <span className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${ev.status === "Published" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                {ev.status}
              </span>
              <div className="flex gap-2 text-xs font-semibold">
                <button className="rounded-full border border-emerald-100 px-3 py-1 text-emerald-700">Edit</button>
                <button className="rounded-full border border-emerald-100 px-3 py-1 text-emerald-700">Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderInfo = () => (
    <div className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-lg">
      <h3 className="text-lg font-bold text-slate-900">Information & Emergency (placeholder)</h3>
      <p className="mt-2 text-sm text-slate-700">
        Prepare fields for emergency contacts, disaster alerts, and travel advisories. Hook this section to the future API.
      </p>
    </div>
  );

  const renderContent = () => {
    if (active === "overview") return renderOverview();
    if (active === "users") return renderUsers();
    if (active === "guides") return renderGuides();
    if (active === "events") return renderEvents();
    if (active === "info") return renderInfo();
    return null;
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />
      <main className="mx-auto flex max-w-6xl flex-col gap-6 px-4 pb-16 pt-24 md:px-6 md:pt-28 md:flex-row">
        <aside className="w-full md:w-72 space-y-2 rounded-3xl border border-emerald-100 bg-white p-4 shadow-lg">
          <div className="mb-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Admin Panel</p>
            <h1 className="text-xl font-bold text-slate-900">Visit Bangladesh</h1>
          </div>
          <SidebarNav items={adminNav} active={active} onChange={setActive} />
        </aside>
        <section className="flex-1 space-y-4">
          <div className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-lg">
            <h2 className="text-2xl font-bold text-slate-900 capitalize">{active}</h2>
            <p className="text-sm text-slate-600">Manage platform data with dummy state for now; ready to plug APIs later.</p>
          </div>
          {renderContent()}
        </section>
      </main>

      <ConfirmModal
        open={!!confirmAction}
        title="Please confirm"
        message="This action can change roles or block users. Continue?"
        confirmText="Yes, proceed"
        cancelText="Cancel"
        onConfirm={() => confirmAction?.()}
        onClose={() => setConfirmAction(null)}
      />
    </div>
  );
};

export default AdminDashboardPage;
