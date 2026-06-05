import TextInput from "../../core/common/CommonUi";
import AddressAutocomplete from "../../core/common/AddressAutocomplete";
import TimePicker12h from "../../components/common/TimePicker12h.jsx"
import {validateFutureDate } from "../../core/utils/validation.js";
import { Home } from "lucide-react";
import {
  nameTypingPattern,
  aadhaarTypingPattern,
  validatePincode,
  pinTypingPattern,
  numberTypingPattern,
} from "../../core/utils/validation.js";

const PickupSection = ({ data, updateFields, geocodeAddress }) => {
  const pat = (pattern, key) => (e) => {
    if (pattern.test(e.target.value)) updateFields({ [key]: e.target.value });
  };

  return (
    <div className="px-6 py-6 bg-white border shadow-2xl rounded-3xl border-primary/20">
      <h2 className="flex items-center gap-2 mb-4 text-lg font-semibold text-primary">
        <span className="flex items-center justify-center w-10 h-10 text-white rounded-md bg-primary">
          <Home size={18} />
        </span>
        Pickup Location
      </h2>

      <div className="grid gap-4 md:grid-cols-2">
        {/* <TextInput label="Sender Name" name="senderName" value={data.senderName}
          required={true}
          onChange={pat(nameTypingPattern, "senderName")} placeholder="Enter sender name" /> */}
        <TextInput
          label="Sender Name"
          name="senderName"
          value={data.senderName}
          maxLength={50}   // ✅ ADD THIS
          onChange={pat(nameTypingPattern, "senderName")}
        />
        <AddressAutocomplete label="Pickup Address" value={data.pickupAddress}
          required={true}
          onChange={(text) => updateFields({ pickupAddress: text, pickupPlaceId: "" })}
          onSelect={(text, placeId) => { updateFields({ pickupAddress: text, pickupPlaceId: placeId || "" }); geocodeAddress(text, "pickup", placeId); }}
          onBlur={() => geocodeAddress(data.pickupAddress, "pickup")}
          placeholder="Enter pickup address" />
      </div>

      <div className="grid gap-4 mt-4 md:grid-cols-3">
        <TextInput label="City / Village" name="pickupCity" value={data.pickupCity} required={true} onChange={pat(nameTypingPattern, "pickupCity")} />
        <TextInput label="State" name="pickupState" value={data.pickupState} required={true} onChange={pat(nameTypingPattern, "pickupState")} />
        <TextInput label="Pincode" name="pickupPincode" type="text" inputMode="numeric" value={data.pickupPincode}
          required={true}
          onChange={pat(pinTypingPattern, "pickupPincode")}
          maxLength={6}
          onBlur={() => { const e = validatePincode(data.pickupPincode); if (e) alert(e); }} />
      </div>

      <div className="grid gap-4 mt-4 md:grid-cols-3">
        <TextInput label="Country" name="pickupCountry" value={data.pickupCountry} required={true} onChange={pat(nameTypingPattern, "pickupCountry")} />
        <TextInput label="Phone number" name="pickupPhone" type="tel" value={data.pickupPhone} required={true} onChange={pat(numberTypingPattern, "pickupPhone")} />
        <TextInput label="Alternate phone" name="pickupAltPhone" type="tel" value={data.pickupAltPhone} onChange={pat(numberTypingPattern, "pickupAltPhone")} />
      </div>

      <div className="grid gap-4 mt-4 md:grid-cols-2">
        {/* <TextInput label="Preferred pickup date (optional)" name="pickupDate" type="date"
          value={data.pickupDate || ""}
          onChange={(e) => updateFields({ pickupDate: e.target.value })}
        /> */}
        <TextInput
          label="Preferred pickup date (optional)"
          name="pickupDate"
          type="date"
          value={data.pickupDate || ""}
          min={new Date().toISOString().split("T")[0]}
          onChange={(e) => {
            const date = e.target.value;

            const error = validateFutureDate(date);
            if (error) {
              alert(error); // or toast.error(error)
              return;
            }

            updateFields({ pickupDate: date });
          }}
        />
        {/* <TextInput label="Preferred pickup time (optional)" name="pickupTime" type="time"
          value={data.pickupTime || ""}
          onChange={(e) => updateFields({ pickupTime: e.target.value })}
        /> */}
        <TimePicker12h
          label="Preferred pickup time (optional)"
          value={data.pickupTime || ""}
          onChange={(time) => updateFields({ pickupTime: time })}
        />
      </div>

      <TextInput label="Aadhaar number (optional)" name="pickupAadhaar" type="text"
        value={data.pickupAadhaar} onChange={pat(aadhaarTypingPattern, "pickupAadhaar")} className="mt-4 text-gray-400" />
    </div>
  );
};

export default PickupSection;
