import cn from "../../utils/cn.js";

const variants = {
  primary: "bg-emerald-600 text-white shadow-sm hover:bg-emerald-700 focus-visible:outline-emerald-600",
  secondary: "bg-white text-emerald-700 ring-1 ring-emerald-200 hover:bg-emerald-50",
  ghost: "bg-transparent text-slate-700 hover:bg-slate-100",
  subtle: "bg-slate-100 text-slate-800 hover:bg-slate-200",
};

const sizes = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2 text-sm",
  lg: "px-5 py-3 text-base",
};

const Button = ({ as: Comp = "button", variant = "primary", size = "md", className, children, ...props }) => (
  <Comp
    className={cn(
      "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60",
      variants[variant],
      sizes[size],
      className
    )}
    {...props}
  >
    {children}
  </Comp>
);

export default Button;
