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
 
  FileText,
} from "lucide-react";
import { FaFileAlt } from "react-icons/fa";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {termsSections} from "../datafiles/TermsData"


// ================= SAME FILE NAME =================
export default function TermsAndCondition() {
  const location = useLocation();
  const navigate = useNavigate();
  const deliveryData = location.state;





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

          {termsSections.map((item, index) => {
  const Icon = item.icon;

  return (
    <Section
      key={index}
      icon={ <div className="w-14 h-9 rounded-2xl bg-gradient-to-br from-blue-400 to-indigo-400 flex items-center justify-center">
    <Icon size={22} className="text-white" />
  </div>}
      title={item.title}
      text={item.text}
      list={item.list}
    />
  );
})}
          {/* AGREEMENT CHECKBOX */}
          
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
