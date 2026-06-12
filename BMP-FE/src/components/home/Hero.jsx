import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import RoutePath from "../../core/constants/routes.constant";
import { FiTruck, FiPackage } from "react-icons/fi";
import { useSelector } from "react-redux";


// IMAGES
import HeroPerson from "../../assets/homeimage/delivery.png";
import Aircraft from "../../assets/homeimage/Aircraft.png";
import Train from "../../assets/homeimage/Train.png";
import Bus from "../../assets/homeimage/bus.png";
import bike from "../../assets/homeimage/cuate.png";

/* =====================================================
   VEHICLE ITEMS — responsive sizing via clamp()
===================================================== */
const items = [
  { id: 1, src: Aircraft, style: { top: "5%", width: "clamp(120px, 55vw, 530px)" } },
  { id: 2, src: Bus, style: { bottom: "8%", width: "clamp(100px, 50vw, 500px)" } },
  { id: 3, src: bike, style: { bottom: "14%", width: "clamp(80px,  40vw, 400px)" } },
  { id: 4, src: Train, style: { bottom: "12%", width: "clamp(120px, 58vw, 600px)" } },
];

/* =====================================================
   BACKGROUND ANIMATION
   Phase flow: "enter" (0.8s) → pause 1.5s → "exit" (0.8s) → next
===================================================== */
const BackgroundAnimation = () => {
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState("enter"); // "enter" | "exit"

  useEffect(() => {
    // After slide-in (0.8s) + pause (1.5s) → start exit
    const pauseTimer = setTimeout(() => {
      setPhase("exit");

      // After slide-out (0.8s) → next vehicle
      const nextTimer = setTimeout(() => {
        setIndex((prev) => (prev + 1) % items.length);
        setPhase("enter");
      }, 800);

      return () => clearTimeout(nextTimer);
    }, 800 + 1500);

    return () => clearTimeout(pauseTimer);
  }, [index]);

  const item = items[index];

  const sharedStyle = {
    position: "absolute",
    objectFit: "contain",
    left: 0, right: 0,
    margin: "0 auto",
    ...item.style,
  };

  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 10, pointerEvents: "none", overflow: "hidden" }}>
      <AnimatePresence mode="wait">
        {phase === "enter" ? (
          <motion.img
            key={`${item.id}-enter`}
            src={item.src}
            alt="vehicle"
            initial={{ x: "110%" }}
            animate={{ x: "0%", transition: { duration: 2, ease: "easeOut" } }}
            style={sharedStyle}
          />
        ) : (
          <motion.img
            key={`${item.id}-exit`}
            src={item.src}
            alt="vehicle"
            initial={{ x: "0%" }}
            animate={{ x: "-110%", transition: { duration: 0.8, ease: "easeIn" } }}
            style={sharedStyle}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

/* =====================================================
   HERO
===================================================== */
export default function Hero() {
  const navigate = useNavigate();
  // const { isLoggedIn, loading } = useAuth() || {};

const { token, user, loading } = useSelector((state) => state.auth);
const isLoggedIn = !!(token && user);

  const handleSendParcel = () => {
    if (loading) return;
    if (isLoggedIn) navigate(RoutePath.USER_REQUEST_FORM);
    else navigate(RoutePath.AUTH_LOGIN, { state: { from: RoutePath.USER_REQUEST_FORM } });
  };

  const handleTrackDelivery = () => {
    if (loading) return; // wait for auth to load
    if (isLoggedIn) navigate(RoutePath.USER_TRACK_PARCEL);
    else navigate(RoutePath.AUTH_LOGIN, { state: { from: RoutePath.USER_TRACK_PARCEL } });
  };

  const stats = [
    { value: "30K+", label: "Orders Delivered\nsafely at location", wide: true },
    { value: "40K+", label: "Loyal\ncustomers", wide: false },
    { value: "27+", label: "Locations\nCovered", wide: false },
    { value: "20K+", label: "Trained delivery\npartners", wide: true },
  ];

  return (
    <section className="relative bg-gradient-to-br from-[#FFFDF6] via-blue-50/30 to-[#F0F9FF] overflow-hidden">
      {/* Blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-blue-100/30 rounded-full blur-2xl animate-bounce" />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-2 pb-0
                      grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 items-end">

        {/* ── LEFT ── */}
        <div className="order-2 lg:order-1 text-center lg:text-left">
          <h1 className="mb-0 text-[32px] sm:text-[50px] leading-[40px] sm:leading-[60px]"
            style={{ fontFamily: "Montserrat, sans-serif" }}>
            <span style={{ fontWeight: 700, color: "#2563eb" }}>Speed</span>{" "}
            <span style={{ fontWeight: 400, color: "#2563eb" }}>You Can</span>
            <br />
            <span style={{ fontWeight: 400, color: "#2563eb" }}>Count On</span>
          </h1>

          <p className="mt-2 max-w-md mx-auto lg:mx-0 text-gray-600 text-sm lg:text-base leading-relaxed">
            Book My Parcel is a smart delivery platform that connects customers
            with verified delivery partners for fast, affordable, and reliable
            parcel delivery.
          </p>

          <div className="mt-3 flex flex-row gap-3 justify-center lg:justify-start">
            <button onClick={handleSendParcel}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2
                bg-primary text-white px-6 py-3 rounded-lg text-sm font-semibold
                hover:bg-primary transform hover:scale-105 transition-all duration-300
                shadow-lg hover:shadow-xl">
              <FiPackage className="text-base" /> Send Parcel
            </button>
            <button onClick={handleTrackDelivery}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2
                bg-white text-blue-600 border border-blue-600
                px-6 py-3 rounded-lg text-sm font-semibold
                hover:bg-blue-50 transform hover:scale-105 transition-all duration-200
                shadow-lg hover:shadow-xl">
              <FiTruck className="text-base text-blue-600" /> Track Delivery
            </button>
            {isLoggedIn && (
  <button
    onClick={() => navigate(RoutePath.USER_TRAVELLER_SEARCH)}
    className="w-full sm:w-auto inline-flex items-center justify-center gap-2
      bg-green-600 text-white px-6 py-3 rounded-lg text-sm font-semibold
      hover:bg-green-700 transform hover:scale-105 transition-all duration-200
      shadow-lg hover:shadow-xl"
  >
    <FiTruck className="text-base" />
    Travellers
  </button>
)}
          </div>

          <div className="mt-3 grid grid-cols-2 lg:grid-cols-3 gap-2 w-full md:max-w-full mx-auto lg:mx-0 lg:max-w-md">
            {/* 30K+ Large */}
            <div className="col-span-1 md:col-span-1 lg:col-span-2 text-white p-5 sm:p-6 rounded-2xl shadow-md bg-primary" >
              <p className="text-2xl sm:text-3xl font-bold mb-2">30K+</p>
              <p className="text-sm leading-snug opacity-95">
                Orders Delivered <br /> safely at location
              </p>
            </div>

            {/* 40K+ Small */}
            <div className="col-span-1 md:col-span-1 lg:col-span-1 text-white p-5 sm:p-6 rounded-2xl shadow-md bg-primary">
              <p className="text-2xl sm:text-3xl font-bold mb-2">40K+</p>
              <p className="text-sm leading-snug opacity-95">
                Loyal <br /> customers
              </p>
            </div>

            {/* 27+ Small */}
            <div className="col-span-1 md:col-span-1 lg:col-span-1 text-white p-5 sm:p-6 rounded-2xl shadow-md bg-primary">
              <p className="text-2xl sm:text-3xl font-bold mb-2">27+</p>
              <p className="text-sm leading-snug opacity-95">
                Locations <br /> Covered
              </p>
            </div>

            {/* 20K+ Large */}
            <div className="col-span-1 md:col-span-1 lg:col-span-2 text-white p-5 sm:p-6 rounded-2xl shadow-md bg-primary">
              <p className="text-2xl sm:text-3xl font-bold mb-2">20K+</p>
              <p className="text-sm leading-snug opacity-95">
                Trained delivery <br /> partners
              </p>
            </div>
          </div>
        </div>

        {/* ── RIGHT IMAGE ── */}
        <div className="order-1 lg:order-2 relative flex justify-center items-end">
          <div className="relative w-full max-w-[220px] sm:max-w-[460px] md:max-w-[560px] lg:max-w-[680px]">
            <BackgroundAnimation />
            <img
              src={HeroPerson}
              alt="Delivery"
              className="relative z-20 w-full h-auto object-contain
                         transform hover:scale-105 transition-transform duration-500"
            />
          </div>
        </div>
      </div>
    </section>
  );
}