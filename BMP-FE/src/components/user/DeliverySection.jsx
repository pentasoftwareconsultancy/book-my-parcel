import TextInput from "../../core/common/CommonUi";
import AddressAutoComplete from "../../core/common/AddressAutocomplete";
import {
  nameTypingPattern,
  pinTypingPattern,
  numberTypingPattern,
} from "../../core/utils/validation.js";

const DeliverySection = ({ data, updateFields, geocodeAddress }) => {
  const pat = (pattern, key) => (e) => {
    if (pattern.test(e.target.value)) updateFields({ [key]: e.target.value });
  };

  return (
    <div className="px-4 sm:px-6 py-4 sm:py-6 bg-white border border-gray-100 shadow-2xl rounded-3xl border-primary/20">
      <h3 className="mb-4 text-lg font-semibold text-primary">Delivery Details</h3>

      <div className="grid gap-4 sm:grid-cols-2">
        <TextInput label="Receiver Name" name="receiverName" value={data.receiverName} required={true} maxLength={50} onChange={pat(nameTypingPattern, "receiverName")} />
        <AddressAutoComplete label="Delivery Address" value={data.deliveryAddress}
          required={true}
          maxLength={250}
          onChange={(text) => updateFields({ deliveryAddress: text, deliveryPlaceId: "" })}
          onSelect={(text, placeId) => { updateFields({ deliveryAddress: text, deliveryPlaceId: placeId || "" }); geocodeAddress(text, "delivery", placeId); }}
          onBlur={() => geocodeAddress(data.deliveryAddress, "delivery")}
          placeholder="Enter delivery address" />
      </div>

      <div className="grid gap-4 mt-4 sm:grid-cols-2 md:grid-cols-3">
        <TextInput label="City" name="deliveryCity" value={data.deliveryCity} required={true} maxLength={50} onChange={pat(nameTypingPattern, "deliveryCity")} />
        <TextInput label="State" name="deliveryState" value={data.deliveryState} required={true} maxLength={50} onChange={pat(nameTypingPattern, "deliveryState")} />
        <TextInput label="Pincode" name="deliveryPincode" type="text" inputMode="numeric" value={data.deliveryPincode}
          required={true}
          maxLength={6}
          onChange={pat(pinTypingPattern, "deliveryPincode")}
        />
      </div>

      <div className="grid gap-4 mt-4 sm:grid-cols-2 md:grid-cols-3">
        <TextInput label="Country" name="deliveryCountry" value={data.deliveryCountry} required={true} maxLength={50} onChange={pat(nameTypingPattern, "deliveryCountry")} />
        <TextInput label="Phone Number" name="deliveryPhNo" type="tel" required={true} value={data.deliveryPhNo} maxLength={10} onChange={pat(numberTypingPattern, "deliveryPhNo")} />
        <TextInput label="Alternate Phone Number" name="deliveryAlternatePhNo" value={data.deliveryAlternatePhNo} maxLength={10} onChange={pat(numberTypingPattern, "deliveryAlternatePhNo")} />
      </div>
    </div>
  );
};

export default DeliverySection;
