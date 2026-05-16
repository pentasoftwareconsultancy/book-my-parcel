import React from "react";

const benefits = [
  {
    title: "Earn While You Travel",
    points: [
      "Make extra income by delivering parcels along your existing travel route.",
      "No fixed hours or commitments—earn on your own schedule.",
    ],
  },
  {
    title: "Flexible & Independent",
    points: [
      "Accept or reject parcel requests freely.",
      "Travel at your own pace with no employment obligations.",
      "You remain an independent traveler, not an employee.",
    ],
  },
  {
    title: "Zero Investment",
    points: [
      "No registration fees or upfront costs.",
      "Use your regular mode of transport—bus, train, car, or flight.",
    ],
  },
  {
    title: "Route-Based Matching",
    points: [
      "Get matched with parcels that align with your travel route.",
      "No unnecessary detours or extra effort.",
    ],
  },
  {
    title: "Safe & Transparent Process",
    points: [
      "View parcel details before accepting.",
      "Clear pickup and drop information provided in advance.",
      "In-app tracking and communication for transparency.",
    ],
  },
  {
    title: "Build Trust & Ratings",
    points: [
      "Earn ratings and reviews after successful deliveries.",
      "Higher ratings help you get more parcel requests.",
    ],
  },
  {
  title: " Quick & Secure Payments",
  points: [
    "Receive payments after successful parcel delivery.",
    "Transparent payout process with no hidden deductions.",
  ],
},
{
  title: " Support When You Need It",
  points: [
    "Access platform support for delivery-related issues.",
    "Guidance available in case of delays or concerns.",
  ],
},
{
  title: " Contribute to a Sustainable System",
  points: [
    "Help reduce unnecessary courier trips.",
    "Promote efficient, eco-friendly parcel movement.",
  ],
},
{
  title: " Be Part of a Trusted Community",
  points: [
    "Join a growing network of verified users and travelers.",
    "Help people deliver parcels faster and more affordably.",
  ],
}

];
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
