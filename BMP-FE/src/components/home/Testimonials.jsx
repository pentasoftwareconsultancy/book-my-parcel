import React, { useRef } from "react";
import {
  FaStar,
  FaCheck,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import testimonials from "/src/pages/datafiles/AboutTestimonials.js";

export default function Testimonials() {
  const scrollRef = useRef(null);

  const scrollLeft = () => {
    scrollRef.current?.scrollBy({
      left: -350,
      behavior: "smooth",
    });
  };

  const scrollRight = () => {
    scrollRef.current?.scrollBy({
      left: 350,
      behavior: "smooth",
    });
  };

  return (
    <section className="pt-10 sm:pt-10 lg:pt-10 pb-0 bg-gradient-to-b from-white via-blue-50/30 to-[#FFFDF6]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="text-center mb-12 sm:mb-16 lg:mb-20">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light leading-tight mb-2">
            <span className="text-blue-600 font-black">
              What Our Clients Say
            </span>
          </h2>

          <div className="w-20 h-1 bg-gradient-to-r from-blue-500 to-blue-700 mx-auto rounded-full mb-6"></div>

          <p className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto font-medium"></p>
        </div>

        {/* Navigation Arrows */}
        <div className="flex justify-end gap-3 mb-6">
          <button
            onClick={scrollLeft}
            className="w-10 h-10 rounded-full bg-white shadow-md border border-gray-200 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all duration-300"
            aria-label="Scroll Left"
          >
            <FaChevronLeft />
          </button>

          <button
            onClick={scrollRight}
            className="w-10 h-10 rounded-full bg-white shadow-md border border-gray-200 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all duration-300"
            aria-label="Scroll Right"
          >
            <FaChevronRight />
          </button>
        </div>

        {/* Testimonials */}
        <div
          ref={scrollRef}
          className="overflow-x-auto scrollbar-hide pb-4 scroll-smooth"
        >
          <div className="flex gap-6 sm:gap-8 w-max">
            {testimonials.map((testimonial, i) => (
              <div
                key={i}
                className="group bg-white rounded-2xl p-6 sm:p-8 pb-10 md:pb-12 lg:pb-8 shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 relative overflow-hidden min-w-[320px] max-w-[320px] sm:min-w-[350px]"
              >
                {/* Decorative Background */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-transparent rounded-full -translate-y-16 translate-x-16"></div>

                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, index) => (
                    <FaStar
                      key={index}
                      className="text-yellow-400 text-lg"
                    />
                  ))}
                </div>

                {/* Highlight */}
                <h4 className="font-bold text-lg text-gray-900 mb-4">
                  {testimonial.highlight}
                </h4>

                {/* Review */}
                <p className="text-gray-600 text-sm sm:text-base leading-relaxed mb-6">
                  {testimonial.text}
                </p>

                {/* User Info */}
                <div className="flex items-center gap-4">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="h-12 w-12 rounded-full object-cover ring-4 ring-blue-100"
                  />

                  <div>
                    <p className="font-bold text-gray-900 text-sm">
                      {testimonial.name}
                    </p>

                    <p className="text-xs text-blue-600 font-medium">
                      {testimonial.role}
                    </p>
                  </div>
                </div>

                {/* Verified Badge */}
                <div className="absolute bottom-3 right-3 md:bottom-2 md:right-3 lg:bottom-4 lg:right-6 bg-primary text-white px-2 py-0.5 md:px-2 md:py-0.5 lg:px-3 lg:py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                  <FaCheck size={10} />
                  Verified
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}