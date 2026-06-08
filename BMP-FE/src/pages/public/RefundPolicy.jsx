import {

  FileText,
 
  Info,
  Ban,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { refundSections, introText} from "../datafiles/RefundPolicy.js";
export default function RefundPolicy() {
  const navigate = useNavigate();

  return (
    <main className="min-h-screen w-full bg-gray-100 py-10 px-3 sm:px-6">
      <div className="max-w-5xl mx-auto bg-white border border-gray-300 rounded-md shadow-md">
        <header className="bg-[#4F5DFF] px-6 sm:px-8 py-6 text-white rounded-t-md">
          <h1 className="text-xl sm:text-2xl font-semibold flex items-center gap-2">
            <FileText size={20} />
            Return & Refund Policy
          </h1>
          <p className="text-sm opacity-90 mt-1">
            Understand our refund eligibility, timelines, and cancellation
            rules.
          </p>
        </header>

        <section className="px-6 sm:px-8 py-8 space-y-8">
          <div className="flex gap-3 bg-blue-50 border border-blue-200 rounded-md p-4 text-sm text-blue-800">
            <Info size={18} className="shrink-0 mt-0.5 text-blue-500" />
            <p>{introText}</p>
          </div>

          {refundSections.map((section, index) => {
            const Icon = section.icon;

            return (
              <Section
                key={index}
                icon={<Icon size={20} className={section.iconColor} />}
                title={section.title}
                text={section.text}
                list={section.list}
              />
            );
          })}

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Ban
                size={20}
                className="text-orange-600 shrink-0 mt-0.5"
              />
              <h3 className="text-base font-semibold text-gray-900">
                5. Cancellation Policy
              </h3>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="bg-gray-50 border rounded-md p-4">
                <p className="font-semibold mb-2">Sender Cancellation</p>
                <ul className="space-y-2 text-sm">
                  <li>✓ Before traveler confirmation → Eligible for refund</li>
                  <li>⚠ After traveler confirmation → Refund may not apply</li>
                  <li>✕ After parcel handover → No refund</li>
                </ul>
              </div>

              <div className="bg-gray-50 border rounded-md p-4">
                <p className="font-semibold mb-2">Traveler Cancellation</p>
                <ul className="space-y-2 text-sm">
                  <li>✓ Sender may choose another traveler</li>
                  <li>✓ Sender may request refund if no alternative is selected</li>
                </ul>
              </div>
            </div>
          </div>

          {/* <div className="pt-6 border-t border-gray-200">
            <button
              onClick={() => navigate(-1)}
              className="px-6 py-2.5 border rounded-md text-gray-700 hover:bg-gray-100 text-sm"
            >
              Back
            </button>
          </div> */}
        </section>
      </div>
    </main>
  );
}

function Section({ icon, title, text, list }) {
  return (
    <div className="space-y-3">
      <div className="flex items-start gap-3">
        <span>{icon}</span>
        <h3 className="text-base font-semibold text-gray-900">
          {title}
        </h3>
      </div>

      {text && (
        <p className="text-sm text-gray-600 leading-relaxed pl-8">
          {text}
        </p>
      )}

      {list && (
        <ul className="list-disc pl-14 text-sm text-gray-600 space-y-1">
          {list.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      )}
    </div>
  );
}