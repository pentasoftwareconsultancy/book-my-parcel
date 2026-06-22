import { AlertTriangle, X } from "lucide-react";

export default function TravellerSelectionErrorModal({
  open,
  title = "Traveller unavailable",
  message,
  onClose,
  onAction,
  actionLabel = "OK",
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl animate-in fade-in">

        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-gray-100 p-5">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 text-orange-600">
              <AlertTriangle size={20} />
            </span>

            <div>
              <h3 className="text-base font-semibold text-gray-900">
                {title}
              </h3>
              <p className="text-xs text-gray-500">
                Please choose another traveller.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5">
          <p className="text-sm leading-6 text-gray-700">
            {message}
          </p>

          <button
            onClick={() => {
              onAction?.();
              onClose();
            }}
            className="mt-5 w-full rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-700"
          >
            {actionLabel}
          </button>
        </div>
      </div>
    </div>
  );
}