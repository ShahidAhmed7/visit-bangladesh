import cn from "../../utils/cn.js";

const Skeleton = ({ className }) => <div className={cn("animate-pulse rounded-2xl bg-slate-200", className)} />;

export default Skeleton;
