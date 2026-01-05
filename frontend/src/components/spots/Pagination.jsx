const Pagination = ({ page, totalPages, onPage }) => {
  if (!totalPages || totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-2 py-6">
      <button
        onClick={() => onPage(Math.max(1, page - 1))}
        className="rounded-md border border-emerald-100 px-3 py-1 text-sm"
        disabled={page <= 1}
      >
        Prev
      </button>
      <span className="text-sm text-slate-600">Page {page} of {totalPages}</span>
      <button
        onClick={() => onPage(Math.min(totalPages, page + 1))}
        className="rounded-md border border-emerald-100 px-3 py-1 text-sm"
        disabled={page >= totalPages}
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;
