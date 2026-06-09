// import React from "react";
// import{ content} from "../../pages/datafiles/TermsData.js"

// function TermsPopup({ open, onClose, onAccept }) {
//   if (!open) return null;

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
//       <div className="bg-white w-[90%] max-w-3xl rounded-2xl shadow-2xl flex flex-col overflow-hidden">

//         {/* Header */}
//         <div className="p-4 border-b flex justify-between items-center bg-blue-600 text-white">
//           <h2 className="text-lg font-bold">Terms & Conditions</h2>
//           <button
//             onClick={onClose}
//             className="text-white text-xl font-bold hover:scale-110"
//           >
//             ✕
//           </button>
//         </div>

//         {/* Scrollable Content */}
//         <div className="p-6 max-h-[60vh] overflow-y-auto text-sm text-gray-700 whitespace-pre-line leading-relaxed">
//           {content}
//         </div>

//         {/* Footer Buttons */}
//         <div className="p-4 border-t flex justify-end gap-3">
//           <button
//             onClick={onClose}
//             className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition"
//           >
//             Decline
//           </button>

//           <button
//             onClick={onAccept}
//             className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
//           >
//             I Agree
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default TermsPopup;



import React from "react";
import { termsSections } from "../../pages/datafiles/TermsData";

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

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {termsSections.map((section, index) => (
            <div key={index} className="mb-5">
              <h3 className="font-semibold text-gray-900 mb-2">
                {section.title}
              </h3>

              {section.text && (
                <p className="text-sm text-gray-700 leading-relaxed">
                  {section.text}
                </p>
              )}

              {section.list && (
                <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                  {section.list.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
          >
            Decline
          </button>

          <button
            onClick={onAccept}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
          >
            I Agree
          </button>
        </div>
      </div>
    </div>
  );
}

export default TermsPopup;