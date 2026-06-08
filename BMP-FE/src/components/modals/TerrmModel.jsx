import React from "react";
import{ content} from "../../pages/datafiles/TermsData.js"

function TermsPopup({ open, onClose, onAccept }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-white w-[90%] max-w-3xl rounded-2xl shadow-2xl flex flex-col overflow-hidden">

        {/* Header */}
        <div className="p-4 border-b flex justify-between items-center bg-blue-600 text-white">
          <h2 className="text-lg font-bold">Terms & Conditions</h2>
          <button
            onClick={onClose}
            className="text-white text-xl font-bold hover:scale-110"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto text-sm text-gray-700 whitespace-pre-line leading-relaxed">
          {content}
        </div>

        {/* Footer Buttons */}
        <div className="p-4 border-t flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition"
          >
            Decline
          </button>

          <button
            onClick={onAccept}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
          >
            I Agree
          </button>
        </div>
      </div>
    </div>
  );
}

export default TermsPopup;