import { HiOutlineUser, HiOutlineUsers } from "react-icons/hi";

const AdminUsersSection = ({
  users,
  adminSearch,
  setAdminSearch,
  onSelect,
  onUpdateRole,
  onToggleSuspend,
  selected,
  requestConfirm, // function({message, action})
}) => (
  <section className="space-y-4 rounded-3xl bg-white p-6 shadow-lg md:p-8">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Admin</p>
        <h2 className="text-2xl font-bold text-slate-900">Manage users & guides</h2>
      </div>
      <input
        type="text"
        value={adminSearch}
        onChange={(e) => setAdminSearch(e.target.value)}
        placeholder="Search users..."
        className="w-full max-w-xs rounded-full border border-emerald-100 px-4 py-2 text-sm text-slate-900 shadow-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
      />
    </div>
    <div className="overflow-hidden rounded-2xl border border-emerald-100 shadow-sm">
      <table className="min-w-full divide-y divide-emerald-50 text-sm">
        <thead className="bg-emerald-50 text-left text-xs font-semibold uppercase text-emerald-800">
          <tr>
            <th className="px-4 py-3">Name</th>
            <th className="px-4 py-3">Email</th>
            <th className="px-4 py-3">Role</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-emerald-50">
          {users.map((u) => (
            <tr key={u.id} className="odd:bg-white even:bg-slate-50 hover:bg-slate-100 transition cursor-pointer" onClick={() => onSelect(u)}>
              <td className="px-4 py-3 font-semibold">{u.name}</td>
              <td className="px-4 py-3 text-slate-700">{u.email}</td>
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
                      onClick={(e) => {
                        e.stopPropagation();
                        requestConfirm?.({
                          message: "Promote this user to Guide?",
                          action: () => onUpdateRole(u.id, "guide"),
                        });
                      }}
                      className="inline-flex items-center gap-1 rounded-full border border-emerald-100 px-3 py-1 text-emerald-700"
                    >
                      <HiOutlineUsers className="h-4 w-4" /> Guide
                    </button>
                  )}
                  {u.role !== "admin" && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        requestConfirm?.({
                          message: "Promote this user to Admin?",
                          action: () => onUpdateRole(u.id, "admin"),
                        });
                      }}
                      className="inline-flex items-center gap-1 rounded-full border border-emerald-100 px-3 py-1 text-emerald-700"
                    >
                      <HiOutlineUser className="h-4 w-4" /> Admin
                    </button>
                  )}
                  {u.role === "guide" && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        requestConfirm?.({
                          message: "Demote this guide to regular user?",
                          action: () => onUpdateRole(u.id, "regular"),
                        });
                      }}
                      className="inline-flex items-center gap-1 rounded-full border border-emerald-100 px-3 py-1 text-emerald-700"
                    >
                      <HiOutlineUser className="h-4 w-4" /> Demote
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      requestConfirm?.({
                        message: "Block or unblock this user?",
                        action: () => onToggleSuspend(u.id),
                      });
                    }}
                    className="inline-flex items-center gap-1 rounded-full border border-rose-200 px-3 py-1 text-rose-700 hover:bg-rose-50"
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
    {selected ? (
      <div className="rounded-3xl bg-white p-5 shadow-xl ring-1 ring-emerald-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Selected user</p>
            <h3 className="text-lg font-bold text-slate-900">{selected.name}</h3>
            <p className="text-sm text-slate-600">{selected.email}</p>
          </div>
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-100">
            {selected.role}
          </span>
        </div>
        <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold text-emerald-700">
          <button onClick={() => requestConfirm?.({ message: "Promote to Guide?", action: () => onUpdateRole(selected.id, "guide") })} className="rounded-full border border-emerald-100 px-3 py-1">
            Promote to Guide
          </button>
          <button onClick={() => requestConfirm?.({ message: "Promote to Admin?", action: () => onUpdateRole(selected.id, "admin") })} className="rounded-full border border-emerald-100 px-3 py-1">
            Promote to Admin
          </button>
          <button onClick={() => requestConfirm?.({ message: "Demote to User?", action: () => onUpdateRole(selected.id, "regular") })} className="rounded-full border border-emerald-100 px-3 py-1">
            Demote to User
          </button>
          <button onClick={() => requestConfirm?.({ message: "Block or unblock this user?", action: () => onToggleSuspend(selected.id) })} className="rounded-full border border-rose-200 px-3 py-1 text-rose-700 hover:bg-rose-50">
            {selected.status === "active" ? "Block" : "Unblock"}
          </button>
        </div>
      </div>
    ) : null}
  </section>
);

export default AdminUsersSection;
