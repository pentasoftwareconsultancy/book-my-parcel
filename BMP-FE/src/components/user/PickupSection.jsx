import TextInput from "../../core/common/CommonUi";
import AddressAutoComplete from "../../core/common/AddressAutocomplete.jsx";
import TimePicker12h from "../../components/common/TimePicker12h.jsx"
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

  const today = new Date().toISOString().split("T")[0];

  const currentTime =
    data.pickupDate === today
      ? new Date().toTimeString().slice(0, 5)
      : null;

  return (
    <div className="px-4 sm:px-6 py-4 sm:py-6 bg-white border shadow-2xl rounded-3xl border-primary/20">
      <h2 className="flex items-center gap-2 mb-4 text-lg font-semibold text-primary">
        <span className="flex items-center justify-center w-10 h-10 text-white rounded-md bg-primary">
          <Home size={18} />
        </span>
        Pickup Location
      </h2>

      <div className="grid gap-4 sm:grid-cols-2">
        {/* <TextInput label="Sender Name" name="senderName" value={data.senderName}
          required={true}
          onChange={pat(nameTypingPattern, "senderName")} placeholder="Enter sender name" /> */}
        <TextInput
          label="Sender Name"
          name="senderName"
          value={data.senderName}
          maxLength={50}
          onChange={pat(nameTypingPattern, "senderName")}
        />
        <AddressAutoComplete label="Pickup Address" value={data.pickupAddress}
          required={true}
          maxLength={250}
          onChange={(text) => updateFields({ pickupAddress: text, pickupPlaceId: "" })}
          onSelect={(text, placeId) => { updateFields({ pickupAddress: text, pickupPlaceId: placeId || "" }); geocodeAddress(text, "pickup", placeId); }}
          onBlur={() => geocodeAddress(data.pickupAddress, "pickup")}
          placeholder="Enter pickup address" />
      </div>

      <div className="grid gap-4 mt-4 sm:grid-cols-2 md:grid-cols-3">
        <TextInput label="City / Village" name="pickupCity" value={data.pickupCity} required={true} maxLength={50} onChange={pat(nameTypingPattern, "pickupCity")} />
        <TextInput label="State" name="pickupState" value={data.pickupState} required={true} maxLength={50} onChange={pat(nameTypingPattern, "pickupState")} />
        <TextInput label="Pincode" name="pickupPincode" type="text" inputMode="numeric" value={data.pickupPincode}
          required={true}
          maxLength={6}
          onChange={pat(pinTypingPattern, "pickupPincode")}
        />
      </div>

      <div className="grid gap-4 mt-4 sm:grid-cols-2 md:grid-cols-3">
        <TextInput label="Country" name="pickupCountry" value={data.pickupCountry} required={true} maxLength={50} onChange={pat(nameTypingPattern, "pickupCountry")} />
        <TextInput label="Phone number" name="pickupPhone" type="tel" value={data.pickupPhone} required={true} maxLength={10} onChange={pat(numberTypingPattern, "pickupPhone")} />
        <TextInput label="Alternate phone" name="pickupAltPhone" type="tel" value={data.pickupAltPhone} maxLength={10} onChange={pat(numberTypingPattern, "pickupAltPhone")} />
      </div>

      <div className="grid gap-4 mt-4 sm:grid-cols-2">
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
            const today = new Date().toISOString().split("T")[0];
            if (date && date < today) {
              // Silently ignore past dates — the min attribute already prevents it in most browsers
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
          minTime={currentTime}
          onChange={(time) => updateFields({ pickupTime: time })}
        />
      </div>

      <TextInput label="Aadhaar number (optional)" name="pickupAadhaar" type="text"
        value={data.pickupAadhaar} onChange={pat(aadhaarTypingPattern, "pickupAadhaar")} className="mt-4 text-gray-400" />
    </div>
  );
};

export default PickupSection;
