import React from "react";
import RoutePath from "../../core/constants/routes.constant";
import { guidelines} from "../datafiles/TermsData";

const TravelerGuidelines = () => {
  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Title */}
        <h1 className="text-3xl font-bold text-blue-700 mb-2">
          Traveler Guidelines
        </h1>
        <p className="text-gray-600 mb-8">
          Travelers play an important role in helping deliver parcels safely and
          responsibly. By accepting a parcel request on Book My Parcel, you
          agree to follow these guidelines.
        </p>

        {/* Guideline Cards */}
        <div className="space-y-6">
          {guidelines.map((item, index) => (
            <div
              key={index}
              className="bg-white border border-blue-300 rounded-lg shadow-sm p-5"
            >
              <h2 className="font-semibold text-gray-800 mb-3">
                {item.title}
              </h2>
              <ul className="list-disc pl-6 space-y-2 text-gray-600 text-sm">
                {item.points.map((point, i) => (
                  <li key={i}>{point}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TravelerGuidelines;
