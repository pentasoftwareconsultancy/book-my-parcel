// src/pages/traveler/StepsTimeline.jsx
import React from "react";
import { Link } from "react-router-dom";
import RoutePath from "../../core/constants/routes.constant";

import { MdOutlinePerson,MdOutlineVerifiedUser  } from "react-icons/md";
import { GiConcentricCrescents } from "react-icons/gi";
import { BsLightningCharge } from "react-icons/bs";



const steps = [
  {
    step: "1",
    icon:<MdOutlinePerson />
,
    title: "Sign Up Online",
    text: "Create your account and upload required documents.",
    time: "5 mins",
  },
  {
    step: "2",
    icon: <MdOutlineVerifiedUser />,
    title: "Document Verification (KYC)",
    text: "We verify your driving license and ID documents.",
    time: "24–48 hrs",
  },
  {
    step: "3",
    icon: <GiConcentricCrescents />,
    title: "Training & Onboarding",
    text: "Complete online training and app walkthrough.",
    time: "2 hrs",
  },
  {
    step: "4",
    icon: <BsLightningCharge />,
    title: "Start Delivering",
    text: "Accept orders and start earning immediately.",
    time: "Instant",
  },
];

const StepsTimeline = () => (
  <section className="w-full bg-[#EEB15F] py-16 md:py-20">
    <div className="max-w-6xl mx-auto px-4 md:px-0 text-center">
      <h2 className="text-h2 md:text-h2 font-bold text-white">
        Start in 4 Simple Steps
      </h2>
      <p className="text-body text-white/80 mt-3">
        From registration to your first delivery in less than 3 days.
      </p>

      <div className="mt-10 relative">
        {/* Horizontal line for timeline (desktop) */}
        <div className="hidden md:block absolute left-0 right-0 top-7 h-[2px] bg-white/30"></div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
          {steps.map((s) => (
            <StepCard key={s.step} {...s} />
          ))}
        </div>
      </div>

      <div className="mt-10 flex justify-center">
        <Link
          to={`${RoutePath.AUTH_REGISTER}?role=traveler`}
          className="bg-white text-primary px-8 py-3 rounded-full text-body font-semibold shadow-card hover:bg-gray100 transition"
        >
          Get Started Today
        </Link>
      </div>
    </div>
  </section>
);

const StepCard = ({ step, icon, title, text, time }) => (
  <div className="flex flex-col items-center gap-4">
    {/* Step number circle */}
    <div className="w-12 h-12 flex items-center justify-center rounded-full bg-white shadow-card text-bodyLg font-semibold text-primary z-10">
      {step}
    </div>

    <div className="w-full bg-white rounded-2xl shadow-card px-6 py-5 flex flex-col items-center text-center">
      {/* Icon */}
      <div className="w-10 h-10 flex items-center justify-center  bg-gray100 text-black mb-3 text-lg rounded-md">
        {icon}
      </div>

      {/* Title & description */}
      <h3 className="text-body font-semibold text-gray900">{title}</h3>
      <p className="text-small text-gray500 mt-2">{text}</p>

      {/* Time badge */}
      <p className="mt-3 inline-flex items-center gap-2 text-small text-success bg-successLight px-2 py-1 rounded-full">
        <span className="w-1.5 h-1.5 rounded-full bg-success"></span>
        {time}
      </p>
    </div>
  </div>
);

export default StepsTimeline;
