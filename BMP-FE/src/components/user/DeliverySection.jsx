import TextInput from "../../core/common/CommonUi";
import AddressAutocomplete from "../../core/common/AddressAutocomplete";
import {
  nameTypingPattern,
  validatePincode,
  pinTypingPattern,
  numberTypingPattern,
} from "../../core/utils/validation.js";

const DeliverySection = ({ data, updateFields, geocodeAddress }) => {
  const pat = (pattern, key) => (e) => {
    if (pattern.test(e.target.value)) updateFields({ [key]: e.target.value });
  };

  return (
    <div className="px-6 py-6 bg-white border border-gray-100 shadow-2xl rounded-3xl border-primary/20">
      <h3 className="mb-4 text-lg font-semibold text-primary">Delivery Details</h3>

      <div className="grid gap-4 md:grid-cols-2">
        <TextInput label="Receiver Name" name="receiverName" value={data.receiverName} onChange={pat(nameTypingPattern, "receiverName")} />
        <AddressAutocomplete label="Delivery Address" value={data.deliveryAddress}
          onChange={(text) => updateFields({ deliveryAddress: text })}
          onSelect={(text, placeId) => { updateFields({ deliveryAddress: text, deliveryPlaceId: placeId || "" }); geocodeAddress(text, "delivery", placeId); }}
          onBlur={() => geocodeAddress(data.deliveryAddress, "delivery")}
          placeholder="Enter delivery address" />
      </div>

      <div className="grid gap-4 mt-4 md:grid-cols-3">
        <TextInput label="City" name="deliveryCity" value={data.deliveryCity} onChange={pat(nameTypingPattern, "deliveryCity")} />
        <TextInput label="State" name="deliveryState" value={data.deliveryState} onChange={pat(nameTypingPattern, "deliveryState")} />
        <TextInput label="Pincode" name="deliveryPincode" type="text" inputMode="numeric" value={data.deliveryPincode}
          onChange={pat(pinTypingPattern, "deliveryPincode")}
          maxLength={6}
          onBlur={() => { const e = validatePincode(data.deliveryPincode); if (e) alert(e); }} />
      </div>

      <div className="grid gap-4 mt-4 md:grid-cols-3">
        <TextInput label="Country" name="deliveryCountry" value={data.deliveryCountry} onChange={pat(nameTypingPattern, "deliveryCountry")} />
        <TextInput label="Phone Number" name="deliveryPhNo" type="number" value={data.deliveryPhNo} onChange={pat(numberTypingPattern, "deliveryPhNo")} />
        <TextInput label="Alternate Phone Number" name="deliveryAlternatePhNo" value={data.deliveryAlternatePhNo} onChange={pat(numberTypingPattern, "deliveryAlternatePhNo")} />
      </div>
    </div>
  );
};

export default DeliverySection;
