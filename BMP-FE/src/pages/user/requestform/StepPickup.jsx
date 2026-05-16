import { useStepPickup } from "../../../core/hooks/useStepPickup";
import PickupSection   from "../../../components/user/PickupSection";
import PackageSection  from "../../../components/user/PackageSection";
import DeliverySection from "../../../components/user/DeliverySection";

const StepPickup = ({ data, updateFields, onNext, createdParcelId, setCreatedParcelId, setShowConfirmation, setParcelId }) => {
  const { selectedSize, setSelectedSize, estimatedPrice, submitting, geocodeAddress, handleSubmit } =
    useStepPickup({ data, updateFields, onNext, createdParcelId, setCreatedParcelId, setShowConfirmation, setParcelId });

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <PickupSection   data={data} updateFields={updateFields} geocodeAddress={geocodeAddress} />
      <PackageSection  data={data} updateFields={updateFields} selectedSize={selectedSize} setSelectedSize={setSelectedSize} />
      <DeliverySection data={data} updateFields={updateFields} geocodeAddress={geocodeAddress} />

      {/* Submit */}
      <div className="flex flex-col items-end gap-2">
        {estimatedPrice && (
          <div className="text-sm text-gray-600 bg-blue-50 border border-blue-200 rounded-xl px-4 py-2">
            Estimated price: <span className="font-bold text-blue-700">₹{estimatedPrice}</span>
            <span className="text-xs text-gray-400 ml-1">(final price calculated after route)</span>
          </div>
        )}
        <button type="submit" disabled={submitting}
          className="px-6 py-2 text-sm font-medium text-white transition rounded-full bg-primary hover:bg-primaryDark disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {submitting ? (
            <>
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Processing...
            </>
          ) : "Next: Select Partner"}
        </button>
      </div>
    </form>
  );
};

export default StepPickup;
