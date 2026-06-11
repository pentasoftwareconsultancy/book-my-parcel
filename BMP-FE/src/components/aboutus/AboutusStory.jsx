import React from 'react'
import { motion } from "framer-motion";
import story from "../../assets/homeimage/aboutstory.jpg";

function AboutusStory() {
  return (
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
                src={story}
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
                SMART DELIVERY, REDEFINED
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
              
            </motion.div>

          </div>
        </div>
      </section>
  )
}

export default AboutusStory
