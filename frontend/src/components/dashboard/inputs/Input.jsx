const Input = ({ label, ...rest }) => (
  <div className="space-y-1">
    <label className="text-sm font-semibold text-slate-700">{label}</label>
    <input
      {...rest}
      className={`w-full rounded-2xl border border-emerald-100 px-4 py-3 text-slate-900 shadow-sm outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 ${
        rest.disabled ? "bg-slate-50 text-slate-500" : ""
      }`}
    />
  </div>
);

export default Input;
