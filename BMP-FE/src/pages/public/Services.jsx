import React from "react";
import { useNavigate } from "react-router-dom";
import RoutePath from "../../core/constants/routes.constant";
import { benefits, services } from "../datafiles/ServiceData";

const Services = () => {
  const navigate = useNavigate();

  return (
    <div className="py-10 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-2xl lg:rounded-3xl py-12 sm:py-16 px-4 sm:px-8 text-center mb-12 lg:mb-16 shadow-lg">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            Our Services
          </h1>

          <p className="text-base sm:text-lg md:text-xl max-w-3xl mx-auto text-blue-100">
            Comprehensive parcel delivery solutions tailored to your needs
          </p>
        </div>

        {/* Services Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-16 lg:mb-20">
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

        {/* Benefits Section */}
        <div className="mb-16 lg:mb-20">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-10 lg:mb-12">
            Why Choose Our Services?
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;

              return (
                <div
                  key={index}
                  className="bg-white rounded-2xl p-5 sm:p-6 lg:p-8 text-center shadow-md hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex justify-center text-blue-600 mb-4">
                    <Icon sx={{ fontSize: 40 }} />
                  </div>

                  <h3 className="text-xl font-bold mb-3">
                    {benefit.title}
                  </h3>

                  <p className="text-gray-600 text-sm sm:text-base">
                    {benefit.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-white rounded-2xl lg:rounded-3xl p-6 sm:p-8 lg:p-10 shadow-lg mb-16 lg:mb-20">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-10 lg:mb-12">
            How It Works
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {[
              {
                step: "1",
                title: "Book Your Parcel",
                desc: "Enter pickup and delivery details",
              },
              {
                step: "2",
                title: "Match with Traveler",
                desc: "Get matched with verified travelers",
              },
              {
                step: "3",
                title: "Track Delivery",
                desc: "Real-time tracking of your parcel",
              },
              {
                step: "4",
                title: "Receive Parcel",
                desc: "Secure delivery with confirmation",
              },
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl sm:text-3xl font-bold mx-auto mb-4 shadow-md">
                  {item.step}
                </div>

                <h3 className="text-lg sm:text-xl font-bold mb-2">
                  {item.title}
                </h3>

                <p className="text-gray-600 text-sm sm:text-base">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-2xl lg:rounded-3xl py-10 sm:py-14 px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
            Ready to Send Your Parcel?
          </h2>

          <p className="text-base sm:text-lg text-blue-100 mb-8">
            Join thousands of satisfied customers using our service
          </p>

          <button
            onClick={() => navigate(RoutePath.AUTH_LOGIN)}
            className="w-full sm:w-auto bg-white text-blue-700 font-semibold px-6 sm:px-8 py-3 rounded-xl hover:bg-blue-50 transition duration-300 shadow-md"
          >
            Get Started Now
          </button>
        </div>

      </div>
    </div>
  );
};

export default Services;