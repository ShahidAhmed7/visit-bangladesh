const RatingStars = ({ value = 0, onChange, interactive = false, sizeClass = "text-lg" }) => {
  const stars = [1, 2, 3, 4, 5];
  const filled = "\u2605";
  const empty = "\u2606";

  return (
    <div className="flex items-center gap-1">
      {stars.map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => interactive && onChange?.(star)}
          disabled={!interactive}
          className={interactive ? "cursor-pointer" : "cursor-default"}
          aria-label={`Rate ${star} out of 5`}
        >
          <span className={`${sizeClass} ${star <= value ? "text-amber-400" : "text-slate-300"}`}>
            {star <= value ? filled : empty}
          </span>
        </button>
      ))}
    </div>
  );
};

export default RatingStars;
