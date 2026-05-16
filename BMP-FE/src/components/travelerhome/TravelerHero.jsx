// src/pages/traveler/TravelerHero.jsx
import React from "react";
import { LuDollarSign } from "react-icons/lu";
import { HiArrowTrendingUp } from "react-icons/hi2";
import { FaRegStar } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import RoutePath from "../../core/constants/routes.constant";

const TravelerHero = ({ travelerImg }) => {
  const navigate = useNavigate();

  return (
  <section className="bg-gray50 pt-16 pb-10 font-sans">
    <div className="max-w-6xl mx-auto px-4">

      {/* Top Section: text + image */}
      <div className="grid md:grid-cols-2 gap-10 items-center">

        {/* Left */}
        <div className="space-y-6">
          <h1 className="text-h1 md:text-5xl font-bold leading-tight text-primary">
            Deliver Earn <br />
            <span className="text-black">Grow</span>
          </h1>

          <p className="text-body text-gray600 max-w-md">
            Take control of your earnings by delivering parcels along your daily
            travel route. With Book My Parcel, simply pick parcels that match
            your route. It's flexible, effortless, and designed to fit perfectly
            into your everyday schedule.
          </p>

          {/* Join Delivery Button */}
          <button
            onClick={() => navigate(`${RoutePath.AUTH_REGISTER}?role=traveler`)}
            className="inline-flex items-center bg-primary text-white px-6 py-3 rounded-full text-body font-semibold shadow-card hover:bg-primaryDark transition"
          >
            Join Our Delivery Team
          </button>

          {/* Stats */}
          <div className="flex flex-wrap gap-8 pt-4 text-body">
            <Stat label="Active Partners" value="50K+" />
            <Stat label="Avg. Monthly Earning" value="₹45K" />
            <Stat label="Cities" value="12+" />
          </div>

          {/* Join Now Button */}
          <button
            onClick={() => navigate(`${RoutePath.AUTH_REGISTER}?role=traveler`)}
            className="mt-4 inline-flex items-center bg-primary text-white px-5 py-2.5 rounded-md text-body font-medium hover:bg-primaryDark transition"
          >
            Join now
          </button>
        </div>

        {/* Right: Traveler Image */}
        <div className="flex justify-center md:justify-end">
          <img
            src={travelerImg}
            alt="Traveler"
            className="w-full max-w-xl rounded-2xl"
          />
        </div>
      </div>

      {/* Bottom Benefits Bar */}
      <div className="mt-10 md:mt-12 grid grid-cols-1 md:grid-cols-3 gap-4">
        <BenefitCard
          Icon={LuDollarSign}
          title="Fuel Reimbursement"
          text="Get reimbursed for fuel costs. Average ₹3,000–4,000 monthly fuel allowance included."
        />
        <BenefitCard
          Icon={HiArrowTrendingUp}
          title="Bonus Incentives"
          text="Earn up to ₹5,000 extra per month with performance bonuses and peak hour incentives."
        />
        <BenefitCard
          Icon={FaRegStar}
          title="Top Performer Rewards"
          text="Monthly recognition and additional rewards for our highest-rated delivery partners."
        />
      </div>
    </div>
  </section>
  );
};

const Stat = ({ label, value }) => (
  <div className="space-y-1">
    <p className="text-2xl font-bold text-primary">{value}</p>
    <p className="text-xs text-gray500">{label}</p>
  </div>
);

const BenefitCard = ({ Icon, title, text }) => (
  <div className="rounded-md border border-primary/20 bg-primary/10 px-6 py-5 flex items-center gap-4 shadow-card">
    <div className="w-20 h-11 flex items-center justify-center rounded-md bg-primary text-white shadow-md">
      <Icon className="text-lg" />
    </div>
    <div>
      <h3 className="text-sm font-semibold text-primary">{title}</h3>
      <p className="text-[12px] text-gray600 mt-1">{text}</p>
    </div>
  </div>
);

export default TravelerHero;
