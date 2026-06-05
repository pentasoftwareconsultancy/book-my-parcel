import React from "react";
import { FaLinkedinIn, FaFacebookF, FaTwitter, FaCheckCircle, FaMapMarkerAlt, FaPhoneAlt, FaEnvelope, FaCommentDots } from "react-icons/fa";
import { Link } from "react-router-dom";
import whitelogo from '../assets/whiteLogo.png';

const CONFIGS = {
  user: {
    bg: "linear-gradient(177.15deg, #1F2AFF -7.03%, #5C9DF2 105.42%)",
    quickLinks: [["/","Home"],["/about","About Us"],["/services","Services"],["/contact","Contact Us"]],
    supportTitle: "Support",
    supportLinks: [["/traveler-guidelines","Safety Guidelines"],["/termsandcondition","Terms & Conditions"],["/policy","Privacy Policy"],["/refund-policy","Refund & Cancellation Policy"],],
    bottomLinks: [["/termsandcondition","Terms"],["/policy","Privacy"],["/refund-policy","Refund Policy"]],
    badge: false, stats: false, verified: false,
  },
  traveler: {
    bg: "linear-gradient(105deg, #1F2AFF 0%, #3f7de1 50%, #3393c0 100%)",
    quickLinks: [["/travelerhome","Become a Traveler"],["/traveler-benefits","Traveler Benefits"],["/traveler-guidelines","Traveler Guidelines"],["/about","About Us"],],
    supportTitle: "Support and help",
    supportLinks: [["/traveler-guidelines","Traveler Guidelines"],["/termsandcondition","Terms & Conditions"],["/policy","Privacy Policy"],["/refund-policy","Refund & Cancellation Policy"],["/contact","Contact Us"]],
    bottomLinks: [["/policy","Privacy Policy"],["/termsandcondition","Terms & Conditions"],["/refund-policy","Refund Policy"]],
    badge: true, stats: true, verified: true,
  },
};

const SharedFooter = ({ type }) => {
  const { bg, quickLinks, supportTitle, supportLinks, bottomLinks, badge, stats, verified } = CONFIGS[type];
  const lnk = (to, label, cls = "") => <Link to={to} className={`text-white no-underline hover:underline opacity-90 ${cls}`}>{label}</Link>;

  return (
    <footer className="text-white" style={{ background: bg, fontFamily: "Arial, sans-serif", fontSize: "14px" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-5 lg:px-6 pt-4 pb-0">

        {/* LOGO */}
        <div className="mb-6"><img src={whitelogo} alt="BookMyParcel Logo" className="h-16 object-contain" /></div>

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[0.8fr_1fr_1fr_1.4fr] gap-4 mb-2 lg:items-start">

          {/* Quick Links */}
          <div>
            <h4 className="text-base font-bold mb-5">Quick links</h4>
            <ul className="list-none p-0 m-0 space-y-2">{quickLinks.map(([to, label]) => <li key={label}>{lnk(to, label)}</li>)}</ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-base font-bold mb-7">{supportTitle}</h4>
            <ul className="list-none p-0 m-0 space-y-2 mb-6">{supportLinks.map(([to, label]) => <li key={label}>{lnk(to, label)}</li>)}</ul>
            {badge && (
              <div style={{ border: "2px solid #1cff8a", borderRadius: "10px", padding: "10px 16px", display: "inline-flex", alignItems: "center", gap: "12px", cursor: "pointer" }}>
                <div style={{ width: "36px", height: "36px", background: "#1cff8a", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <FaCommentDots size={16} color="#fff" />
                </div>
                <div>
                  <div style={{ fontSize: "14px", fontWeight: "bold" }}>24/7 Support</div>
                  <div style={{ fontSize: "11px", opacity: 0.85 }}>We're here to help</div>
                </div>
              </div>
            )}
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-base font-bold mb-5">Contact Us</h4>
            <div className="space-y-4">
              {[[FaMapMarkerAlt, "Office Address:", <span>
  Flat No. 303, Sai Enclave-B, Tushar Park, Survey No. 17/1A, Dhanori, Near Dhanori Police Station, Pune - 411015, Maharashtra, India
</span>],
                [FaPhoneAlt, "Phone Number", "+91 9545444591"],
                [FaEnvelope, "Email Address", "support@bookmyparcel.com"]
              ].map(([Icon, title, value]) => (
                <div key={title} className="flex gap-3 items-start">
                  <Icon className="mt-1 shrink-0" size={15} />
                  <div><p className="font-bold text-sm m-0 mb-1">{title}</p><p className="opacity-90 text-sm m-0">{value}</p></div>
                </div>
              ))}
              {stats && (
                <div className="flex gap-3">
                  {[["50K+", "Active Partners"], ["1M+", "Deliveries Done"]].map(([val, lbl]) => (
                    <div key={lbl} className="flex-1 text-center py-3 px-4" style={{ background: "rgba(255,255,255,0.15)", borderRadius: "10px" }}>
                      <div className="font-bold text-lg">{val}</div>
                      <div className="text-xs opacity-85">{lbl}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Subscribe */}
          <div className="p-7" style={{ background: "rgba(255,255,255,0.15)", borderRadius: "14px" }}>
            <h4 className="text-base font-normal mb-5 opacity-90">Subscribe</h4>
            <div className="flex mb-5" style={{ borderRadius: "8px", overflow: "hidden", height: "60px" }}>
              <input type="email" placeholder="Email address" style={{ flex: 1, minWidth: 0, padding: "0 16px", border: "none", outline: "none", fontSize: "14px", color: "#9ca3af", background: "rgba(255,255,255,0.92)" }} />
              <button style={{ width: "50px", background: "rgba(28, 85, 224, 0.89)", border: "none", color: "#fff", cursor: "pointer", fontSize: "20px", display: "flex", alignItems: "center", justifyContent: "center" }}
                onMouseOver={e => e.currentTarget.style.background = "#2563eb"} onMouseOut={e => e.currentTarget.style.background = "#3b82f6"}>→</button>
            </div>
            <p className="text-xs opacity-90 leading-relaxed m-0">We're always happy to help! Contact Book My Parcel for quick assistance, guidance, or support. Your delivery experience matters to us — let's get your parcel moving.</p>
          </div>
        </div>

        {/* BOTTOM BAR */}
        <div className="border-t border-white/30 pt-2 flex flex-col sm:flex-row justify-between items-center gap-0 text-xs">
          <p className="opacity-90 text-center sm:text-left m-0 leading-relaxed">
  © 2025 BOOK MY PERCEL LLP. All Rights Reserved. Developed and Maintained by SmartMatrix Digital Services Pvt. Ltd.
</p>
          <div className="flex gap-6 opacity-90">{bottomLinks.map(([to, label]) => <span key={label}>{lnk(to, label)}</span>)}</div>
          <div className="flex gap-3">
            {[FaLinkedinIn, FaFacebookF, FaTwitter].map((Icon, i) => (
              <a key={i} href="#" className="w-9 h-9 rounded-full border border-white/60 flex items-center justify-center hover:bg-white/20 transition text-white no-underline"><Icon size={14} /></a>
            ))}
          </div>
        </div>

        {/* VERIFIED BAR — traveler only */}
        {verified && (
          <div className="mt-2 py-2 px-3 flex justify-center items-center gap-2 text-xs" style={{ background: "rgba(255,255,255,0.12)", borderRadius: "30px" }}>
            <FaCheckCircle size={14} /><span>Verified &amp; Secure Partner Portal</span><span style={{ opacity: 0.8, fontSize: "12px" }}>● SSL Encrypted</span>
          </div>
        )}

      </div>
    </footer>
  );
};

export const UserFooter = () => <SharedFooter type="user" />;
export const TravelerFooter = () => <SharedFooter type="traveler" />;
export default UserFooter;


