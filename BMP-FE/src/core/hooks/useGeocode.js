// src/hooks/useGeocode.js
import { useCallback } from "react";

const GOOGLE_KEY = import.meta.env.VITE_GOOGLE_GEOCODING_API;

const useGeocode = (updateFields) => {
  const geocodeAddress = useCallback(
    async (address, type) => {
      if (!address?.trim()) return;
      try {
        const res = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_KEY}`
        );
        const dataRes = await res.json();
        if (dataRes.status !== "OK") return;

        const { lat, lng } = dataRes.results[0].geometry.location;
        const components = dataRes.results[0].address_components;
        const get = (t) =>
          components.find((c) => c.types.includes(t))?.long_name || "";

        const fields = {
          [`${type}Lat`]:     lat,
          [`${type}Lng`]:     lng,
          [`${type}PlaceId`]: dataRes.results[0].place_id,
          [`${type}City`]:    get("locality") || get("sublocality"),
          [`${type}State`]:   get("administrative_area_level_1"),
          [`${type}Pincode`]: get("postal_code"),
          [`${type}Country`]: get("country"),
        };
        updateFields(fields);
      } catch (err) {
        console.error("Geocode error:", err);
      }
    },
    [updateFields]
  );

  return { geocodeAddress };
};

export default useGeocode;