import { motion } from "framer-motion";
import {useNavigate} from "react-router-dom";
import {
  FaBox,
  FaUsers,
  FaMapMarkerAlt,
  FaShieldAlt,
  FaRocket,
  FaHandshake,
  FaLightbulb,
  FaTools
} from "react-icons/fa";
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


const stats = [
  { icon: <FaBox />, number: "10K+", label: "Deliveries" },
  { icon: <FaUsers />, number: "5K+", label: "Happy Users" },
  { icon: <FaMapMarkerAlt />, number: "100+", label: "Cities Covered" },
  { icon: <FaShieldAlt />, number: "99%", label: "Safe Deliveries" },
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
        <div className="inline-flex items-center bg-white/20 backdrop-blur-md px-5 py-2 rounded-full text-white font-semibold mb-6">
          📦 About Book My Parcel
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
        "linear-gradient(180deg, #1F2AFF 0%, #5C9DF2 139.02%)",
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
<section className="py-24 bg-slate-100 overflow-hidden">
  <div className="max-w-7xl mx-auto px-6">

    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="text-center mb-20"
    >
      <span className="bg-blue-100 text-blue-700 px-5 py-2 rounded-full font-semibold">
        Our Journey
      </span>

      <h2 className="text-5xl md:text-6xl font-black mt-6 text-slate-900">
        How We Grew
      </h2>

      <p className="text-gray-500 mt-4 max-w-2xl mx-auto">
        From a simple idea to a growing parcel delivery platform connecting
        travelers and senders across India.
      </p>
    </motion.div>

    <div className="relative">

      {/* Timeline Line */}
      <div className="hidden md:block absolute top-16 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-full" />

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

            {/* Animated Circle */}
            <motion.div
              animate={{ scale: [1, 1.15, 1] }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: index * 0.4,
              }}
              className="hidden md:flex absolute -top-2 left-1/2 -translate-x-1/2 z-10"
            >
              <div className="w-10 h-10 bg-white border-4 border-blue-600 rounded-full flex items-center justify-center">
                {step.icon}
              </div>
            </motion.div>

            {/* Card */}
            <div className="bg-white rounded-3xl p-8 shadow-lg border border-slate-100 hover:shadow-2xl transition-all duration-500">

              <div className="text-center mb-4">
                {step.icon}
              </div>

              <h3 className="text-xl font-bold text-center text-slate-800 mb-3">
                {step.text}
              </h3>

              <p className="text-center text-gray-500 text-sm leading-relaxed">
                Milestone achieved successfully in our growth journey.
              </p>

            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </div>
</section>

    </div>
  );
}