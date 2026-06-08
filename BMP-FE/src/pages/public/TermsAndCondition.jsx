import {
  ShieldCheck,
  User,
  AlertTriangle,
  Truck,
  MapPin,
  Activity,
  CreditCard,
  XCircle,
  Lock,
  UserX,
  Edit,
  Info,
  Download,
  CheckCircle,
  FileText,
} from "lucide-react";
import { FaFileAlt } from "react-icons/fa";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import DeliveryDataManager from "../../services/DeliveryDataManager";
import {content} from "../datafiles/ServiceData";

// ================= SAME FILE NAME =================
export default function TermsAndCondition() {
  const [agreed, setAgreed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const deliveryData = location.state;

  const handleAgreeAndContinue = () => {
    if (deliveryData?.deliveryId) {
      // Accept the delivery after agreeing to terms
      DeliveryDataManager.updateDeliveryStatus(deliveryData.deliveryId, "ACTIVE");
      
      // Navigate back to dashboard with success message
      navigate(RoutePath.TRAVELER_DASHBOARD);
    } else {
      // Regular terms acceptance (not from delivery)
      navigate(-1);
    }
  };

  // ================= DOWNLOAD PDF FUNCTION =================
  const handleDownloadPDF = async () => {
    const { default: jsPDF } = await import("jspdf");
    const doc = new jsPDF("p", "mm", "a4");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("Book My Parcel - Traveler Terms", 14, 20);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);



    const lines = doc.splitTextToSize(content, 180);
    doc.text(lines, 14, 30);
    doc.save("Traveler_Terms_BookMyParcel.pdf");
  };

  return (
    <main className="min-h-screen w-full bg-gray-100 py-10 px-3 sm:px-6">
      <div className="max-w-5xl mx-auto bg-white border border-gray-300 rounded-2xl shadow-lg overflow-hidden">

        {/* HEADER — matches project's signature gradient */}
        <header
          className="relative px-6 sm:px-8 py-7 text-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 overflow-hidden"
          style={{ background: "linear-gradient(180deg, #1F2AFF 0%, #5C9DF2 139.02%)" }}
        >
          {/* Pattern overlay */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: "url('/whychooseus-bg.png')",
              backgroundSize: "1150px",
              backgroundRepeat: "repeat",
              opacity: 1,
              mixBlendMode: "invert",
            }}
          />
          {/* Decorative blurs */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full blur-2xl" />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-semibold mb-3">
              <FaFileAlt className="text-xs" /> Legal Document
            </div>
            <h1 className="text-xl sm:text-2xl font-black flex items-center gap-2">
              <FileText size={20} /> Traveler Terms & Conditions
            </h1>
            <p className="text-sm text-white/80 mt-1">
              By registering as a traveler, you agree to all terms
            </p>
          </div>

          <button
            onClick={handleDownloadPDF}
            className="relative z-10 flex items-center gap-2 bg-white text-blue-700 px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-50 shadow-md transition-all duration-200 shrink-0"
          >
            <Download size={16} /> Download PDF
          </button>
        </header>

        {/* BODY */}
        <section className="px-6 sm:px-8 py-8 space-y-8 text-gray-800">

          {/* Legal Entity Banner — styled as a proper info card */}
          <div className="relative overflow-hidden rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-5 sm:p-6">
            {/* Left accent stripe */}
            <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl bg-gradient-to-b from-blue-600 to-indigo-600" />

            <div className="flex flex-col sm:flex-row sm:items-start gap-4 pl-4">
              <div className="shrink-0 w-11 h-11 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
                <Info size={20} className="text-white" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.15em] text-blue-500 mb-1">
                  Governing Entity
                </p>
                <p className="text-sm text-gray-700 leading-relaxed">
                  These Terms &amp; Conditions are governed by and binding upon{" "}
                  <span className="font-black text-blue-700 text-base">BOOK MY PERCEL LLP</span>
                  {" "}— a Limited Liability Partnership registered under the laws of India,
                  operating the platform at{" "}
                  <span className="font-semibold text-blue-600">bookmyparcel.co.in</span>.
                </p>
              </div>
            </div>
          </div>

          <Section icon={<ShieldCheck size={20} className="text-green-600" />} title="1. Platform Role" text="Book My Parcel is a technology platform connecting users with travelers. Travelers are independent individuals and the platform does not provide courier services." />

          <Section icon={<User size={20} className="text-blue-600" />} title="2. Eligibility" list={["Must be 18 years or older","Provide accurate and updated profile information","Must have valid travel plans for accepted routes"]} />

          <Section icon={<Truck size={20} className="text-orange-600" />} title="3. Acceptance of Parcels" list={["Accept or reject parcel requests","Review parcel details before accepting","Do not accept illegal or hazardous items","Must complete delivery after acceptance"]} />

          <Section icon={<MapPin size={20} className="text-teal-600" />} title="4. Parcel Handling & Delivery" list={["Handle parcels with care","Do not open or tamper","Deliver only to intended recipient","Third party only for delivery"]} />

          <Section icon={<CreditCard size={20} className="text-yellow-600" />} title="5. Payments" list={["Payment after successful delivery","Payments processed via platform","Service fees may be deducted"]} />

          <Section icon={<XCircle size={20} className="text-purple-600" />} title="6. Cancellations" text="Avoid canceling after accepting parcels. Frequent cancellations may impact ratings or account suspension." />

          <Section icon={<Activity size={20} className="text-green-600" />} title="7. Ratings & Performance" text="Travelers are rated on punctuality, communication, and delivery success. Poor ratings may lead to termination." />

          <Section icon={<AlertTriangle size={20} className="text-red-600" />} title="8. Legal Compliance & Safety" text="Travelers must follow all local laws and are responsible for actions during transit." />

          <Section icon={<Info size={20} className="text-red-600" />} title="9. Prohibited Conduct" list={["Carrying illegal items","Fraud or harassment","Misuse of user data","False delivery confirmations"]} />

          <Section icon={<UserX size={20} className="text-red-600" />} title="10. Limitation of Liability" text="Platform is not responsible for loss, delay, or disputes. Travelers indemnify the platform." />

          <Section icon={<Lock size={20} className="text-blue-600" />} title="11. Account Suspension or Termination" text="Accounts may be suspended or terminated for violations of policies." />

          <Section icon={<Edit size={20} className="text-green-600" />} title="12. Governing Law" text="These terms are governed by the laws of India and disputes handled in Indian courts." />

          {/* AGREEMENT CHECKBOX */}
          <div className="flex items-center gap-3 mt-6 p-4 sm:p-5 bg-blue-50 border border-blue-200 rounded-2xl cursor-pointer" onClick={() => setAgreed(!agreed)}>
            <div className={`w-5 h-5 shrink-0 rounded-md border-2 flex items-center justify-center transition-all duration-200 ${agreed ? "bg-blue-600 border-blue-600" : "border-gray-300 bg-white"}`}>
              {agreed && <CheckCircle size={14} className="text-white" />}
            </div>
            <p className="text-sm font-medium text-gray-700 select-none">
              I have read and agree to the <span className="text-blue-600 font-semibold">Terms & Conditions</span>
            </p>
          </div>

          {/* FOOTER ACTIONS */}
          <div className="pt-4 border-t border-gray-100">
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => navigate(-1)}
                className="px-6 py-2.5 border border-gray-300 rounded-xl text-gray-600 text-sm font-semibold hover:bg-gray-50 transition-all duration-200"
              >
                ← Back
              </button>
              <button
                disabled={!agreed}
                onClick={handleAgreeAndContinue}
                className={`px-6 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 transition-all duration-200 shadow-md ${
                  agreed
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}
              >
                <CheckCircle size={16} />
                {deliveryData?.deliveryId ? "Accept Delivery" : "Agree & Continue"}
              </button>
            </div>
          </div>

        </section>
      </div>
    </main>
  );
}

/* ================= SECTION COMPONENT ================= */
function Section({ icon, title, text, list }) {
  return (
    <div className="group flex gap-4 p-4 rounded-2xl hover:bg-gray-50 transition-all duration-200">
      {/* Icon bubble */}
      <div className="shrink-0 w-9 h-9 rounded-xl bg-gray-100 group-hover:bg-white group-hover:shadow-md flex items-center justify-center transition-all duration-200 mt-0.5">
        {icon}
      </div>

      <div className="flex-1 space-y-2">
        <h3 className="text-sm font-bold text-gray-900">{title}</h3>

        {text && (
          <p className="text-sm text-gray-500 leading-relaxed">{text}</p>
        )}

        {list && (
          <ul className="space-y-1.5">
            {list.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-500">
                <span className="mt-1.5 shrink-0 w-1.5 h-1.5 rounded-full bg-blue-400" />
                {item}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
