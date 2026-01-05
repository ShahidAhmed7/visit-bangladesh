import Input from "./inputs/Input.jsx";

const ProfileForm = ({
  profile,
  onChange,
  onSave,
  saving,
  togglePref,
  travelPrefs,
  logout,
  avatarPreview,
  onAvatarChange,
  disabled = false,
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
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-emerald-600 text-2xl font-bold text-white shadow-lg shadow-emerald-100">
          {avatarPreview ? (
            <img src={avatarPreview} alt="Profile" className="h-full w-full object-cover" />
          ) : (
            profile.name?.[0]?.toUpperCase() || "U"
          )}
        </div>
        <div className="space-y-1">
          <label className="text-sm font-semibold text-slate-700">Profile photo</label>
          <input
            type="file"
            accept="image/*"
            onChange={onAvatarChange}
            disabled={disabled}
            className="block text-sm text-slate-600 file:mr-4 file:rounded-full file:border-0 file:bg-emerald-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-emerald-700 disabled:opacity-60"
          />
          <p className="text-xs text-slate-500">PNG, JPG, or WEBP up to 5MB.</p>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Input label="Full Name" name="name" value={profile.name} onChange={onChange} required disabled={disabled} />
        <Input label="Email" name="email" value={profile.email} disabled />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Input label="Phone" name="phone" value={profile.phone} onChange={onChange} disabled={disabled} />
        <Input
          label="Avatar URL"
          name="avatarUrl"
          value={profile.avatarUrl}
          onChange={onChange}
          disabled={disabled}
          placeholder="https://example.com/photo.jpg"
        />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Input label="City" name="location.city" value={profile.location.city} onChange={onChange} disabled={disabled} />
        <Input label="Country" name="location.country" value={profile.location.country} onChange={onChange} disabled={disabled} />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Input label="Preferred Language" name="language" value={profile.language} onChange={onChange} disabled={disabled} />
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
                disabled={disabled}
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
          disabled={disabled}
          className="mt-2 w-full rounded-2xl border border-emerald-100 px-4 py-3 text-slate-900 shadow-sm outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
          placeholder="Share a little about yourself..."
        />
      </div>
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={saving || disabled}
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
