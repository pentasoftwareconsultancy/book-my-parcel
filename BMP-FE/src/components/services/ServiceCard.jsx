import React from "react";
import { useNavigate } from "react-router-dom";
import RoutePath from "../../core/constants/routes.constant";
function ServiceCard({ benefits }) {
  const navigate = useNavigate();
  return (
    <>
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
<div className="bg-gradient-to-br from-blue-50 via-white to-indigo-50 rounded-3xl p-6 sm:p-8 lg:p-12 shadow-xl mb-16 lg:mb-20">
  <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4">
    How It Works
  </h2>

  <p className="text-center text-gray-600 mb-16">
    Simple steps to send your parcel safely and quickly
  </p>

  <div className="relative flex flex-col lg:flex-row items-center justify-between gap-10 lg:gap-4">
    
    {/* Dotted Line */}
    <div className="hidden lg:block absolute top-8 left-[12%] right-[12%] border-t-4 border-dashed border-blue-300"></div>

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
      <div
        key={index}
        className="relative z-10 flex flex-col items-center text-center max-w-[220px] group"
      >
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-center text-2xl sm:text-3xl font-bold shadow-xl animate-pulse hover:shadow-2xl hover:scale-125 transition-all duration-500">
  {item.step}
</div>

        <h3 className="mt-4 text-lg sm:text-xl font-bold text-gray-900">
          {item.title}
        </h3>

        <p className="mt-2 text-sm sm:text-base text-gray-600">
          {item.desc}
        </p>
      </div>
    ))}
  </div>
  
</div>

      {/* CTA Section */}
      
    </>
  );
}

export default ServiceCard;