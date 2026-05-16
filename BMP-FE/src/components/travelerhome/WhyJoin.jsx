// src/pages/traveler/WhyJoin.jsx
import React from "react";

const WhyJoin = ({ img2, LuDollarSign, GoClock, VscWorkspaceTrusted, HiArrowTrendingUp }) => (
    <section className="w-full bg-[#FBFBFF] py-16">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-10 items-center px-4 md:px-0">
            <div className="flex justify-center md:justify-start">
                <img
                    src={img2}
                    alt="Traveler"
                    className="w-full md:w-[120%] lg:w-[140%] rounded-xl"
                />
            </div>

            <div className="w-full md:rounded-lg px-4 md:px-8 py-8 md:py-10 bg-white">
                <div className="space-y-4 mb-6">
                    <h2 className="text-h2 md:text-h2 font-bold leading-tight text-primary">
                        Why Join <br />
                        <span className="text-gray900">Book My Parcel?</span>
                    </h2>
                    <p className="text-gray-600 text-base md:text-lg max-w-xl">
                        Experience the benefits of being part of India's fastest‑growing
                        delivery network.
                    </p>

                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                    <WhyJoinCard
                        Icon={LuDollarSign}
                        title="₹450"
                        subtitle="Avg. per day"
                        label="Flexible Earnings"
                        text="Earn ₹15,000 – ₹45,000 per month."
                    />
                    <WhyJoinCard
                        Icon={GoClock}
                        title="24/7"
                        subtitle="Flexibility"
                        label="Work On Your Time"
                        text="Choose your own hours."
                    />
                    <WhyJoinCard
                        Icon={VscWorkspaceTrusted}
                        title="₹5L"
                        subtitle="Coverage"
                        label="Insurance Coverage"
                        text="Full protection on the job."
                    />
                    <WhyJoinCard
                        Icon={HiArrowTrendingUp}
                        title="7 Days"
                        subtitle="Payment cycle"
                        label="Weekly Payouts"
                        text="Get paid every week."
                    />
                </div>
            </div>
        </div>
    </section>
);

const WhyJoinCard = ({ Icon, title, subtitle, label, text }) => (
    <div className="bg-white border border-primary rounded-2xl px-6 py-6 flex flex-col justify-between">
        <div className="flex flex-col gap-4">
            <div className="w-11 h-11 flex items-center justify-center rounded-2xl bg-gradient-to-b from-[#4C8DFF] to-[#294CFF] text-white">
                <Icon className="text-xl" />
            </div>
            <div>
                <p className="text-2xl font-bold text-[#294CFF]">{title}</p>
                <p className="text-xs text-gray-500">{subtitle}</p>
            </div>
        </div>
        <div className="mt-4">
            <h3 className="text-xs font-semibold text-[#294CFF] uppercase tracking-wide">
                {label}
            </h3>
            <p className="text-[11px] text-gray-500 mt-1">{text}</p>
        </div>
    </div>
);

export default WhyJoin;
