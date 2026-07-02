import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import ApiService from "../services/api.service";
import ServerUrl from "../constants/serverUrl.constant";
import { showError } from "../utils/toast.util";
import {
  validatePhone,
  validateRequired,
  validateOnlyCharacters,
  validatePincode,
  validateMaxLength,
  validatePositiveNumber,
} from "../utils/validation.js";

const VEHICLE_MULTIPLIERS = {
  bike: 0.9, car: 1.0, suv: 1.15, van: 1.25, tempo: 1.4, truck: 1.8,
  bus: 0.85, train: 0.75, plane: 3.5,
};

// Maximum distance (km) each vehicle type can service.
// null = no limit (public transport / long-haul vehicles).
// Keep in sync with BMP-Backend/src/utils/vehicleDistanceLimits.js.
export const VEHICLE_DISTANCE_LIMITS = {
  bike:   150,   // intra-city / short inter-district
  car:    500,   // inter-city, state-to-state
  suv:    700,   // extended inter-city
  van:    600,   // mid-range cargo
  tempo:  1000,  // regional cargo
  truck:  null,  // unlimited — long-haul
  bus:    null,  // unlimited — public transport
  train:  null,  // unlimited — rail
  plane:  null,  // unlimited — air
};

// Backend-aligned slab-based pricing functions
function getWeightCharge(weight) {
  if (weight <= 1) return 20;
  if (weight <= 5) return 50;
  if (weight <= 10) return 80;
  if (weight <= 20) return 120;
  return 180;
}

function getDistanceCharge(distance) {
  if (distance <= 50) return 30;
  if (distance <= 200) return 80;
  if (distance <= 500) return 150;
  if (distance <= 1000) return 250;
  return 400;
}

export const SIZE_OPTIONS = [
  { id: "small",       title: "Small",       desc: "Documents, letters",  min: 0,  max: 1  },
  { id: "medium",      title: "Medium",      desc: "Books, clothes",      min: 1,  max: 5  },
  { id: "large",       title: "Large",       desc: "Electronics, shoes",  min: 5,  max: 10 },
  { id: "extra_large", title: "Extra Large", desc: "Furniture parts",     min: 10, max: 20 },
];

const REQUIRED_FIELDS = [
  { key: "senderName",       label: "Sender Name" },
  { key: "pickupAddress",    label: "Pickup Address" },
  { key: "pickupCity",       label: "Pickup City" },
  { key: "pickupState",      label: "Pickup State" },
  { key: "pickupPincode",    label: "Pickup Pincode" },
  { key: "pickupCountry",    label: "Pickup Country" },
  { key: "pickupPhone",      label: "Pickup Phone Number" },
  { key: "packageSize",      label: "Package Size" },
  { key: "parcelWeight",     label: "Parcel Weight" },
  { key: "parcelLength",     label: "Parcel Length" },
  { key: "parcelWidth",      label: "Parcel Width" },
  { key: "parcelHeight",     label: "Parcel Height" },
  { key: "parcelValue",      label: "Parcel Value" },
  { key: "parcelType",       label: "Parcel Type" },
  { key: "receiverName",     label: "Receiver Name" },
  { key: "deliveryAddress",  label: "Delivery Address" },
  { key: "deliveryCity",     label: "Delivery City" },
  { key: "deliveryState",    label: "Delivery State" },
  { key: "deliveryPincode",  label: "Delivery Pincode" },
  { key: "deliveryCountry",  label: "Delivery Country" },
  { key: "deliveryPhNo",     label: "Delivery Phone Number" },
];

function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 10) / 10;
}

export function useStepPickup({ data, updateFields, onNext, createdParcelId, setCreatedParcelId, setShowConfirmation, setParcelId }) {
  const [selectedSize, setSelectedSize] = useState(null);
  const [estimatedPrice, setEstimatedPrice] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // ── Defect 1: Pre-fill sender name + phone from saved user profile ──────────
  const authUser = useSelector((state) => state.auth.user);
  useEffect(() => {
    // Only pre-fill when the form is brand-new (no parcel created yet, fields empty)
    if (createdParcelId) return;
    if (data.pickupPhone || data.senderName) return; // already filled

    const prefill = {};
    if (authUser?.phone_number && !data.pickupPhone) {
      prefill.pickupPhone = authUser.phone_number;
    }
    if (authUser?.name && !data.senderName) {
      prefill.senderName = authUser.name;
    }
    if (Object.keys(prefill).length > 0) updateFields(prefill);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authUser, createdParcelId]);

  // Sync selectedSize when data.packageSize changes (e.g. navigating back)
  useEffect(() => {
    if (data.packageSize) {
      const opt = SIZE_OPTIONS.find((o) => o.id === data.packageSize);
      if (opt) setSelectedSize(opt);
    }
  }, [data.packageSize]);

  // Recalculate estimated price whenever relevant fields change
  // Uses exact backend formula: (Distance + Weight) × Vehicle + Platform Fee + GST
  useEffect(() => {
    if (!data.pickupLat || !data.pickupLng || !data.deliveryLat || !data.deliveryLng || !data.parcelWeight || !data.vehicleType) {
      setEstimatedPrice(null);
      return;
    }
    try {
      const distance = haversineDistance(data.pickupLat, data.pickupLng, data.deliveryLat, data.deliveryLng);
      
      // Use actual weight only (NO dimension-based volumetric calculation)
      const weight = Number(data.parcelWeight) || 1;
      
      // Apply backend-aligned slab-based pricing
      const weightCharge = getWeightCharge(weight);
      const distanceCharge = getDistanceCharge(distance);
      
      // Apply vehicle multiplier
      const multiplier = VEHICLE_MULTIPLIERS[data.vehicleType] || 1.0;
      const basePrice = Math.round((distanceCharge + weightCharge) * multiplier);
      
      // Calculate platform fee (assume 10% for frontend estimation)
      const platformFee = Math.round(basePrice * 0.10);
      const subtotal = basePrice + platformFee;
      
      // Calculate GST (18%)
      const gstAmount = Math.round(subtotal * 0.18);
      
      // Final price
      const finalPrice = subtotal + gstAmount;
      
      setEstimatedPrice(finalPrice);
      updateFields({ priceQuote: finalPrice });
    } catch {
      setEstimatedPrice(null);
    }
  }, [data.pickupLat, data.pickupLng, data.deliveryLat, data.deliveryLng, data.parcelWeight, data.vehicleType]);

  const geocodeAddress = async (address, type, selectedPlaceId = "") => {
    if (!address?.trim()) return;
    try {
      const placeId = selectedPlaceId || data[`${type}PlaceId`] || "";
      const res = await ApiService.geocodeAddress(address, placeId);
      const d = res?.data;
      const result = Array.isArray(d?.results) ? d.results[0] : null;
      if (d?.status === "OK" && result?.geometry?.location) {
        const { lat, lng } = result.geometry.location;
        const resolvedPlaceId = selectedPlaceId || result.place_id || "";
        const get = (t) => result.address_components?.find((c) => c.types.includes(t))?.long_name || "";
        
        let pincode = get("postal_code");
        if (!pincode) {
          const formattedAddress = result.formatted_address || "";
          const match = formattedAddress.match(/\b\d{6}\b/) || address.match(/\b\d{6}\b/);
          if (match) pincode = match[0];
        }

        updateFields({
          [`${type}Lat`]:     lat,
          [`${type}Lng`]:     lng,
          [`${type}PlaceId`]: resolvedPlaceId,
          [`${type}City`]:    get("locality") || get("sublocality") || get("administrative_area_level_2"),
          [`${type}State`]:   get("administrative_area_level_1"),
          [`${type}Pincode`]: pincode || "",
          [`${type}Country`]: get("country"),
        });
      }
    } catch { /* silent */ }
  };

  const validate = () => {
    const MAX_ADDRESS_LENGTH = 250;
    const MAX_TEXT_FIELD_LENGTH = 100;
    const MAX_NOTE_LENGTH = 250;

    for (const field of REQUIRED_FIELDS) {
      const err = validateRequired(data[field.key], field.label);
      if (err) { showError(err); return false; }

      if (field.key === "senderName" || field.key === "receiverName") {
        const err2 = validateOnlyCharacters(data[field.key], field.label);
        if (err2) { showError(err2); return false; }
        const err3 = validateMaxLength(data[field.key], MAX_TEXT_FIELD_LENGTH, field.label);
        if (err3) { showError(err3); return false; }
      }

      if (field.key === "pickupPhone" || field.key === "deliveryPhNo") {
        const err3 = validatePhone(data[field.key]);
        if (err3) { showError(err3); return false; }
      }

      if (field.key === "pickupPincode" || field.key === "deliveryPincode") {
        const err4 = validatePincode(data[field.key]);
        if (err4) { showError(err4); return false; }
      }
    }

    let err = validateMaxLength(data.pickupAddress, MAX_ADDRESS_LENGTH, "Pickup address");
    if (err) { showError(err); return false; }

    err = validateMaxLength(data.deliveryAddress, MAX_ADDRESS_LENGTH, "Delivery address");
    if (err) { showError(err); return false; }

    err = validateMaxLength(data.parcelContents, MAX_NOTE_LENGTH, "Package description");
    if (err) { showError(err); return false; }

    err = validateMaxLength(data.parcelNotes, MAX_NOTE_LENGTH, "Additional note");
    if (err) { showError(err); return false; }

    err = validatePositiveNumber(data.parcelWeight, "Parcel weight", 1000);
    if (err) { showError(err); return false; }

    err = validatePositiveNumber(data.parcelLength, "Parcel length", 500);
    if (err) { showError(err); return false; }

    err = validatePositiveNumber(data.parcelWidth, "Parcel width", 500);
    if (err) { showError(err); return false; }

    err = validatePositiveNumber(data.parcelHeight, "Parcel height", 500);
    if (err) { showError(err); return false; }

    err = validatePositiveNumber(data.parcelValue, "Parcel value", 10000000);
    if (err) { showError(err); return false; }

    if (!data.parcelType) {
      showError("Parcel type is required.");
      return false;
    }

    if (!data.parcelPhoto1 && !data.parcelPhoto2 && !data.parcelPhoto3) {
      showError("Please upload at least one parcel photo.");
      return false;
    }

    const MAX_PHOTO_SIZE = 6 * 1024 * 1024; // 6 MB
    const photos = [
      { file: data.parcelPhoto1, label: "Parcel photo 1" },
      { file: data.parcelPhoto2, label: "Parcel photo 2" },
      { file: data.parcelPhoto3, label: "Parcel photo 3" },
    ];
    for (const { file, label } of photos) {
      if (file instanceof File && file.size > MAX_PHOTO_SIZE) {
        showError(`${label} exceeds 6 MB. Please upload a smaller image.`);
        return false;
      }
    }

    // Vehicle-distance compatibility check
    if (data.vehicleType && data.pickupLat && data.pickupLng && data.deliveryLat && data.deliveryLng) {
      const km = haversineDistance(data.pickupLat, data.pickupLng, data.deliveryLat, data.deliveryLng);
      const maxKm = VEHICLE_DISTANCE_LIMITS[data.vehicleType];
      if (maxKm !== null && maxKm !== undefined && km > maxKm) {
        showError(
          `${data.vehicleType.charAt(0).toUpperCase() + data.vehicleType.slice(1)} is only suitable for routes up to ${maxKm} km. ` +
          `Your estimated distance is ${Math.round(km)} km. Please choose a different vehicle type (e.g. Tempo or Truck).`
        );
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (createdParcelId) { onNext(); return; }
    if (!validate()) return;

    try {
      setSubmitting(true);
      const fd = new FormData();

      // Package
      fd.append("package_size", data.packageSize);
      fd.append("weight",       data.parcelWeight || 0);
      fd.append("length",       data.parcelLength || 0);
      fd.append("width",        data.parcelWidth  || 0);
      fd.append("height",       data.parcelHeight || 0);
      fd.append("description",  data.parcelContents || "");
      fd.append("parcel_type",  data.parcelType || "");
      fd.append("value",        data.parcelValue || 0);
      fd.append("vehicle_type", data.vehicleType || "");
      fd.append("notes",        data.parcelNotes || "");

      // Pickup address
      const pickup = { name: data.senderName, phone: data.pickupPhone, alt_phone: data.pickupAltPhone || undefined, aadhar_no: data.pickupAadhaar || undefined, address: data.pickupAddress, city: data.pickupCity, state: data.pickupState, pincode: data.pickupPincode, country: data.pickupCountry, place_id: data.pickupPlaceId || undefined };
      Object.keys(pickup).forEach((k) => pickup[k] === undefined && delete pickup[k]);
      fd.append("pickup_address", JSON.stringify(pickup));

      // Delivery address
      const delivery = { name: data.receiverName, phone: data.deliveryPhNo, alt_phone: data.deliveryAlternatePhNo || undefined, address: data.deliveryAddress, city: data.deliveryCity, state: data.deliveryState, pincode: data.deliveryPincode, country: data.deliveryCountry, place_id: data.deliveryPlaceId || undefined };
      Object.keys(delivery).forEach((k) => delivery[k] === undefined && delete delivery[k]);
      fd.append("delivery_address", JSON.stringify(delivery));

      // Photos
      [data.parcelPhoto1, data.parcelPhoto2, data.parcelPhoto3].forEach((f) => { if (f) fd.append("parcel_photos", f); });

      // Optional pickup scheduling
      if (data.pickupDate) fd.append("pickup_date", data.pickupDate);
      if (data.pickupTime) fd.append("pickup_time", data.pickupTime);

      if (data.selectedPartnerId) fd.append("selected_partner_id", data.selectedPartnerId);
      if (estimatedPrice) fd.append("price_quote", estimatedPrice);
      fd.append("form_step", 1);

      const response = await ApiService.apipostForm(ServerUrl.API_CREATE_REQUEST, fd, { timeout: 120000 });

      if (response?.data?.success) {
        const parcelId = response.data.data?.parcel?.parcel_ref || response.data.data?.parcel?.id;
        setCreatedParcelId(response.data.data?.parcel?.id);
        setParcelId(parcelId);
        setShowConfirmation(true);
      } else {
        showError(response?.data?.message || "Failed to create parcel");
      }
    } catch (error) {
      if (error.response?.status === 429) {
        showError("Too many requests. Please wait a few minutes before trying again.");
      } else if (error.response?.data?.errors) {
        showError("Validation failed: " + error.response.data.errors.map((e) => `${e.field}: ${e.message}`).join(", "));
      } else if (error.code === "ECONNABORTED" || error.message?.includes("timeout")) {
        showError("Upload timed out. Please check your connection or use smaller photos and try again.");
      } else if (!error.response) {
        showError("Network error. Please check your internet connection and try again.");
      } else {
        showError(error.response?.data?.message || error.message || "Something went wrong");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return { selectedSize, setSelectedSize, estimatedPrice, submitting, geocodeAddress, handleSubmit };
}
