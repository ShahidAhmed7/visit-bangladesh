import Input from "./inputs/Input.jsx";

const ProfileForm = ({
  profile,
  onChange,
  onSave,
  saving,
  togglePref,
  travelPrefs,
  logout,
}) => (
  <section className="space-y-6 rounded-3xl bg-white p-6 shadow-lg md:p-8">
    <header className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Profile</p>
        <h2 className="text-2xl font-bold text-slate-900">Profile & Settings</h2>
        <p className="text-sm text-slate-600">Update your personal details and travel preferences.</p>
      </div>
      <button
        onClick={logout}
        className="rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
      >
        Logout
      </button>
    </header>
    <form className="space-y-4" onSubmit={onSave}>
      <div className="grid gap-4 md:grid-cols-2">
        <Input label="Full Name" name="name" value={profile.name} onChange={onChange} required />
        <Input label="Email" name="email" value={profile.email} disabled />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Input label="Phone" name="phone" value={profile.phone} onChange={onChange} />
        <Input label="Avatar URL" name="avatarUrl" value={profile.avatarUrl} onChange={onChange} placeholder="https://example.com/photo.jpg" />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Input label="City" name="location.city" value={profile.location.city} onChange={onChange} />
        <Input label="Country" name="location.country" value={profile.location.country} onChange={onChange} />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Input label="Preferred Language" name="language" value={profile.language} onChange={onChange} />
      </div>
      <div>
        <p className="text-sm font-semibold text-slate-700">Travel Preferences</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {travelPrefs.map((pref) => {
            const active = profile.preferences.has(pref);
            return (
              <button
                key={pref}
                type="button"
                onClick={() => togglePref(pref)}
                className={`rounded-full px-3 py-1 text-sm font-semibold transition ${
                  active ? "bg-emerald-600 text-white shadow-sm" : "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                }`}
              >
                {pref}
              </button>
            );
          })}
        </div>
      </div>
      <div>
        <label className="text-sm font-semibold text-slate-700">Bio</label>
        <textarea
          name="bio"
          rows={4}
          value={profile.bio}
          onChange={onChange}
          className="mt-2 w-full rounded-2xl border border-emerald-100 px-4 py-3 text-slate-900 shadow-sm outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
          placeholder="Share a little about yourself..."
        />
      </div>
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {saving ? "Saving..." : "Save Profile"}
        </button>
        <p className="text-xs text-slate-500">Profile settings are stored; ready for API wiring.</p>
      </div>
    </form>
  </section>
);

export default ProfileForm;
