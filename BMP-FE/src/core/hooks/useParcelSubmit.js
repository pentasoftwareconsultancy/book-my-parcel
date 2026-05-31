import { useState } from "react";
import ApiService from "../../core/services/api.service.jsx";
import ServerUrl from "../../core/constants/serverUrl.constant.jsx";
import { showError } from "../../core/utils/toast.util.js";
import {
  validateRequired,
  validateOnlyCharacters,
  validatePhone,
} from "../../core/utils/validation.js";

const REQUIRED_FIELDS = [
  { key: "senderName",      label: "Sender Name" },
  { key: "pickupAddress",   label: "Pickup Address" },
  { key: "pickupCity",      label: "Pickup City" },
  { key: "pickupState",     label: "Pickup State" },
  { key: "pickupPincode",   label: "Pickup Pincode" },
  { key: "pickupCountry",   label: "Pickup Country" },
  { key: "pickupPhone",     label: "Pickup Phone Number" },
  { key: "packageSize",     label: "Package Size" },
  { key: "deliverySpeed",   label: "Delivery Speed" },
  { key: "parcelWeight",    label: "Parcel Weight" },
  { key: "parcelLength",    label: "Parcel Length" },
  { key: "parcelWidth",     label: "Parcel Width" },
  { key: "parcelHeight",    label: "Parcel Height" },
  { key: "parcelValue",     label: "Parcel Value" },
  { key: "parcelType",      label: "Parcel Type" },
  { key: "vehicleType",     label: "Vehicle Type" },
  { key: "receiverName",    label: "Receiver Name" },
  { key: "deliveryAddress", label: "Delivery Address" },
  { key: "deliveryCity",    label: "Delivery City" },
  { key: "deliveryState",   label: "Delivery State" },
  { key: "deliveryPincode", label: "Delivery Pincode" },
  { key: "deliveryCountry", label: "Delivery Country" },
  { key: "deliveryPhNo",    label: "Delivery Phone Number" },
];

const NAME_FIELDS  = ["senderName", "receiverName"];
const PHONE_FIELDS = ["pickupPhone", "deliveryPhNo"];

const buildFormData = (data) => {
  const fd = new FormData();

  // Package fields — skip undefined/null/empty to avoid sending "undefined" strings
  const pkg = {
    package_size:   data.packageSize,
    // delivery_speed: data.deliverySpeed,
    delivery_speed: data.deliverySpeed || "standard",
    weight:         data.parcelWeight  || 0,
    length:         data.parcelLength  || 0,
    width:          data.parcelWidth   || 0,
    height:         data.parcelHeight  || 0,
    description:    data.parcelContents || "",
    parcel_type:    data.parcelType,
    value:          data.parcelValue   || 0,
    notes:          data.parcelNotes   || "",
    vehicle_type:   data.vehicleType || null,
  };
  Object.entries(pkg).forEach(([k, v]) => {
    if (v !== undefined && v !== null) fd.append(k, v);
  });

  // Pickup address — sent as JSON string for parseJsonFields middleware
  const pickup = {
    name:      data.senderName,
    phone:     data.pickupPhone,
    alt_phone: data.pickupAltPhone  || undefined,
    aadhar_no: data.pickupAadhaar   || undefined,
    address:   data.pickupAddress,
    city:      data.pickupCity,
    state:     data.pickupState,
    pincode:   data.pickupPincode,
    country:   data.pickupCountry,
    place_id:  data.pickupPlaceId   || undefined,
  };
  Object.keys(pickup).forEach((k) => pickup[k] === undefined && delete pickup[k]);
  fd.append("pickup_address", JSON.stringify(pickup));

  // Delivery address — same pattern
  const delivery = {
    name:      data.receiverName,
    phone:     data.deliveryPhNo,
    alt_phone: data.deliveryAlternatePhNo || undefined,
    address:   data.deliveryAddress,
    city:      data.deliveryCity,
    state:     data.deliveryState,
    pincode:   data.deliveryPincode,
    country:   data.deliveryCountry,
    place_id:  data.deliveryPlaceId       || undefined,
  };
  Object.keys(delivery).forEach((k) => delivery[k] === undefined && delete delivery[k]);
  fd.append("delivery_address", JSON.stringify(delivery));

  // Optional preferred pickup date/time (send as separate fields)
  if (data.pickupDate) fd.append("pickup_date", data.pickupDate);
  if (data.pickupTime) fd.append("pickup_time", data.pickupTime);

  // Photos
  [data.parcelPhoto1, data.parcelPhoto2, data.parcelPhoto3].forEach((f) => {
    if (f) fd.append("parcel_photos", f);
  });

  // Optional fields
  if (data.selectedPartnerId)
    fd.append("selected_partner_id", data.selectedPartnerId);
  if (data.priceQuote)
    fd.append("price_quote", data.priceQuote.replace(/[^\d]/g, ""));

  return fd;
};

const validateForm = (data) => {
  for (const field of REQUIRED_FIELDS) {
    const err = validateRequired(data[field.key], field.label);
    if (err) return err;

    if (NAME_FIELDS.includes(field.key)) {
      const err = validateOnlyCharacters(data[field.key], field.label);
      if (err) return err;
    }

    if (PHONE_FIELDS.includes(field.key)) {
      const err = validatePhone(data[field.key]);
      if (err) return err;
    }
  }

  if (!data.parcelPhoto1 && !data.parcelPhoto2 && !data.parcelPhoto3)
    return "Please upload at least one parcel photo.";

  return null;
};

const useParcelSubmit = ({ data, createdParcelId, setCreatedParcelId, onNext }) => {
  const [showParcelPopup, setShowParcelPopup] = useState(false);
  const [newParcelId, setNewParcelId] = useState(null);

  const handleSubmit = async (e) => {
    if (e?.preventDefault) e.preventDefault();

    const validationError = validateForm(data);
    if (validationError) {
      showError(validationError);
      return;
    }

    // Prevent duplicate submission
    if (createdParcelId) {
      onNext();
      return;
    }

    try {
      const formData = buildFormData(data);
      const response = await ApiService.apipostForm(
        ServerUrl.API_CREATE_REQUEST,
        formData
      );

      if (response?.data?.success) {
        const parcelId = response.data.data?.parcel?.parcel_ref;
        setCreatedParcelId(response.data.data?.parcel?.id);
        setNewParcelId(parcelId);
        setShowParcelPopup(true);
      } else {
        showError(response?.data?.message || "Failed to create parcel");
      }
    } catch (error) {
      const backendMsg = error?.response?.data?.message || error?.response?.data?.error;
      console.error("Create parcel error:", backendMsg || error.message, error?.response?.data);
      showError(backendMsg || error.message || "Something went wrong");
    }
  };

  const handlePopupClose = () => {
    setShowParcelPopup(false);
    onNext();
  };

  return { handleSubmit, showParcelPopup, newParcelId, handlePopupClose };
};

export default useParcelSubmit;