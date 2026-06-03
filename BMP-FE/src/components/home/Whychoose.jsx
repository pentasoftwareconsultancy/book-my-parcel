import React from "react";
import { FiZap, FiShield, FiMapPin, FiLock } from "react-icons/fi";
import { FaStar } from "react-icons/fa";

const Whychooseus = () => {
  const features = [
    { title: "Flexible Deliveries", icon: <FiZap />, desc: "Lightning-fast delivery with flexible timing options", bg: "#FACC15", delay: "0s" },
    { title: "Trusted & Verified ", icon: <FiShield />, desc: "Trusted partners ensuring secure and reliable  delivery.", bg: "#34D399", delay: "0.5s" },
    { title: "Real Time Tracking", icon: <FiMapPin />, desc: "Track your parcel in real-time with live updates", bg: "#3B82F6", delay: "1s" },
    { title: "OTP Based Handover", icon: <FiLock />, desc: "Secure delivery with OTP verification system", bg: "#8B5CF6", delay: "1.5s" },
  ];

  return (
    <section className="pt-2 md:pt-4 lg:pt-0 pb-0 bg-gradient-to-b from-[#FFFDF6] to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className="relative rounded-3xl text-white overflow-hidden shadow-2xl"
          style={{ background: "linear-gradient(180deg, #1F2AFF 0%, #5C9DF2 139.02%)" }}
        >
          {/* ── Background pattern image (your downloaded black PNG) ── */}
          <div
            style={{
              position: "absolute", inset: 0,
              backgroundImage: `url('/whychooseus-bg.png')`,
              backgroundSize: "1150px",
              backgroundRepeat: "repeat",
              opacity: 1,
              mixBlendMode: "invert(1)",
              pointerEvents: "none",
              zIndex: 5,
            }}
          />

          {/* Decorative blobs */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24 blur-2xl" />

          <style>{`
            @keyframes float {
              0%,100% { transform: translateY(0px); }
              50%      { transform: translateY(-8px); }
            }
            .animate-float { animation: float 2s ease-in-out infinite; }
          `}</style>

          <div className="relative z-10 px-6 sm:px-8 lg:px-12 py-10 sm:py-12 lg:py-14">
            <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-center lg:items-start">

              {/* Left title */}
              <div className="w-full lg:w-2/5 text-center lg:text-left flex-shrink-0">
                <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-semibold mb-5">
                  <FaStar className="text-yellow-300 text-sm" />
                  Why Choose Us
                </div>
                <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight mb-4">
                  Why <br /> Choose Us?
                </h2>
                <div className="w-16 h-1 bg-white/60 rounded-full mb-4 mx-auto lg:mx-0" />
                <p className="text-sm sm:text-base opacity-90 leading-relaxed font-medium max-w-sm mx-auto lg:mx-0">
                  Book My Parcel makes delivery smarter, safer, and faster by
                  connecting you with verified travelers already moving along your route.
                </p>
              </div>

              {/* Features grid */}
              <div className="w-full lg:w-3/5 grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                {features.map((item, i) => (
                  <div key={i} className="text-center">
                    <div
                      className="mx-auto mb-3 h-14 w-14 sm:h-16 sm:w-16 rounded-xl flex items-center justify-center shadow-xl animate-float"
                      style={{ backgroundColor: item.bg, animationDelay: item.delay }}
                    >
                      <div className="text-white text-xl sm:text-2xl">{item.icon}</div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 sm:p-4">
                      <h4 className="font-bold text-xs sm:text-sm mb-2 leading-tight">{item.title}</h4>
                      <p className="text-xs opacity-90 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Whychooseus;