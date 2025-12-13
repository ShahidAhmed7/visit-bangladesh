import Input from "./inputs/Input.jsx";

const PasswordForm = ({ passwords, setPasswords, saving, onSave }) => (
  <div className="rounded-2xl bg-emerald-50/80 p-4 shadow-inner ring-1 ring-emerald-100">
    <h3 className="text-sm font-bold text-slate-900">Password</h3>
    <form className="mt-3 grid gap-3 md:grid-cols-3" onSubmit={onSave}>
      <Input
        type="password"
        label="Current"
        value={passwords.currentPassword}
        onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
        required
      />
      <Input
        type="password"
        label="New"
        value={passwords.newPassword}
        onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
        required
      />
      <Input
        type="password"
        label="Confirm"
        value={passwords.confirmPassword}
        onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
        required
      />
      <div className="md:col-span-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {saving ? "Updating..." : "Update Password"}
        </button>
      </div>
    </form>
  </div>
);

export default PasswordForm;
