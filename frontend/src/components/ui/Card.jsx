import cn from "../../utils/cn.js";

const Card = ({ as: Comp = "div", className, children, ...props }) => (
  <Comp className={cn("rounded-3xl border border-slate-100 bg-white shadow-sm", className)} {...props}>
    {children}
  </Comp>
);

export default Card;
