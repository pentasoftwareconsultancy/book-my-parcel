import {
  ShieldCheck,
  User,
  AlertTriangle,
  Activity,
  UserX,
  Edit,
  Info,
  Lock,
  Download,
  CheckCircle,
  FileText,
} from "lucide-react";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import DeliveryDataManager from "../../services/DeliveryDataManager";

// ================= SAME FILE NAME =================
export default function Policy() {
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
    doc.text("Book My Parcel -Privacy Policy", 14, 20);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);

    const content = `
================ PRIVACY POLICY ================

1. Information We Collect
Personal Information: Name, Phone, Email, Travel routes
Delivery Information: Parcel details, pickup/drop locations, status updates
Technical Data: Device info, IP address, platform usage

2. How We Use Traveler Information
- Parcel matching and delivery
- Communication with users
- Payment processing and performance tracking
- Platform safety and improvements
- Legal compliance

3. Information Sharing
- Shared with users for delivery coordination
- Shared with authorized third parties when required
- Data is never sold or rented

4. Data Security
- Reasonable safeguards implemented
- No system guarantees 100% security

5. Data Retention
- Retained only as required for service or law
- Travelers may request deletion

6. Traveler Rights
- Access personal data
- Correct inaccurate data
- Request deletion
- Withdraw consent

7. Cookies & Tracking
- Used for login security and analytics
- Manage via browser settings

8. Children’s Privacy
- Travelers must be 18+ years old

9. Policy Updates
- Policy may be updated periodically

10. Contact Us
- Contact official support for privacy concerns
`;

    const lines = doc.splitTextToSize(content, 180);
    doc.text(lines, 14, 30);
    doc.save("Traveler_Terms_Privacy_BookMyParcel.pdf");
  };

  return (
    <main className="min-h-screen w-full bg-gray-100 py-10 px-3 sm:px-6">
      <div className="max-w-5xl mx-auto bg-white border border-gray-300 rounded-md shadow-md">
        {/* HEADER */}
        <header className="bg-[#4F5DFF] px-6 sm:px-8 py-6 text-white rounded-t-md flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold flex items-center gap-2"><FileText size={20} /> Privacy Policy</h1>
            <p className="text-sm opacity-90 mt-1">By registering as a traveler, you agree to all privacy policies.</p>
          </div>
          <button onClick={handleDownloadPDF} className="flex items-center gap-2 bg-white text-[#4F5DFF] px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-100">
            <Download size={16} /> Download PDF
          </button>
        </header>

        {/* BODY */}
        <section className="px-6 sm:px-8 py-8 space-y-10 text-gray-800">

          {/* PRIVACY POLICY SECTION */}
          <h2 className="text-lg font-semibold text-gray-900 pt-6 border-t">Privacy Policy</h2>

          <Section icon={<ShieldCheck size={20} className="text-green-600" />} title="1. Information We Collect" list={["Personal info: Name, Phone, Email, Routes","Delivery info: Parcel details and status","Technical data: IP, device, usage data"]} />

          <Section icon={<Activity size={20} className="text-blue-600" />} title="2. How We Use Information" list={["Parcel matching","Communication","Payments","Platform improvement","Legal compliance"]} />

          <Section icon={<Info size={20} className="text-purple-600" />} title="3. Information Sharing" text="Shared only with users and authorized partners. We never sell traveler data." />

          <Section icon={<Lock size={20} className="text-teal-600" />} title="4. Data Security" text="Reasonable safeguards are used but no system is 100% secure." />

          <Section icon={<User size={20} className="text-orange-600" />} title="5. Data Retention" text="Data stored only as required by law. Travelers may request deletion." />

          <Section icon={<UserX size={20} className="text-red-600" />} title="6. Traveler Rights" list={["Access personal data","Correct data","Request deletion","Withdraw consent"]} />

          <Section icon={<Activity size={20} className="text-green-600" />} title="7. Cookies & Tracking" text="Used for login and analytics. Manage via browser settings." />

          <Section icon={<AlertTriangle size={20} className="text-yellow-600" />} title="8. Children’s Privacy" text="Travelers must be 18+ years old." />

          <Section icon={<Edit size={20} className="text-gray-600" />} title="9. Policy Updates" text="Policy may be updated periodically." />

          <Section icon={<Info size={20} className="text-blue-600" />} title="10. Contact Us" text="Contact official support for privacy concerns." />
          
          {/* AGREEMENT CHECKBOX */}
          <div className="flex items-center gap-2 mt-6 p-4 bg-gray-50 border rounded-md">
            <input type="checkbox" checked={agreed} onChange={() => setAgreed(!agreed)} className="w-4 h-4" />
            <p className="text-sm">I agree to the Privacy Policy</p>
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
