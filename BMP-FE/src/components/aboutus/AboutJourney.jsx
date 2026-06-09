import React from 'react'
import { motion } from "framer-motion";
import {
  FaBox,
  FaRocket,
  FaLightbulb,
  FaTools,
} from "react-icons/fa";

const journey = [
  {
    icon: <FaLightbulb className="text-yellow-500 text-xl" />,
    text: "Identified the need for a faster, affordable, and community-driven parcel delivery solution.",
  },
  {
    icon: <FaTools className="text-blue-800 text-xl" />,
    text: "Developed a secure platform connecting parcel senders with verified travelers.",
  },
  {
    icon: <FaBox className="text-green-500 text-xl" />,
    text: "Enabled reliable parcel deliveries by utilizing existing travel routes between cities.",
  },
  {
    icon: <FaRocket className="text-red-500 text-xl" />,
    text: "Expanding across India to build the nation's most trusted traveler-powered delivery network.",
  },
];

function AboutJourney() {
  return (
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
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-5 py-2 rounded-full text-white font-semibold text-sm mb-4">
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
                  transition={{ duration: 0.8, delay: index * 0.4 }}
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

                    <h3 className="relative z-10 text-lg  text-center text-white mb-2">
                      {step.text}
                    </h3>
                    {/* Animated bottom border */}
                    <motion.div
                      className="absolute bottom-0 left-0 h-0.5 bg-white/60 rounded-b-3xl"
                      initial={{ width: 0 }}
                      whileInView={{ width: "100%" }}
                      transition={{ duration: 0.8, delay: index * 0.19 }}
                      viewport={{ once: true }}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>
  )
}
export default AboutJourney
