// src/pages/traveler/TravelerBenefits.jsx
import React from "react";

const TravelerBenefits = ({ LuDollarSign, HiArrowTrendingUp, FaRegStar }) => (
  <section className="w-full flex justify-center pb-10 -mt-24 md:-mt-28">
    <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-3 gap-6 px-6 md:px-0">
      <div className="flex items-center gap-4 rounded-2xl border border-[#294CFF] shadow-[0_0_0_1px_rgba(0,0,0,0.04)] bg-blue-50 px-6 py-5">
        <div className="w-20 h-10 flex items-center justify-center rounded-md bg-[#294CFF] text-white border-2 border-white">
          <LuDollarSign />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-[#294CFF]">
            Fuel Reimbursement
          </h3>
          <p className="text-[12px] text-blue-500 mt-1">
            Get reimbursed for fuel costs. Average ₹3,000–4,000 monthly fuel
            allowance included.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4 bg-blue-50 rounded-2xl border border-[#294CFF] shadow-[0_0_0_1px_rgba(0,0,0,0.04)] px-6 py-5">
        <div className="w-20 h-10 flex items-center justify-center rounded-md bg-[#294CFF] text-white border-2 border-white">
          <HiArrowTrendingUp />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-[#294CFF]">
            Bonus Incentives
          </h3>
          <p className="text-[12px] text-blue-500 mt-1">
            Earn up to ₹5,000 extra per month with performance bonuses and peak
            hour incentives.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4 bg-blue-50 rounded-2xl border border-[#294CFF] shadow-[0_0_0_1px_rgba(0,0,0,0.04)] px-6 py-5">
        <div className="w-20 h-10 flex items-center justify-center rounded-md bg-[#294CFF] text-white border-2 border-white">
          <FaRegStar />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-[#294CFF]">
            Top Performer Rewards
          </h3>
          <p className="text-[12px] text-blue-500 mt-1">
            Monthly recognition and additional rewards for our highest-rated
            delivery partners.
          </p>
        </div>
      </div>
    </div>
  </section>
);

export default TravelerBenefits;
