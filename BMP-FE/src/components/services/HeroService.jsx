import React from "react";
import { services } from "../../pages/datafiles/ServiceData";

function HeroService() {
  return (
    <>
      <div
  className="text-white rounded-2xl lg:rounded-3xl py-12 sm:py-16 px-4 sm:px-8 text-center mb-12 lg:mb-16 shadow-lg relative overflow-hidden"
  style={{
    background: "linear-gradient(135deg, #1F2AFF 0%, #5C9DF2 100%)",
  }}
>
  {/* Pattern Background */}
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

  {/* Content */}
  <div className="relative z-10">
    <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
      Our Services
    </h1>

    <p className="text-base sm:text-lg md:text-xl max-w-3xl mx-auto text-blue-100">
      Comprehensive parcel delivery solutions tailored to your needs
    </p>
  </div>
</div>

      {/* Services Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8  mb-16 lg:mb-20" >
        {services.map((service, index) => {
          const Icon = service.icon;

          return (
            <div
              key={index}
              className="bg-white rounded-2xl p-5 sm:p-6 lg:p-8 shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100"
            >
              <div className="flex justify-center text-blue-600 mb-4">
                <Icon sx={{ fontSize: 50 }} />
              </div>

              <h3 className="text-xl sm:text-2xl font-bold text-center mb-4">
                {service.title}
              </h3>

              <p className="text-sm sm:text-base text-gray-600 text-center mb-6">
                {service.description}
              </p>

              <ul className="space-y-2">
                {service.features.map((feature, idx) => (
                  <li
                    key={idx}
                    className="flex items-center text-gray-700 text-sm sm:text-base"
                  >
                    <span className="text-blue-600 mr-2">✔</span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </>
  );
}

export default HeroService;