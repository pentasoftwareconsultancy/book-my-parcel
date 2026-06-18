import React, { useState, useRef, useEffect } from "react";
import {
  FiSearch,
  FiNavigation,
  FiMapPin,
  FiChevronDown,
} from "react-icons/fi";
import AddressAutoComplete from "../../core/common/AddressAutocomplete";
import { FiTruck } from "react-icons/fi";
import {
  FaCar,
  FaCarSide,
  FaMotorcycle,
  FaShuttleVan,
  FaTruck,
} from "react-icons/fa";

const SearchSection = ({
  origin,
  setOrigin,
  destination,
  setDestination,
  handleSearch,
  loading,
  error,
  selectedVehicleType,
  onVehicleTypeChange,
}) => {
  const [showSortMenu, setShowSortMenu] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setShowSortMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSort = (vehicle) => {
    onVehicleTypeChange(vehicle);
    setShowSortMenu(false);
  };


const vehicleOptions = [
  { label: "All Vehicles", value: "All", icon: FaCar },
  { label: "Bike", value: "Bike", icon: FaMotorcycle },
  { label: "Scooter", value: "Scooter", icon: FaMotorcycle },
  { label: "Car", value: "Car", icon: FaCarSide },
  { label: "SUV", value: "SUV", icon: FaCar },
  { label: "Van", value: "Van", icon: FaShuttleVan },
  { label: "Truck", value: "Truck", icon: FaTruck },
];

  return (
    <section className="py-8 px-4">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl p-8 border border-gray-200 shadow-md">
        {/* Header */}
        <div className="flex items-center gap-2 mb-6">
          <FiSearch className="text-blue-600" size={22} />
          <h2 className="text-xl font-bold text-gray-800">
            Search Routes
          </h2>
        </div>

        {/* Search Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* From */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-blue-600 mb-2">
              <FiNavigation className="text-green-600" size={16} />
              From Location *
            </label>

            <AddressAutoComplete
              value={origin}
              onChange={setOrigin}
              placeholder="Enter pickup location (e.g. Pune)"
            />
          </div>

          {/* To */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-blue-600 mb-2">
              <FiMapPin className="text-red-600" size={16} />
              To Location *
            </label>

            <AddressAutoComplete
              value={destination}
              onChange={setDestination}
              placeholder="Enter destination (e.g. Mumbai)"
            />
          </div>
        </div>

        {/* Search & Sort Buttons */}
        <div className="mt-6 flex flex-wrap items-center gap-3">
          {/* Search Button */}
          <button
            type="button"
            onClick={handleSearch}
            disabled={loading}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 min-w-[220px]"
          >
            <FiSearch size={18} />
            {loading ? "Finding Routes..." : "Search Travellers"}
          </button>

          {/* Sort Button */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setShowSortMenu((prev) => !prev)}
              className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 font-semibold px-4 py-2 rounded-lg shadow-md hover:bg-gray-50 transition-all duration-200"
            >
              Filter By Vehicle
              <FiChevronDown
                size={16}
                className={`transition-transform ${
                  showSortMenu ? "rotate-180" : ""
                }`}
              />
            </button>

{showSortMenu && (
  <div className="absolute left-0 mt-2 w-52 bg-white border border-gray-200 rounded-lg shadow-xl z-50 overflow-hidden">
{vehicleOptions.map(({ label, value, icon: Icon }) => (
  <button
    key={value}
    type="button"
    onClick={() => handleSort(value)}
    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100"
  >
    <Icon className="text-blue-600" size={18} />
    <span>{label}</span>
  </button>
))}
  </div>
)}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-5 p-3 rounded-lg border border-red-200 bg-red-50">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}
      </div>
    </section>
  );
};
export default SearchSection;