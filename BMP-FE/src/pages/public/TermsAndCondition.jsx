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
      <div className="max-w-5xl mx-auto bg-white border border-gray-300 rounded-md shadow-md">

        {/* HEADER */}
        <header className="bg-[#4F5DFF] px-6 sm:px-8 py-6 text-white rounded-t-md flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold flex items-center gap-2"><FileText size={20} /> Traveler Terms</h1>
            <p className="text-sm opacity-90 mt-1">By registering as a traveler, you agree to all terms</p>
          </div>

          <button onClick={handleDownloadPDF} className="flex items-center gap-2 bg-white text-[#4F5DFF] px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-100">
            <Download size={16} /> Download PDF
          </button>
        </header>

        {/* BODY */}
        <section className="px-6 sm:px-8 py-8 space-y-10 text-gray-800">

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
          <div className="flex items-center gap-2 mt-6 p-4 bg-gray-50 border rounded-md">
            <input type="checkbox" checked={agreed} onChange={() => setAgreed(!agreed)} className="w-4 h-4" />
            <p className="text-sm">I agree to the Terms & Conditions </p>
          </div>

          {/* FOOTER ACTIONS */}
          <div className="pt-6 border-t border-gray-200 space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={() => navigate(-1)}
                className="px-6 py-2.5 border rounded-md text-gray-700 hover:bg-gray-100"
              >
                Back
              </button>
              <button 
                disabled={!agreed} 
                onClick={handleAgreeAndContinue}
                className={`px-6 py-2.5 rounded-md font-medium flex items-center gap-2 ${
                  agreed ? "bg-[#4F5DFF] text-white hover:bg-[#3F4DFF]" : "bg-gray-300 text-gray-600 cursor-not-allowed"
                }`}
              >
                <CheckCircle size={18} /> 
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
    <div className="space-y-3">
      <div className="flex items-start gap-3">
        {icon}
        <h3 className="text-base font-semibold text-gray-900">{title}</h3>
      </div>

      {text && <p className="text-sm text-gray-600 leading-relaxed">{text}</p>}

      {list && (
        <ul className="list-disc pl-6 text-sm text-gray-600 space-y-1">
          {list.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
