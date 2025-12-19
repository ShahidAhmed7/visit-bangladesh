import { forwardRef } from "react";
import cn from "../../utils/cn.js";

const Input = forwardRef(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100",
      className
    )}
    {...props}
  />
));

Input.displayName = "Input";

export default Input;
