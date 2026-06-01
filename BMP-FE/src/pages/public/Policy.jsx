import {
  ShieldCheck,
  User,
  AlertTriangle,
  Activity,
  UserX,
  Edit,
  Info,
  Lock,
  CheckCircle,
  FileText,
} from "lucide-react";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import DeliveryDataManager from "../../services/DeliveryDataManager";

export default function Policy() {
  const [agreed, setAgreed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const deliveryData = location.state;

  const handleAgreeAndContinue = () => {
    if (deliveryData?.deliveryId) {
      DeliveryDataManager.updateDeliveryStatus(deliveryData.deliveryId, "ACTIVE");
      navigate(RoutePath.TRAVELER_DASHBOARD);
    } else {
      navigate(-1);
    }
  };

  return (
    <main className="min-h-screen w-full bg-gray-100 py-10 px-3 sm:px-6">
      <div className="max-w-5xl mx-auto bg-white border border-gray-300 rounded-md shadow-md">

        {/* HEADER */}
        <header className="bg-[#4F5DFF] px-6 sm:px-8 py-6 text-white rounded-t-md">
          <h1 className="text-xl sm:text-2xl font-semibold flex items-center gap-2">
            <FileText size={20} /> Privacy Policy
          </h1>
          <p className="text-sm opacity-90 mt-1">By registering as a traveler, you agree to all privacy policies.</p>
        </header>

        {/* BODY */}
        <section className="px-6 sm:px-8 py-8 space-y-10 text-gray-800">

          <h2 className="text-lg font-semibold text-gray-900 pt-6 border-t">Privacy Policy</h2>

          <Section icon={<ShieldCheck size={20} className="text-green-600" />} title="1. Information We Collect" list={["Personal info: Name, Phone, Email, Routes", "Delivery info: Parcel details and status", "Technical data: IP, device, usage data"]} />

          <Section icon={<Activity size={20} className="text-blue-600" />} title="2. How We Use Information" list={["Parcel matching", "Communication", "Payments", "Platform improvement", "Legal compliance"]} />

          <Section icon={<Info size={20} className="text-purple-600" />} title="3. Information Sharing" text="Shared only with users and authorized partners. We never sell traveler data." />

          <Section icon={<Lock size={20} className="text-teal-600" />} title="4. Data Security" text="Reasonable safeguards are used but no system is 100% secure." />

          <Section icon={<User size={20} className="text-orange-600" />} title="5. Data Retention" text="Data stored only as required by law. Travelers may request deletion." />

          <Section icon={<UserX size={20} className="text-red-600" />} title="6. Traveler Rights" list={["Access personal data", "Correct data", "Request deletion", "Withdraw consent"]} />

          <Section icon={<Activity size={20} className="text-green-600" />} title="7. Cookies & Tracking" text="Used for login and analytics. Manage via browser settings." />

          <Section icon={<AlertTriangle size={20} className="text-yellow-600" />} title="8. Children's Privacy" text="Travelers must be 18+ years old." />

          <Section icon={<Edit size={20} className="text-gray-600" />} title="9. Policy Updates" text="Policy may be updated periodically." />

          <Section icon={<Info size={20} className="text-blue-600" />} title="10. Contact Us" text="Contact official support for privacy concerns." />

          {/* AGREEMENT CHECKBOX */}
          <div className="flex items-center gap-2 mt-6 p-4 bg-gray-50 border rounded-md">
            <input type="checkbox" checked={agreed} onChange={() => setAgreed(!agreed)} className="w-4 h-4" />
            <p className="text-sm">I agree to the Privacy Policy</p>
          </div>

          {/* FOOTER ACTIONS */}
          <div className="pt-6 border-t border-gray-200">
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
