import { useState, useEffect } from "react";
import ApiService from "../services/api.service";
import ServerUrl from "../constants/serverUrl.constant";
import {
  validatePhone,
  validateRequired,
  validateOnlyCharacters,
  validatePincode,
} from "../utils/validation.js";

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

  // Sync selectedSize when data.packageSize changes (e.g. navigating back)
  useEffect(() => {
    if (data.packageSize) {
      const opt = SIZE_OPTIONS.find((o) => o.id === data.packageSize);
      if (opt) setSelectedSize(opt);
    }
  }, [data.packageSize]);

  // Recalculate estimated price whenever relevant fields change
  useEffect(() => {
    if (!data.pickupLat || !data.pickupLng || !data.deliveryLat || !data.deliveryLng || !data.parcelWeight) {
      setEstimatedPrice(null);
      return;
    }
    try {
      const distance = haversineDistance(data.pickupLat, data.pickupLng, data.deliveryLat, data.deliveryLng);
      const l = Number(data.parcelLength) || 0;
      const w = Number(data.parcelWidth)  || 0;
      const h = Number(data.parcelHeight) || 0;
      const volumetric = l > 0 && w > 0 && h > 0 ? (l * w * h) / 6000 : 0;
      const billable = Math.max(Number(data.parcelWeight) || 0, volumetric);
      const price = Math.round(50 + distance * 0.5 + billable * 10);
      setEstimatedPrice(price);
      updateFields({ priceQuote: price });
    } catch {
      setEstimatedPrice(null);
    }
  }, [data.pickupLat, data.pickupLng, data.deliveryLat, data.deliveryLng, data.parcelWeight, data.parcelLength, data.parcelWidth, data.parcelHeight]);

  const geocodeAddress = async (address, type, selectedPlaceId = "") => {
    if (!address?.trim()) return;
    try {
      const res = await ApiService.geocodeAddress(address);
      const d = res?.data;
      const result = Array.isArray(d?.results) ? d.results[0] : null;
      if (d?.status === "OK" && result?.geometry?.location) {
        const { lat, lng } = result.geometry.location;
        const placeId = selectedPlaceId || result.place_id || "";
        const get = (t) => result.address_components?.find((c) => c.types.includes(t))?.long_name || "";
        updateFields({
          [`${type}Lat`]:     lat,
          [`${type}Lng`]:     lng,
          [`${type}PlaceId`]: placeId,
          [`${type}City`]:    get("locality") || get("sublocality"),
          [`${type}State`]:   get("administrative_area_level_1"),
          [`${type}Pincode`]: get("postal_code"),
          [`${type}Country`]: get("country"),
        });
      }
    } catch { /* silent */ }
  };

  const validate = () => {
    for (const field of REQUIRED_FIELDS) {
      const err = validateRequired(data[field.key], field.label);
      if (err) { alert(err); return false; }
      if (field.key === "senderName" || field.key === "receiverName") {
        const err2 = validateOnlyCharacters(data[field.key], field.label);
        if (err2) { alert(err2); return false; }
      }
      if (field.key === "pickupPhone" || field.key === "deliveryPhNo") {
        const err3 = validatePhone(data[field.key]);
        if (err3) { alert(err3); return false; }
      }
    }
    if (!data.parcelPhoto1 && !data.parcelPhoto2 && !data.parcelPhoto3) {
      alert("Please upload at least one parcel photo.");
      return false;
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

      if (data.selectedPartnerId) fd.append("selected_partner_id", data.selectedPartnerId);
      if (estimatedPrice) fd.append("price_quote", estimatedPrice);
      fd.append("form_step", 1);

      const response = await ApiService.apipostForm(ServerUrl.API_CREATE_REQUEST, fd);

      if (response?.data?.success) {
        const parcelId = response.data.data?.parcel?.parcel_ref || response.data.data?.parcel?.id;
        setCreatedParcelId(response.data.data?.parcel?.id);
        setParcelId(parcelId);
        setShowConfirmation(true);
      } else {
        alert(response?.data?.message || "Failed to create parcel");
      }
    } catch (error) {
      if (error.response?.status === 429) {
        alert("Too many requests. Please wait a few minutes before trying again.");
      } else if (error.response?.data?.errors) {
        alert("Validation failed:\n" + error.response.data.errors.map((e) => `${e.field}: ${e.message}`).join("\n"));
      } else {
        alert(error.response?.data?.message || error.message || "Something went wrong");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return { selectedSize, setSelectedSize, estimatedPrice, submitting, geocodeAddress, handleSubmit };
}
