// src/core/common/AddressAutocomplete.jsx
import React, { useState, useRef, useEffect } from "react";
import { IoSearchOutline, IoLocationOutline } from "react-icons/io5";
import ApiService from "../services/api.service";

/**
 * Address input with Google Places Autocomplete dropdown.
 * Calls the backend proxy (/api/places/autocomplete) to avoid browser CORS restrictions.
 */
const AddressAutocomplete = ({
  value,
  onChange,
  onSelect,
  onBlur,
  placeholder = "Enter address",
  label,
  className = "",
  required = false,
}) => {
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef(null);
  const containerRef = useRef(null);

  const API_URL = import.meta.env.VITE_API_URL; // e.g. http://localhost:3000/api

  const fetchSuggestions = async (input) => {
    if (!input || input.trim().length < 3) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    setLoading(true);
    try {
      const res = await ApiService.getPlacesAutocomplete(input);
      const data = res.data;
      const list = data.predictions || [];

      if ((data.status && data.status !== "OK") || data.error_message) {
        console.warn("[Autocomplete] Backend status:", {
          status: data.status,
          error: data.error_message,
          input,
        });
      }

      setSuggestions(list);
      setShowDropdown(list.length > 0);
    } catch (err) {
      console.error("[Autocomplete] Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    onChange(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(val), 350);
  };

  const handleSelect = (prediction) => {
    const text = prediction.description || "";
    const placeId = prediction.place_id || "";
    onChange(text);
    setSuggestions([]);
    setShowDropdown(false);
    if (onSelect) onSelect(text, placeId);
  };

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      clearTimeout(debounceRef.current);
    };
  }, []);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {label && (
        <label className="block mb-1 text-[11px] text-gray-600 font-medium">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      {/* Input row */}
      <div className="relative flex items-center">
        <input
          type="text"
          value={value}
          onChange={handleInputChange}
          onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
          onBlur={() => {
            setTimeout(() => setShowDropdown(false), 200);
            if (onBlur) onBlur();
          }}
          placeholder={placeholder}
          className="w-full px-3 py-2 pr-9 border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
        />

        {/* Spinner while loading, search icon otherwise */}
        <span className="absolute right-3 text-gray-400 pointer-events-none">
          {loading ? (
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12" cy="12" r="10"
                stroke="currentColor" strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8z"
              />
            </svg>
          ) : (
            <IoSearchOutline className="w-4 h-4" />
          )}
        </span>
      </div>

      {/* Dropdown */}
      {showDropdown && suggestions.length > 0 && (
        <ul className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto">
          {suggestions.map((prediction) => {
            const main = prediction.structured_formatting?.main_text;
            const secondary = prediction.structured_formatting?.secondary_text;
            return (
              <li
                key={prediction.place_id}
                onMouseDown={() => handleSelect(prediction)}
                className="flex items-start gap-2 px-3 py-2.5 text-sm cursor-pointer hover:bg-blue-50 border-b border-gray-50 last:border-0"
              >
                <IoLocationOutline className="mt-0.5 shrink-0 text-primary w-4 h-4" />
                <span>
                  <span className="font-medium text-gray-800">{main}</span>
                  {secondary && (
                    <span className="block text-xs text-gray-500 mt-0.5">
                      {secondary}
                    </span>
                  )}
                </span>
              </li>
            );
          })}
          <li className="px-3 py-1.5 text-right">
            <span className="text-[10px] text-gray-400">Powered by Google</span>
          </li>
        </ul>
      )}
    </div>
  );
};

export default AddressAutocomplete;
