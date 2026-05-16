const Field = ({ label, error, helper, children }) => (
  <div className="flex flex-col gap-1">
    <label className="text-xs text-gray-500">{label}</label>
    {children}
    {error
      ? <p className="text-xs text-red-600">{error}</p>
      : helper && <p className="text-xs text-gray-400">{helper}</p>}
  </div>
);

const Input = ({ error, ...props }) => (
  <input
    {...props}
    className={`border rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white
      ${error ? "border-red-500" : "border-gray-300"}`}
  />
);

const Select = ({ error, children, ...props }) => (
  <select
    {...props}
    className={`border rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white
      ${error ? "border-red-500" : "border-gray-300"}`}
  >
    {children}
  </select>
);

const BUS_SERVICES = ["msrtc", "shivneri", "vrl", "goldmedal", "sai", "other"];
const BUS_LABELS = { msrtc: "MSRTC", shivneri: "Shivneri", vrl: "VRL Logistics", goldmedal: "Gold Medal", sai: "Sai Tours & Travels", other: "Other" };
const TRAIN_CLASSES = [
  { value: "ac1", label: "AC First (AC1)" },
  { value: "ac2", label: "AC Second (AC2)" },
  { value: "ac3", label: "AC Third (AC3)" },
  { value: "sleeper", label: "Sleeper" },
  { value: "general", label: "General" },
];
const WEIGHT_OPTIONS = ["1", "2", "3", "4", "5"];

export default function PublicTransportForm({ formData, errors, onChange }) {
  const { transportMode } = formData;

  return (
    <>
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-4 text-sm text-blue-800">
        🚌 <strong>Public Transport Mode</strong> – You can carry parcels as luggage. Provide service details below.
      </div>

      {/* BUS */}
      {transportMode === "bus" && (
        <div className="mb-4">
          <p className="text-sm font-semibold text-blue-700 mb-3">🚌 Bus Details</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Bus Service Name *" error={errors.busServiceName}>
              <Select value={formData.busServiceName} onChange={(e) => onChange("busServiceName", e.target.value)} error={!!errors.busServiceName}>
                <option value="">Select a service</option>
                {BUS_SERVICES.map((s) => <option key={s} value={s}>{BUS_LABELS[s]}</option>)}
              </Select>
            </Field>
            <Field label="Bus Number / Route Number" error={errors.busNumber} helper="(Optional - you'll know it at the bus stop)">
              <Input placeholder="e.g. 45, 102-A" value={formData.busNumber} onChange={(e) => onChange("busNumber", e.target.value)} error={!!errors.busNumber} />
            </Field>
          </div>
        </div>
      )}

      {/* TRAIN */}
      {transportMode === "train" && (
        <div className="mb-4">
          <p className="text-sm font-semibold text-red-700 mb-3">🚂 Train Details</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
            <Field label="Train Number *" error={errors.trainNumber} helper="5-digit train number">
              <Input
                placeholder="e.g. 12345"
                value={formData.trainNumber}
                onChange={(e) => onChange("trainNumber", e.target.value.replace(/\D/g, "").slice(0, 5))}
                maxLength={5}
                error={!!errors.trainNumber}
              />
            </Field>
            <Field label="Train Name *" error={errors.trainName}>
              <Input placeholder="e.g. Rajdhani Express" value={formData.trainName} onChange={(e) => onChange("trainName", e.target.value)} error={!!errors.trainName} />
            </Field>
            <Field label="Class Type *" error={errors.classType}>
              <Select value={formData.classType} onChange={(e) => onChange("classType", e.target.value)} error={!!errors.classType}>
                <option value="">Select class</option>
                {TRAIN_CLASSES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </Select>
            </Field>
            <div className="flex items-center gap-3 pt-4">
              <p className="text-sm font-medium">Have Reservation?</p>
              <button
                type="button"
                onClick={() => onChange("hasReservation", !formData.hasReservation)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none
                  ${formData.hasReservation ? "bg-blue-600" : "bg-gray-300"}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform
                  ${formData.hasReservation ? "translate-x-6" : "translate-x-1"}`} />
              </button>
              <span className="text-sm text-gray-500">{formData.hasReservation ? "Yes" : "No"}</span>
            </div>

            {formData.hasReservation && (
              <>
                <Field label="PNR Number *" error={errors.pnrNumber} helper="10-digit PNR">
                  <Input
                    placeholder="e.g. 9876543210"
                    value={formData.pnrNumber}
                    onChange={(e) => onChange("pnrNumber", e.target.value.replace(/\D/g, "").slice(0, 10))}
                    maxLength={10}
                    error={!!errors.pnrNumber}
                  />
                </Field>
                <Field label="Seat Numbers *" error={errors.seatNumbers} helper="e.g. 32A, 32B or 45">
                  <Input placeholder="e.g. 32A, 32B" value={formData.seatNumbers} onChange={(e) => onChange("seatNumbers", e.target.value)} error={!!errors.seatNumbers} />
                </Field>
              </>
            )}
          </div>
        </div>
      )}

      {/* MAX WEIGHT */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Max Weight (kg) *" error={errors.maxWeightKg} helper="Select maximum luggage weight">
          <Select value={formData.maxWeightKg} onChange={(e) => onChange("maxWeightKg", e.target.value)} error={!!errors.maxWeightKg}>
            <option value="">Select weight</option>
            {WEIGHT_OPTIONS.map((w) => <option key={w} value={w}>{w} kg</option>)}
          </Select>
        </Field>
      </div>
    </>
  );
}
