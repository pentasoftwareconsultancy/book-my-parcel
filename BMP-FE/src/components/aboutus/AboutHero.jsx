import { motion } from "framer-motion";
import { FiPackage } from "react-icons/fi";

const AboutHero = () => {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(180deg, #1F2AFF 0%, #5C9DF2 139.02%)",
        }}
      />

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

      <div className="absolute top-0 right-0 w-72 h-72 bg-white/10 rounded-full blur-3xl z-[2]" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-white/10 rounded-full blur-3xl z-[2]" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center">

          <motion.div
            initial={{ opacity: 0, x: -80 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-5 py-2 rounded-full text-white font-semibold mb-6">
              <FiPackage className="text-lg" />
              About Book My Parcel
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
          </motion.div>

          <motion.div
            animate={{ y: [0, -20, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
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
  );
};

export default AboutHero;