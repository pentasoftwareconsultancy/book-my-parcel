import {
  RefreshCw,
  ShieldOff,
  CheckCircle,
  XCircle,
  Clock,
  CreditCard,
  FileText,
  AlertTriangle,
  PhoneCall,
  Info,
  Ban,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function RefundPolicy() {
  const navigate = useNavigate();

  return (
    <main className="min-h-screen w-full bg-gray-100 py-10 px-3 sm:px-6">
      <div className="max-w-5xl mx-auto bg-white border border-gray-300 rounded-md shadow-md">

        {/* HEADER */}
        <header className="bg-[#4F5DFF] px-6 sm:px-8 py-6 text-white rounded-t-md flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold flex items-center gap-2">
              <FileText size={20} /> Return &amp; Refund Policy
            </h1>
            <p className="text-sm opacity-90 mt-1">
              Understand our refund eligibility, timelines, and cancellation rules.
            </p>
          </div>
        </header>

        {/* BODY */}
        <section className="px-6 sm:px-8 py-8 space-y-10 text-gray-800">

          {/* Intro note */}
          <div className="flex gap-3 bg-blue-50 border border-blue-200 rounded-md p-4 text-sm text-blue-800">
            <Info size={18} className="shrink-0 mt-0.5 text-blue-500" />
            <p>
              This policy outlines refund eligibility conditions for users of the Book My Parcel platform,
              created to comply with payment gateway requirements such as Razorpay.
            </p>
          </div>

          <Section
            icon={<ShieldOff size={20} className="text-indigo-600" />}
            title="1. Nature of Service (No Physical Returns)"
            text="Book My Parcel is a digital facilitation platform that connects parcel senders with independent travelers. The platform does not handle physical parcel transportation directly."
            list={[
              "Physical parcel returns are not handled by Book My Parcel.",
              "Parcel return arrangements must be handled directly between sender and recipient.",
              "Book My Parcel is not responsible for reverse logistics operations.",
            ]}
          />

          <Section
            icon={<CheckCircle size={20} className="text-green-600" />}
            title="2. Refund Eligibility"
            text="Refunds may be issued under the following conditions:"
            list={[
              "No Traveler Accepted the Request — Full platform fee may be refunded if no traveler confirms.",
              "Booking Cancelled Before Traveler Confirmation — Refund may be issued on early cancellation.",
              "Duplicate Payment — Refund issued for payments made twice due to a technical issue.",
              "Platform Technical Failure — Refund for verified platform-side technical errors.",
            ]}
          />

          <Section
            icon={<XCircle size={20} className="text-red-600" />}
            title="3. Non-Refundable Situations"
            text="Refunds will not be issued under the following conditions:"
            list={[
              "Traveler Already Confirmed — Platform fee becomes non-refundable once a traveler accepts.",
              "Parcel Handed Over — No refund once the parcel has been handed to the traveler.",
              "Delivery Delays — Delays due to traffic, weather, or travel changes are not eligible.",
              "Loss or Damage — Book My Parcel is not liable for loss, theft, or damage to parcels.",
              "Incorrect Information — Wrong address, contact, or parcel details provided by the sender.",
              "Prohibited Items — No refund if prohibited items are shipped.",
            ]}
          />

          <Section
            icon={<RefreshCw size={20} className="text-yellow-600" />}
            title="4. Partial Refund Policy"
            text="Partial refunds may be issued in limited cases. For example, if a booking is cancelled after traveler confirmation but before parcel handover, a partial refund may be issued after deducting applicable platform charges. All such cases will be evaluated individually by the platform administration team."
          />

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Ban size={20} className="text-orange-600 shrink-0 mt-0.5" />
              <h3 className="text-base font-semibold text-gray-900">5. Cancellation Policy</h3>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="bg-gray-50 border rounded-md p-4 space-y-2">
                <p className="text-sm font-semibold text-gray-700">Sender Cancellation</p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li className="flex items-center gap-2"><CheckCircle size={14} className="text-green-500 shrink-0" /> Before traveler confirmation → Eligible for refund</li>
                  <li className="flex items-center gap-2"><AlertTriangle size={14} className="text-yellow-500 shrink-0" /> After traveler confirmation → Refund may not apply</li>
                  <li className="flex items-center gap-2"><XCircle size={14} className="text-red-500 shrink-0" /> After parcel handover → No refund</li>
                </ul>
              </div>
              <div className="bg-gray-50 border rounded-md p-4 space-y-2">
                <p className="text-sm font-semibold text-gray-700">Traveler Cancellation</p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li className="flex items-center gap-2"><CheckCircle size={14} className="text-green-500 shrink-0" /> Sender may choose another traveler</li>
                  <li className="flex items-center gap-2"><CheckCircle size={14} className="text-green-500 shrink-0" /> Sender may request refund if no alternative is selected</li>
                </ul>
              </div>
            </div>
          </div>

          <Section
            icon={<Clock size={20} className="text-teal-600" />}
            title="6. Refund Processing Timeline"
            text="If a refund is approved, it will be processed to the original payment method."
            list={[
              "Estimated refund timeline: 5–10 business days.",
              "Actual timing may vary depending on bank and payment gateway processing.",
            ]}
          />

          <Section
            icon={<CreditCard size={20} className="text-blue-600" />}
            title="7. Payment Gateway Refund Handling"
            text="All refunds will be processed through the original payment method used during booking. Refunds will not be transferred to alternate bank accounts unless required by regulatory conditions."
          />

          <Section
            icon={<FileText size={20} className="text-purple-600" />}
            title="8. Refund Request Submission"
            text="Users must submit refund requests with the following details. Requests should be submitted within 48 hours of the relevant booking event."
            list={[
              "Booking ID",
              "Payment reference number",
              "Reason for refund",
              "Supporting proof (if applicable)",
            ]}
          />

          <Section
            icon={<AlertTriangle size={20} className="text-red-600" />}
            title="9. Chargeback Policy"
            text="Users are encouraged to contact platform support before initiating chargebacks with banks. Unauthorized chargebacks may result in:"
            list={[
              "Temporary account suspension",
              "Permanent account termination in case of misuse",
            ]}
          />

          <Section
            icon={<ShieldOff size={20} className="text-gray-600" />}
            title="10. Platform Rights"
            text="Book My Parcel reserves the right to:"
            list={[
              "Reject refund requests if policy conditions are not met.",
              "Deduct applicable processing or platform fees.",
              "Modify refund eligibility rules when necessary.",
              "Major policy changes will be communicated to users when published publicly.",
            ]}
          />

          <Section
            icon={<PhoneCall size={20} className="text-green-600" />}
            title="11. Contact Information"
            list={[
              "Support Email: support@bookmyparcel.com",
              "Legal Email: legal@bookmyparcel.com",
              "Phone: +91 1800-123-4567",
              "Support Hours: Monday to Saturday, 9:00 AM – 6:00 PM IST",
            ]}
          />

          {/* FOOTER ACTIONS */}
          <div className="pt-6 border-t border-gray-200">
            <button
              onClick={() => navigate(-1)}
              className="px-6 py-2.5 border rounded-md text-gray-700 hover:bg-gray-100 text-sm"
            >
              Back
            </button>
          </div>

        </section>
      </div>
    </main>
  );
}

function Section({ icon, title, text, list }) {
  return (
    <div className="space-y-3">
      <div className="flex items-start gap-3">
        <span className="shrink-0 mt-0.5">{icon}</span>
        <h3 className="text-base font-semibold text-gray-900">{title}</h3>
      </div>
      {text && <p className="text-sm text-gray-600 leading-relaxed pl-8">{text}</p>}
      {list && (
        <ul className="list-disc pl-14 text-sm text-gray-600 space-y-1">
          {list.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
