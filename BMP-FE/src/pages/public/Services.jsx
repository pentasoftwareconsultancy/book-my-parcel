import React from "react";
import { useNavigate } from "react-router-dom";
import RoutePath from "../../core/constants/routes.constant";
import { benefits, services } from "../datafiles/ServiceData";
import Herosevice from "../../components/services/Heroservice";
import ServiceCard from "../../components/services/ServiceCard";

const Services = () => {
  const navigate = useNavigate();

  return (
    <div className="py-10 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}

        <Herosevice services={services} />
        <ServiceCard benefits={benefits} />

      </div>
    </div>
  );
};

export default Services;