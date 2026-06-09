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
      icon={
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center shadow-sm shrink-0">
          <Icon size={22} className="text-white" />
        </div>
      }
      title={section.title}
      text={section.text}
      list={section.list}
    />
  );
})}

          <div className="flex gap-4 items-start">
  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center shadow-sm shrink-0">
    <Ban size={22} className="text-white" />
  </div>

  <div className="flex-1">
    <h3 className="text-lg font-semibold text-gray-900 mb-3">
      5. Cancellation Policy
    </h3>

    <div className="grid sm:grid-cols-2 gap-4">
      <div className="bg-gray-50 border rounded-xl p-4">
        <p className="font-semibold mb-2">Sender Cancellation</p>
        <ul className="space-y-2 text-sm text-gray-600">
          <li>✓ Before traveler confirmation → Eligible for refund</li>
          <li>⚠ After traveler confirmation → Refund may not apply</li>
          <li>✕ After parcel handover → No refund</li>
        </ul>
      </div>

      <div className="bg-gray-50 border rounded-xl p-4">
        <p className="font-semibold mb-2">Traveler Cancellation</p>
        <ul className="space-y-2 text-sm text-gray-600">
          <li>✓ Sender may choose another traveler</li>
          <li>✓ Sender may request refund if no alternative is selected</li>
        </ul>
      </div>
    </div>
  </div>
</div>

        </section>
      </div>
    </main>
  );
}

function Section({ icon, title, text, list }) {
  return (
    <div className="flex gap-4 items-start">
      {/* Icon */}
      <div className="shrink-0">
        {icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {title}
        </h3>

        {text && (
          <p className="text-sm text-gray-600 leading-relaxed">
            {text}
          </p>
        )}

        {list && (
          <ul className="list-disc pl-5 mt-3 text-sm text-gray-600 space-y-2">
            {list.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}