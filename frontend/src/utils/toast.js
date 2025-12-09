import toast from "react-hot-toast";
import { createElement } from "react";

export const showConfirmToast = (message, onConfirm) =>
  toast.custom((t) =>
    createElement(
      "div",
      {
        className:
          "w-72 rounded-xl border border-emerald-100 bg-white p-4 text-slate-900 shadow-lg shadow-emerald-100/70",
      },
      createElement("p", { className: "text-sm font-semibold" }, "Are you sure?"),
      createElement("p", { className: "mt-1 text-xs text-slate-600" }, message),
      createElement(
        "div",
        { className: "mt-3 flex justify-end gap-2" },
        createElement(
          "button",
          {
            onClick: () => toast.dismiss(t.id),
            className:
              "rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 transition hover:border-slate-300",
          },
          "Cancel"
        ),
        createElement(
          "button",
          {
            onClick: async () => {
              await onConfirm();
              toast.dismiss(t.id);
            },
            className:
              "rounded-full bg-rose-600 px-3 py-1 text-xs font-semibold text-white shadow-sm transition hover:bg-rose-700",
          },
          "Delete"
        )
      )
    )
  );
