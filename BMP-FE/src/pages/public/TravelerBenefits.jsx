import React from "react";
 import benefits from "../datafiles/Benefits";
 
const TravelerBenefits = () => {
  return (
    <section className="bg-white min-h-screen py-10 px-4">
      <div className="max-w-6xl mx-auto">
              
        {/* Heading */}
        <h1 className="text-2xl font-semibold text-blue-700 mb-1">
          Traveler Benefits
        </h1>
        <p className="text-gray-600 mb-8">
          Book My Parcel allows travelers to earn while traveling, making every journey more rewarding and meaningful.
        </p>

        {/* Benefit Cards */}
        <div className="space-y-6">
          {benefits.map((item, index) => (
            <div
              key={index}
              className="border border-blue-300 rounded-lg p-6 shadow-sm"
            >
              <h2 className="font-semibold text-gray-800 mb-2">
                {index + 1}. {item.title}
              </h2>
              <ul className="list-disc list-inside space-y-1 text-gray-600 text-sm">
                {item.points.map((point, i) => (
                  <li key={i}>{point}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default TravelerBenefits;
