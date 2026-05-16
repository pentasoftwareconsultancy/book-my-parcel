import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Step1Img from "../../assets/homeimage/parcel1.png";
import Step2Img from "../../assets/homeimage/parcel2.png";
import Step3Img from "../../assets/homeimage/parcel3.png";
import Step4Img from "../../assets/homeimage/parcel4.png";

import { FiBookmark } from "react-icons/fi";
import { MdVerifiedUser } from "react-icons/md";
import { FaBookmark, FaShieldAlt, FaTruck } from "react-icons/fa";
import { BsPersonBadge } from "react-icons/bs";
import { FiPackage } from "react-icons/fi";
import RoutePath from "../../core/constants/routes.constant";
import { showInfo } from "../../core/utils/toast.util";

const steps = [
  {
    title: "Book Your Parcel",
    desc: "Users enter pickup & drop details, add parcel info, and confirm the request in just a few taps.",
    img: Step1Img,
    icon: FaBookmark,
  },
  {
    title: "Get Matched With Delivery Partner",
    desc: "Our system finds verified delivery partners traveling on the same route.",
    img: Step2Img,
    icon: BsPersonBadge,
  },
  {
    title: "Secure Pickup With OTP",
    desc: "Parcel pickup is secured with OTP verification for complete safety.",
    img: Step3Img,
    icon: FaShieldAlt,
  },
  {
    title: "Track & Receive Parcel",
    desc: "Track your parcel in real-time and receive it safely at destination.",
    img: Step4Img,
    icon: FaTruck,
  },
];

export default function HowBook() {
  const navigate = useNavigate();
  const { isAuthenticated: isLoggedIn } = useSelector((state) => state.auth);

  const handleSendParcel = () => {
    if (isLoggedIn) {
      navigate(RoutePath.USER_REQUEST_FORM);
    } else {
      showInfo("Please log in to send a parcel.");
      navigate(RoutePath.AUTH_LOGIN, { state: { from: RoutePath.USER_REQUEST_FORM } });
    }
  };

  return (
    <section className="relative pt-4 pb-0 lg:pb-0 bg-gradient-to-b from-[#FFFDF6] to-[#F8FAFC] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <style>{`
          @keyframes dashMove {
            to { stroke-dashoffset: -40; }
          }
          .animated-dash {
            animation: dashMove 1.5s linear infinite;
          }
        `}</style>

        {/* ── MOBILE + TABLET LAYOUT (visible below lg = below 1024px) ── */}
        <div className="flex flex-col lg:hidden">

          {/* Title */}
          <div className="text-center pt-2 pb-6 sm:pb-10">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold">
              <span className="text-blue-600 font-normal">How Book My Parcel</span>
              <br />
              <span className="text-blue-700 font-black">Works?</span>
            </h2>
          </div>

          {steps.map((step, i) => (
            <div key={i}>

              {/* ── Tablet: side-by-side alternating | Mobile: stacked ── */}
              <div className="flex flex-col md:flex-row md:items-center md:gap-10 gap-4 mb-6 md:mb-10">

                {/* Image — alternates sides on tablet */}
                <div className={`flex justify-center md:w-1/2 ${i % 2 === 1 ? "md:order-2" : "md:order-1"}`}>
                  <div className="relative group">
                    <div className="absolute -inset-4 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full opacity-20 blur-xl" />
                    <img
                      src={step.img}
                      alt={step.title}
                      className="relative max-w-[200px] sm:max-w-[260px] md:max-w-[300px] w-full h-auto object-contain"
                    />
                  </div>
                </div>

                {/* Card — alternates sides on tablet */}
                <div className={`flex flex-col items-center md:w-1/2 ${i % 2 === 1 ? "md:order-1 md:items-end" : "md:order-2 md:items-start"}`}>
                  <div className="relative group w-full max-w-sm md:max-w-md">
                    <div className="text-white rounded-2xl shadow-2xl p-5 sm:p-6 transform md:group-hover:scale-105 transition-all duration-300 flex items-start gap-4 bg-primary">
                      <div className="p-4 bg-white/20 rounded-xl shrink-0 flex items-center justify-center self-stretch">
                        <step.icon className="text-3xl md:text-4xl" />
                      </div>
                      <div>
                        <h3 className="text-base sm:text-lg md:text-xl font-bold leading-tight mb-2">
                          {i + 1}. {step.title}
                        </h3>
                        <p className="text-xs sm:text-sm leading-relaxed opacity-90">
                          {step.desc}
                        </p>
                      </div>
                    </div>

                    {/* Send Parcel button after last card */}
                    {i === 3 && (
                      <div className="mt-3 flex justify-start">
                        <button onClick={handleSendParcel} className="inline-flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-primary/90 transform hover:scale-105 transition-all duration-300 shadow-lg">
                          <FiPackage className="text-base" />
                          Send Parcel
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Animated connector between steps — tablet only */}
              {i < 3 && (
                <div className="hidden md:block w-full overflow-visible pointer-events-none" style={{ marginTop: '-60px', marginBottom: '-20px' }}>
                  <svg width="100%" height="100" viewBox="0 0 800 100" fill="none">
                    <path
                      d={i % 2 === 0
                        ? "M 600 0 C 600 50, 400 50, 400 50 C 400 50, 200 50, 200 100"
                        : "M 200 0 C 200 50, 400 50, 400 50 C 400 50, 600 50, 600 100"
                      }
                      stroke="#2563EB"
                      strokeWidth="2.5"
                      strokeDasharray="8 10"
                      strokeLinecap="round"
                      className="animated-dash"
                    />
                    <polygon
                      points={i % 2 === 0 ? "200,100 192,84 208,84" : "600,100 592,84 608,84"}
                      fill="#2563EB"
                      opacity="0.9"
                    />
                  </svg>
                </div>
              )}

            </div>
          ))}
        </div>

        {/* ── DESKTOP LAYOUT (unchanged, hidden below lg = 1024px) ── */}
        <div className="hidden lg:flex flex-col">
          {steps.map((step, i) => (
            <div key={i}>

              <div className={`grid lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-20 items-center ${i % 2 === 1 ? "lg:grid-flow-col-dense" : ""
                }`}>
                {/* Image */}
                <div className={`flex justify-center ${i % 2 === 1 ? "lg:col-start-2 lg:justify-end lg:pr-8" : ""}`}>                  
                  <div className="relative group">
                  <div className="absolute -inset-4 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full opacity-20 group-hover:opacity-30 transition-opacity duration-300 blur-xl" />
                  <img
                    src={step.img}
                    alt={step.title}
                    className="relative max-w-[260px] sm:max-w-[320px] lg:max-w-[380px] w-full h-auto object-contain transform group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                </div>

                {/* Card */}
                <div className={`flex flex-col justify-center ${i % 2 === 1 ? "lg:items-end lg:col-start-1" : "lg:items-start"
                  }`}>
                  {i === 0 && (
                    <div className="text-right mb-4">
                      <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2">
                        <span className="text-primary font-light">How Book My Parcel</span>
                        <br />
                        <span className="text-primary">Works?</span>
                      </h2>
                    </div>
                  )}
                  <div className="relative group">
                    <div className="text-white rounded-2xl max-w-md lg:max-w-lg shadow-2xl p-5 sm:p-6 transform group-hover:scale-105 transition-all duration-300 flex items-start gap-4 bg-primary" >
                      <div className="p-4 bg-white/20 rounded-xl shrink-0 flex items-center justify-center self-stretch">
                        <step.icon className="text-3xl" />
                      </div>
                      <div>
                        <h3 className="text-base sm:text-lg font-bold leading-tight mb-2">
                          {i + 1}. {step.title}
                        </h3>
                        <p className="text-xs sm:text-sm leading-relaxed opacity-90">
                          {step.desc}
                        </p>
                      </div>
                    </div>
                    {i === 3 && (
                      <button onClick={handleSendParcel} className="mt-3 inline-flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 transform hover:scale-105 transition-all duration-300 shadow-lg">
                        <FiPackage className="text-base" />
                        Send Parcel
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Connector SVG: step 1 → 2 */}
              {i === 0 && (
                <div className="w-full overflow-visible pointer-events-none" style={{ marginTop: '-50px', marginBottom: '-120px' }}>
                  <svg width="100%" height="200" viewBox="0 0 900 200" fill="none">
                    <path d="M 650 0 C 650 100, 500 100, 450 100 C 400 100, 250 100, 250 200" stroke="#2563EB" strokeWidth="2.5" strokeDasharray="8 10" strokeLinecap="round" className="animated-dash" />
                    <polygon points="250,200 243,185 257,185" fill="#2563EB" opacity="0.9" />
                  </svg>
                </div>
              )}

              {/* Connector SVG: step 2 → 3 */}
              {i === 1 && (
                <div className="w-full overflow-visible pointer-events-none" style={{ marginTop: '-120px', marginBottom: '-75px' }}>
                  <svg width="100%" height="200" viewBox="0 0 900 200" fill="none">
                    <path d="M 250 0 C 250 100, 400 100, 450 100 C 500 100, 650 100, 650 200" stroke="#2563EB" strokeWidth="2.5" strokeDasharray="8 10" strokeLinecap="round" className="animated-dash" />
                    <polygon points="650,200 643,185 657,185" fill="#2563EB" opacity="0.9" />
                  </svg>
                </div>
              )}

              {/* Connector SVG: step 3 → 4 */}
              {i === 2 && (
                <div className="w-full overflow-visible pointer-events-none" style={{ marginTop: '-100px', marginBottom: '-50px' }}>
                  <svg width="100%" height="200" viewBox="0 0 900 200" fill="none">
                    <path d="M 650 0 C 650 100, 500 100, 450 100 C 400 100, 250 100, 250 200" stroke="#2563EB" strokeWidth="2.5" strokeDasharray="8 10" strokeLinecap="round" className="animated-dash" />
                    <polygon points="250,200 243,185 257,185" fill="#2563EB" opacity="0.9" />
                  </svg>
                </div>
              )}

            </div>
          ))}
        </div>

        <div className="mt-4 sm:mt-6 lg:mt-10 text-center flex justify-center">
          <div className="relative group max-w-2xl w-full rounded-2xl overflow-hidden" />
        </div>

      </div>
    </section>
  );
}