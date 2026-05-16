import { useState } from "react";
import { Controller } from "react-hook-form";
import AddressAutocomplete from "../../core/common/AddressAutocomplete";
import ApiService from "../../core/services/api.service";
import { validatePincode, pinTypingPattern } from "../../core/utils/validation";

const InputField = ({ label, error, helperText, children }) => (
  <div className="flex flex-col gap-1">
    {label && <label className="text-xs text-gray-500">{label}</label>}
    {children}
    {helperText && <p className={`text-xs ml-0.5 ${error ? "text-red-600" : "text-gray-500"}`}>{helperText}</p>}
  </div>
);

const TextInput = ({ error, ...props }) => (
  <input
    {...props}
    className={`w-full border rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white
      ${error ? "border-red-500 focus:ring-red-400" : "border-gray-300"}`}
  />
);

// Pincode field with live validation
const PincodeField = ({ field, schemaError }) => {
  const [error, setError] = useState("");
  const displayError = schemaError || error;
  return (
    <InputField label="Pincode *" error={!!displayError} helperText={displayError}>
      <TextInput
        value={field.value || ""}
        inputMode="numeric"
        maxLength={6}
        placeholder="e.g. 400001"
        error={!!displayError}
        onChange={(e) => {
          if (pinTypingPattern.test(e.target.value)) {
            field.onChange(e.target.value);
            setError("");
          }
        }}
        onBlur={() => {
          field.onBlur();
          setError(validatePincode(field.value) || "");
        }}
      />
    </InputField>
  );
};

const TEXT_FIELDS = [
  { name: "city",    label: "City *",    placeholder: "e.g. Mumbai" },
  { name: "state",   label: "State *",   placeholder: "e.g. Maharashtra" },
  { name: "country", label: "Country *", placeholder: "e.g. India" },
];

export default function AddressCard({ fieldName, label, icon, control, errors, onPlaceSelected }) {
  const fieldErrors = errors?.[fieldName] || {};

  const geocodeAddress = async (address) => {
    if (!address || address.trim().length < 3) return;
    try {
      const res = await ApiService.geocodeAddress(address);
      const dataRes = res.data;
      if (dataRes.status !== "OK") return;
      const result = dataRes.results[0];
      const get = (type) => result.address_components.find((c) => c.types.includes(type))?.long_name || "";
      onPlaceSelected({
        place_id: result.place_id,
        address: result.formatted_address,
        city: get("locality") || get("sublocality"),
        state: get("administrative_area_level_1"),
        pincode: get("postal_code"),
        country: get("country") || "India",
        formatted: result.formatted_address,
        lat: result.geometry.location.lat,
        lng: result.geometry.location.lng,
      });
    } catch (_) {}
  };

  return (
    <div className="bg-white rounded-2xl p-6 mb-4 border border-gray-100 shadow-lg">
      <div className="flex items-center gap-2 mb-4">
        {icon}
        <span className="font-semibold">{label}</span>
      </div>

      <Controller
        name={`${fieldName}.formatted`}
        control={control}
        defaultValue=""
        render={({ field }) => (
          <div className="mb-4">
            <AddressAutocomplete
              label={`Search for ${fieldName} address`}
              value={field.value}
              onChange={field.onChange}
              onSelect={(text) => { field.onChange(text); geocodeAddress(text); }}
              onBlur={() => { if (field.value?.length > 3) geocodeAddress(field.value); }}
              placeholder="Start typing to see suggestions..."
            />
            {fieldErrors.address && <p className="text-xs text-red-600 mt-0.5 ml-1">{fieldErrors.address.message}</p>}
          </div>
        )}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <Controller
            name={`${fieldName}.address`}
            control={control}
            render={({ field }) => (
              <InputField label="Street Address *" error={!!fieldErrors.address} helperText={fieldErrors.address?.message}>
                <TextInput {...field} value={field.value || ""} placeholder="Auto-filled or enter manually" error={!!fieldErrors.address} />
              </InputField>
            )}
          />
        </div>
        {TEXT_FIELDS.map(({ name, label: fLabel, placeholder }) => (
          <Controller key={name} name={`${fieldName}.${name}`} control={control} render={({ field }) => (
            <InputField label={fLabel} error={!!fieldErrors[name]} helperText={fieldErrors[name]?.message}>
              <TextInput {...field} value={field.value || ""} placeholder={placeholder} error={!!fieldErrors[name]} />
            </InputField>
          )} />
        ))}
        {/* Pincode with live validation */}
        <Controller
          name={`${fieldName}.pincode`}
          control={control}
          render={({ field }) => (
            <PincodeField field={field} schemaError={fieldErrors.pincode?.message} />
          )}
        />
      </div>
    </div>
  );
}
