import React from 'react'
import { motion } from "framer-motion";
import {
  FaBuilding,
  FaFileAlt,
  FaGlobe,
  FaMapMarkerAlt,
  FaEnvelope,
  FaPhone,
} from "react-icons/fa";

function AboutLegel() {
  return (
    <section className="py-20 bg-gradient-to-b from-white to-blue-50 mt-0">
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
            <h2 className="text-5xl md:text-5xl font-black text-blue-600 mt-5">
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
                      Flat No. 303, Sai Enclave-B, Tushar Park, Survey No.
                     <br/>17/1A,Dhanori, Near Dhanori Police Station, Pune City,<br/>
                      Pune – 411015, Maharashtra, India
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 pt-4 border-t border-slate-400">
                  
                  <div className="shrink-0 w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center mt-0.5 text-blue-500">
                    <FaEnvelope className="text-sm" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-widest text-blue-500 font-bold mb-1">Email</p>
                    <p className="text-slate-700 text-sm font-semibold">support@bookmyparcel.com</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 pt-4 border-t border-slate-400">
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
  )
}

export default AboutLegel
