import React from "react";
import RoutePath from "../../core/constants/routes.constant";

const guidelines = [
  {
    title: "1. Eligibility",
    points: [
      "Travelers must be 18 years or older.",
      "You must provide accurate personal and contact information.",
      "Only accept parcel requests that align with your travel route and schedule.",
    ],
  },
  {
    title: "2. Parcel Acceptance",
    points: [
      "Review parcel details carefully before accepting.",
      "Accept parcels only if you are comfortable carrying them.",
      "Do not accept prohibited or illegal items, including hazardous materials, weapons, drugs, or restricted goods.",
    ],
  },
  {
    title: "3. Parcel Handling",
    points: [
      "Handle parcels with care and responsibility.",
      "Do not open, tamper with, or alter the parcel under any circumstances.",
      "Ensure the parcel remains safe and intact during transit.",
    ],
  },
  {
    title: "4. Pickup & Delivery",
    points: [
      "Verify pickup and drop details before collecting the parcel.",
      "Coordinate clearly with the sender and receiver regarding timing and location.",
      "Deliver the parcel only to the intended recipient or authorized third person, as specified by the sender.",
    ],
  },
  {
    title: "5. Third-Party Handover",
    points: [
      "If your journey involves public transport or a third-party handover:",
      "Share only necessary delivery-related information.",
      "Ensure the parcel is handed over responsibly and securely.",
      "Any third-party involvement should be limited strictly to delivery purposes.",
    ],
  },
  {
    title: "6. Communication",
    points: [
      "Maintain clear, respectful, and timely communication with users.",
      "Use the platform’s communication features wherever possible.",
      "Inform the sender immediately of any delays or issues.",
    ],
  },
  {
    title: "7. Safety & Compliance",
    points: [
      "Follow all local laws and transport regulations.",
      "You are solely responsible for compliance during transit.",
      "Book My Parcel is not liable for violations caused by traveler actions.",
    ],
  },
  {
    title: "8. Independence & Responsibility",
    points: [
      "Travelers are independent individuals, not employees or agents of Book My Parcel.",
      "You are responsible for your actions, conduct, and delivery commitments.",
    ],
  },
  {
    title: "9. Cancellation & Issues",
    points: [
      "Avoid cancellations after accepting a parcel unless unavoidable.",
      "In case of emergencies, delays, or parcel damage, notify the user and platform support immediately.",
    ],
  },
  {
    title: "10. Trust & Conduct",
    points: [
      "Act honestly and professionally at all times.",
      "Any misuse of the platform, misconduct, or violation of guidelines may result in account suspension or removal.",
    ],
  },
];

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
