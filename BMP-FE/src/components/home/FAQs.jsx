import { useEffect, useState } from "react";
import faqs from "/src/pages/datafiles/Faqs.js";

export default function FAQs() {
  const [openIndex, setOpenIndex] = useState(0); // first open by default

  return (
      <section className="pt-4 pb-6 md:pt-8 md:pb-10 lg:pt-12 lg:pb-16 bg-[#FFFDF6]">      
        <div className="max-w-7xl mx-auto px-4 grid lg:grid-cols-2 gap-4 md:gap-8 lg:gap-16 items-start text-center lg:text-left lg:px-16"><div>
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-blue-600 leading-tight">
          Frequently asked
          <br />
          <span className="text-blue-600 font-bold">Questions</span>
        </h2>
          <p className="mt-3 lg:mt-6 text-xs sm:text-sm text-gray-600 max-w-md mx-auto lg:mx-0">
            <span className="font-bold text-gray-900">Have questions about what and how Book My Parcel works?</span>
            <br />
            We've put together a list of the most common queries to help you understand
            our process, safety measures, and features. Whether you're sending a parcel or
            becoming a delivery partner, these FAQs will guide you through everything
            you need to know for a smooth and secure experience.
          </p>
        </div>
        <div className="space-y-4">
          {faqs.map((item, i) => {
            const isOpen = openIndex === i;
            return (
              <div
                key={i}
                className={`rounded-xl shadow-md transition-all duration-300 ${
                  isOpen
                    ? "bg-primary text-white"
                    : "bg-white text-gray-900"
                }`}
              >
                {/* QUESTION */}
                <button
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="w-full px-6 py-5 flex justify-between items-center text-left"
                >
                  <span className="font-medium text-sm">
                    {`${i + 1}. ${item.q}`}
                  </span>
                  <span
                    className={`h-6 w-6 flex items-center justify-center rounded-full transition-transform duration-300 ${
                      isOpen
                        ? "bg-white text-blue-600 rotate-180"
                        : "bg-primary text-white"
                    }`}
                  >
                    ˄
                  </span>
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    isOpen
                      ? "max-h-40 px-6 pb-5 opacity-100"
                      : "max-h-0 opacity-0"
                  }`}
                >
                  <p className="text-sm leading-relaxed opacity-90">
                    {item.a}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
