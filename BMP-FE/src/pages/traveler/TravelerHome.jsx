// src/pages/traveler/TravelerHomes.jsx
import React, { useState } from "react";
import travelerImg from "../../assets/travelerhome/img1.png";
import img2 from "../../assets/travelerhome/img2.png";
import { LuDollarSign } from "react-icons/lu";
import { HiArrowTrendingUp } from "react-icons/hi2";
// import { FaRegStar } from "react-icons/fa";
import { GoClock } from "react-icons/go";
import { VscWorkspaceTrusted } from "react-icons/vsc";

import TravelerHero from "../../components/travelerhome/TravelerHero";
import WhyJoin from "../../components/travelerhome/WhyJoin";
import StepsTimeline from "../../components/travelerhome/StepsTimeline";
import TravelerFAQ from "../../components/travelerhome/TravelerFAQ";


const TravelerHomes = () => {



  return (
    <div>
      <TravelerHero travelerImg={travelerImg} />

      <WhyJoin
        img2={img2}
        LuDollarSign={LuDollarSign}
        GoClock={GoClock}
        VscWorkspaceTrusted={VscWorkspaceTrusted}
        HiArrowTrendingUp={HiArrowTrendingUp}
      />
      <StepsTimeline />
      <TravelerFAQ/>
    </div>
  );
};

export default TravelerHomes;
