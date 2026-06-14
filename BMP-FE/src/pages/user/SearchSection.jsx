import React from "react";
import { FiSearch } from "react-icons/fi";
import AddressAutoComplete from "../../core/common/AddressAutocomplete";
import { FiNavigation, FiMapPin } from "react-icons/fi";  // Update the path if needed

const SearchSection = ({
  origin,
  setOrigin,
  destination,
  setDestination,
  handleSearch,
  loading,
  error,
}) => {
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
              {/* Search Button */}
              <div className="mt-6 flex justify-center md:justify-end">
                  <button
                      onClick={handleSearch}
                      disabled={loading}
                      className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold px-8 py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 min-w-[220px]"
                  >
                      <FiSearch size={18} />
                      {loading ? "Finding Routes..." : "Search Travellers"}
                  </button>
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