import { motion } from "framer-motion";
import {
  FaBox,
  FaShieldAlt,
  FaRocket,
  FaHandshake,
  FaLightbulb,
  FaTools,
  FaBuilding,
  FaFileAlt,
  FaGlobe,
  FaMapMarkerAlt,
  FaEnvelope,
  FaPhone,
} from "react-icons/fa";
import { FiPackage } from "react-icons/fi";
import parcel from "../../assets/homeimage/aboutparcel2.jpg";

const journey = [
  {
    icon: <FaLightbulb className="text-yellow-500 text-xl" />,
    text: "Idea Created",
  },
  {
    icon: <FaTools className="text-blue-500 text-xl" />,
    text: "Platform Developed",
  },
  {
    icon: <FaBox className="text-green-500 text-xl" />,
    text: "First Parcel Delivered",
  },
  {
    icon: <FaRocket className="text-red-500 text-xl" />,
    text: "Expanding Across India",
  },
];


const values = [
  {
    title: "Our Mission",
    description:
      "To provide affordable and reliable parcel delivery by connecting senders with verified travelers.",
    icon: <FaRocket />,
  },
  {
    title: "Our Vision",
    description:
      "To become India's most trusted community-based parcel delivery platform.",
    icon: <FaHandshake />,
  },
  {
    title: "Our Values",
    description:
      "Trust, transparency, security, and customer satisfaction guide every delivery.",
    icon: <FaShieldAlt />,
  },
];

export default function About() {
  return (
    <div className="overflow-hidden bg-slate-50">

      {/* HERO SECTION */}
      <section className="relative min-h-screen flex items-center overflow-hidden">

        {/* Main Gradient Background */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, #1F2AFF 0%, #5C9DF2 139.02%)",
          }}
        />

        {/* Pattern Image */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: "url('/whychooseus-bg.png')",
            backgroundSize: "1150px",
            backgroundRepeat: "repeat",
            opacity: 1,
            mixBlendMode: "invert",
            pointerEvents: "none",
            zIndex: 1,
          }}
        />

        {/* Decorative Blur Effects */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-white/10 rounded-full blur-3xl z-[2]" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-white/10 rounded-full blur-3xl z-[2]" />

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 w-full">

          <div className="grid lg:grid-cols-2 gap-12 items-center">

            {/* LEFT CONTENT */}
            <motion.div
              initial={{ opacity: 0, x: -80 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-5 py-2 rounded-full text-white font-semibold mb-6">
                <FiPackage className="text-lg" /> About Book My Parcel
              </div>

              <h1 className="text-5xl md:text-7xl font-black text-white leading-tight">
                Smart Parcel
                <br />
                Delivery
              </h1>

              <p className="text-white/90 mt-6 text-lg leading-relaxed max-w-xl">
                Book My Parcel connects parcel senders with travelers already
                heading toward the destination.
              </p>
              <div className="flex gap-4 mt-8">


                {/* <button
  onClick={() => navigate("/contact")}
  className="border border-white text-white px-8 py-4 rounded-xl font-bold hover:bg-white hover:text-blue-700 transition"
>
  Contact Us
</button> */}
              </div>
            </motion.div>


            {/* RIGHT IMAGE */}
            <motion.div
              animate={{ y: [0, -20, 0] }}
              transition={{
                duration: 4,
                repeat: Infinity,
              }}
              className="flex justify-center"
            >
              <img
                src="https://i.pinimg.com/736x/1d/24/6e/1d246e5c33c499e76cdc39bae6c3995f.jpg"
                alt="Parcel"
                className="w-80 md:w-[450px] rounded-3xl shadow-2xl"
              />
            </motion.div>

          </div>

        </div>

      </section>

      {/* OUR STORY */}
      <section className="py-24 bg-gradient-to-b from-white to-blue-50">
        <div className="max-w-7xl mx-auto px-6">

          <div className="grid lg:grid-cols-2 gap-16 items-center">

            {/* Image Side */}
            <motion.div
              initial={{ opacity: 0, x: -80 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <img
                src={parcel}
                alt="Our Story"
                className="w-[600px] h-[500px] rounded-3xl shadow-2xl object-cover"
              />

              {/* Floating Card */}
              <div className="absolute -bottom-6 -right-6 bg-white p-5 rounded-2xl shadow-xl">
                <h3 className="text-3xl font-bold text-blue-600">10K+</h3>
                <p className="text-gray-500">Parcels Delivered</p>
              </div>
            </motion.div>

            {/* Content Side */}
            <motion.div
              initial={{ opacity: 0, x: 80 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <span className="bg-blue-100 text-blue-600 px-4 py-2 rounded-full text-sm font-semibold">
                OUR JOURNEY
              </span>

              <h2 className="text-5xl lg:text-6xl font-black text-slate-800 mt-6 mb-6 leading-tight">
                Delivering Smarter,
                <span className="text-blue-600 block">
                  Not Harder
                </span>
              </h2>

              <p className="text-lg text-gray-600 leading-8 mb-8">
                Book My Parcel was born from a simple observation:
                thousands of people travel daily while countless parcels
                need transportation. We bridge this gap by connecting
                travelers with senders, creating a faster, affordable,
                and eco-friendly delivery network.
              </p>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <h3 className="text-3xl font-bold text-slate-800">10K+</h3>
                  <p className="text-gray-500">Deliveries</p>
                </div>

                <div>
                  <h3 className="text-3xl font-bold text-slate-800">5K+</h3>
                  <p className="text-gray-500">Travelers</p>
                </div>

                <div>
                  <h3 className="text-3xl font-bold text-slate-800">100+</h3>
                  <p className="text-gray-500">Cities</p>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* STATS */}


      {/* MISSION VISION VALUES */}
      <section className="relative py-24 overflow-hidden">

        {/* Background Gradient */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, #545a5cff 0%, #5C9DF2 139.02%)",
          }}
        />

        <div className="relative z-10 max-w-7xl mx-auto px-6">

          {/* Heading */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl md:text-6xl font-black text-white">
              What Drives Us
            </h2>

            <p className="text-blue-100 mt-4 text-lg">
              Building a smarter and sustainable delivery ecosystem.
            </p>
          </motion.div>

          {/* Cards */}
          <div className="grid md:grid-cols-3 gap-8">

            {values.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 80 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.7,
                  delay: index * 0.2,
                }}
                animate={{
                  y: [0, -8, 0],
                }}
                whileHover={{
                  scale: 1.05,
                  y: -20,
                }}
                className="
            relative
            overflow-hidden
            bg-white/10
            backdrop-blur-xl
            border border-white/20
            rounded-3xl
            p-8
            shadow-[0_20px_50px_rgba(0,0,0,0.25)]
            group
          "
              >

                {/* Glow Effects */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-700">

                  <div className="absolute -top-10 -left-10 w-40 h-40 bg-cyan-400 rounded-full blur-3xl opacity-30" />

                  <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-blue-300 rounded-full blur-3xl opacity-30" />

                </div>

                {/* Animated Icon */}
                <motion.div
                  animate={{
                    rotate: [0, 10, -10, 0],
                    y: [0, -10, 0],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="
              relative z-10
              w-20 h-20
              flex items-center justify-center
              rounded-2xl
              bg-white
              text-blue-600
              text-4xl
              shadow-xl
              mb-6
            "
                >
                  {item.icon}
                </motion.div>

                {/* Title */}
                <h3 className="relative z-10 text-2xl font-bold text-white mb-4">
                  {item.title}
                </h3>

                {/* Description */}
                <p className="relative z-10 text-blue-100 leading-7">
                  {item.description}
                </p>

                {/* Animated Bottom Border */}
                <motion.div
                  className="absolute bottom-0 left-0 h-1 bg-white"
                  initial={{ width: 0 }}
                  whileHover={{ width: "100%" }}
                  transition={{ duration: 0.4 }}
                />

              </motion.div>
            ))}

          </div>

        </div>

      </section>

      {/* JOURNEY */}
      <section className="relative py-24 overflow-hidden">

        {/* Same signature gradient */}
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(180deg, #1F2AFF 0%, #5C9DF2 139.02%)" }}
        />

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
        <div className="absolute top-0 right-0 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-56 h-56 bg-white/10 rounded-full blur-3xl" />

        <div className="relative z-10 max-w-7xl mx-auto px-6">

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-5 py-2 rounded-full text-white font-semibold text-sm mb-5">
              <FaRocket className="text-sm" /> Our Journey
            </div>

            <h2 className="text-5xl md:text-6xl font-black text-white">
              How We Grew
            </h2>

            <p className="text-blue-100 mt-4 max-w-2xl mx-auto text-lg">
              From a simple idea to a growing parcel delivery platform connecting
              travelers and senders across India.
            </p>
          </motion.div>

          <div className="relative">

            {/* Timeline Line */}
            <div className="hidden md:block absolute top-16 left-0 w-full h-0.5 bg-white/30 rounded-full" />

            <div className="grid md:grid-cols-4 gap-8 relative">
              {journey.map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 80 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -12, scale: 1.03 }}
                  className="relative"
                >

                  {/* Animated Circle on timeline */}
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity, delay: index * 0.4 }}
                    className="hidden md:flex absolute -top-2 left-1/2 -translate-x-1/2 z-10"
                  >
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg">
                      {step.icon}
                    </div>
                  </motion.div>

                  {/* Card — glassmorphism matching mission cards */}
                  <div className="relative overflow-hidden bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-7 shadow-[0_20px_50px_rgba(0,0,0,0.2)] group hover:bg-white/15 transition-all duration-500 mt-10 md:mt-12">

                    {/* Glow on hover */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-700 pointer-events-none">
                      <div className="absolute -top-8 -left-8 w-32 h-32 bg-cyan-400 rounded-full blur-3xl opacity-20" />
                      <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-blue-300 rounded-full blur-3xl opacity-20" />
                    </div>

                    {/* Step number */}
                    <div className="relative z-10 w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center text-white text-xs font-black mb-4 mx-auto">
                      {index + 1}
                    </div>

                    <div className="relative z-10 text-center mb-3">
                      {step.icon}
                    </div>

                    <h3 className="relative z-10 text-lg font-bold text-center text-white mb-2">
                      {step.text}
                    </h3>

                    <p className="relative z-10 text-center text-blue-100 text-sm leading-relaxed">
                      Milestone achieved in our growth journey.
                    </p>

                    {/* Animated bottom border */}
                    <motion.div
                      className="absolute bottom-0 left-0 h-0.5 bg-white/60 rounded-b-3xl"
                      initial={{ width: 0 }}
                      whileInView={{ width: "100%" }}
                      transition={{ duration: 0.8, delay: index * 0.15 }}
                      viewport={{ once: true }}
                    />
                  </div>

                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* LEGAL INFORMATION */}
      <section className="py-24 bg-gradient-to-b from-white to-blue-50">
        <div className="max-w-7xl mx-auto px-6">

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="bg-blue-100 text-blue-600 px-5 py-2 rounded-full text-sm font-semibold">
              Legal Information
            </span>
            <h2 className="text-4xl md:text-5xl font-black text-slate-800 mt-5">
              Company Details
            </h2>
            <p className="text-gray-500 mt-3 text-base max-w-xl mx-auto">
              Legally registered and operating under the laws of India.
            </p>
          </motion.div>

          {/* Card — matches Our Story's light-section floating card aesthetic */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto"
          >
            {/* Blue gradient header strip — like the floating stat card in Our Story */}
            <div
              className="rounded-t-3xl px-8 py-7 text-white relative overflow-hidden"
              style={{ background: "linear-gradient(135deg, #1F2AFF 0%, #5C9DF2 100%)" }}
            >
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  backgroundImage: "url('/whychooseus-bg.png')",
                  backgroundSize: "900px",
                  backgroundRepeat: "repeat",
                  opacity: 1,
                  mixBlendMode: "invert",
                }}
              />
              <div className="relative z-10 flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg shrink-0 text-blue-600">
                  <FaBuilding className="text-xl" />
                </div>
                <div>
                  <p className="text-white/60 text-xs uppercase tracking-[0.2em] font-bold mb-1">
                    Registered Legal Name
                  </p>
                  <h3 className="text-2xl sm:text-3xl font-black tracking-wide leading-tight">
                    BOOK MY PERCEL LLP
                  </h3>
                </div>
              </div>
            </div>

            {/* Body — clean white matching Our Story section style */}
            <div className="bg-white rounded-b-3xl border border-t-0 border-blue-100 shadow-xl px-8 py-8">
              <div className="grid sm:grid-cols-2 gap-6">

                <div className="flex items-start gap-3">
                  <div className="shrink-0 w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center mt-0.5 text-blue-500">
                    <FaFileAlt className="text-sm" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-widest text-blue-500 font-bold mb-1">Entity Type</p>
                    <p className="text-slate-700 text-sm font-semibold leading-relaxed">
                      Limited Liability Partnership
                    </p>
                    <p className="text-gray-400 text-xs mt-0.5">Registered under the laws of India</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="shrink-0 w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center mt-0.5 text-blue-500">
                    <FaGlobe className="text-sm" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-widest text-blue-500 font-bold mb-1">Platform</p>
                    <p className="text-slate-700 text-sm font-semibold">bookmyparcel.co.in</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 sm:col-span-2">
                  <div className="shrink-0 w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center mt-0.5 text-blue-500">
                    <FaMapMarkerAlt className="text-sm" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-widest text-blue-500 font-bold mb-1">Registered Office</p>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      Flat No. 303, Sai Enclave-B, Tushar Park, Survey No. 17/1A,
                      Dhanori, Near Dhanori Police Station, Pune City,
                      Pune – 411015, Maharashtra, India
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 pt-4 border-t border-slate-100">
                  <div className="shrink-0 w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center mt-0.5 text-blue-500">
                    <FaEnvelope className="text-sm" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-widest text-blue-500 font-bold mb-1">Email</p>
                    <p className="text-slate-700 text-sm font-semibold">support@bookmyparcel.com</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 pt-4 border-t border-slate-100">
                  <div className="shrink-0 w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center mt-0.5 text-blue-500">
                    <FaPhone className="text-sm" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-widest text-blue-500 font-bold mb-1">Phone</p>
                    <p className="text-slate-700 text-sm font-semibold">+91 9545444591</p>
                  </div>
                </div>

              </div>
            </div>
          </motion.div>

        </div>
      </section>

    </div>
  );
}