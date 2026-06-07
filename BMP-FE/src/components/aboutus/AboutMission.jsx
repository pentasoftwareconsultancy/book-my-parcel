import React from 'react'
import { motion } from "framer-motion";
import { FaRocket, FaHandshake, FaShieldAlt } from "react-icons/fa";

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
function AboutMission() {
  return (
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

  )
}

export default AboutMission
