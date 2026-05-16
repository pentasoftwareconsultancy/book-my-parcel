import TextInput from "../../core/common/CommonUi";
import UploadImage from "../../core/common/UploadImage";
import { SIZE_OPTIONS } from "../../core/hooks/useStepPickup";

const PARCEL_TYPES = ["Documents", "Electronics", "Clothing", "Food", "Medicine", "Fragile", "Books", "Gifts", "Other"];

const PackageSection = ({ data, updateFields, selectedSize, setSelectedSize }) => (
  <div className="px-6 py-6 bg-white border shadow-2xl rounded-3xl border-primary/20">
    <h3 className="mb-4 text-xl font-semibold text-primary">Package Details</h3>

    {/* Size selector */}
    <p className="mb-2 text-xs font-semibold text-gray-700">Select Package Size</p>
    <div className="grid gap-3 mb-4 md:grid-cols-4">
      {SIZE_OPTIONS.map((opt) => {
        const active = data.packageSize === opt.id;
        return (
          <button key={opt.id} type="button"
            onClick={() => { setSelectedSize(opt); updateFields({ packageSize: opt.id, parcelWeight: opt.min }); }}
            className={`flex h-28 flex-col justify-between rounded-2xl border px-4 py-3 text-left transition ${active ? "border-primary shadow-[0_0_0_2px_rgba(31,42,255,0.3)]" : "border-gray-200 hover:border-primary/60"}`}
          >
            <div>
              <p className={`text-sm font-semibold ${active ? "text-primary" : "text-gray-900"}`}>{opt.title}</p>
              <p className="mt-0.5 text-[11px] text-gray-500">{opt.desc}</p>
            </div>
            <p className="text-[11px] text-gray-400">{opt.min} - {opt.max} kg</p>
          </button>
        );
      })}
    </div>

    {/* Weight + Dimensions */}
    <p className="mb-2 text-xs font-semibold text-gray-700">Parcel Details</p>
    <div className="grid gap-4 md:grid-cols-[1fr,2fr] mb-4">
      <div>
        <p className="mb-1 text-xs font-medium text-gray-600">
          Weight (kg)
          {selectedSize && <span className="ml-2 text-[11px] text-blue-600">({selectedSize.min} – {selectedSize.max} kg)</span>}
        </p>
        {!selectedSize ? (
          <input disabled placeholder="Select parcel size first" className="w-full px-3 py-2 text-base bg-gray-100 border rounded-md" />
        ) : (
          <select value={data.parcelWeight} onChange={(e) => updateFields({ parcelWeight: Number(e.target.value) })} className="w-full px-3 py-2 text-sm border rounded-md">
            {Array.from({ length: selectedSize.max - selectedSize.min + 1 }, (_, i) => selectedSize.min + i).map((w) => (
              <option key={w} value={w}>{w} kg</option>
            ))}
          </select>
        )}
      </div>
      <div>
        <p className="mb-1 text-xs font-medium text-gray-600">Dimensions (cm)</p>
        <div className="grid grid-cols-3 gap-3">
          <TextInput name="parcelLength" value={data.parcelLength} type="number" onChange={(e) => updateFields({ parcelLength: e.target.value })} placeholder="Length" />
          <TextInput name="parcelWidth"  value={data.parcelWidth}  type="number" onChange={(e) => updateFields({ parcelWidth:  e.target.value })} placeholder="Width" />
          <TextInput name="parcelHeight" value={data.parcelHeight} type="number" onChange={(e) => updateFields({ parcelHeight: e.target.value })} placeholder="Height" />
        </div>
      </div>
    </div>

    <TextInput label="Package Description (optional)" name="parcelContents" value={data.parcelContents}
      onChange={(e) => updateFields({ parcelContents: e.target.value })}
      placeholder="Describe your package contents" className="h-20 mb-4 text-sm text-black" />

    {/* Photos + Value + Type */}
    <p className="mb-2 text-xs font-semibold text-gray-700">Parcel Photos</p>
    <div className="grid gap-3 mb-4 md:grid-cols-4">
      {[1, 2, 3].map((i) => (
        <UploadImage key={i} label={`Parcel photo ${i}`} value={data[`parcelPhoto${i}`]}
          onChange={(file) => updateFields({ [`parcelPhoto${i}`]: file })} />
      ))}
      <div className="space-y-3">
        <TextInput label="Parcel Value (₹)" name="parcelValue" type="number" value={data.parcelValue}
          onChange={(e) => updateFields({ parcelValue: e.target.value })} />
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Parcel Type</label>
          <select name="parcelType" value={data.parcelType} onChange={(e) => updateFields({ parcelType: e.target.value })}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500">
            <option value="">Select type</option>
            {PARCEL_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>
    </div>

    <TextInput label="Additional Note" name="parcelNotes" value={data.parcelNotes}
      onChange={(e) => updateFields({ parcelNotes: e.target.value })}
      placeholder="Write note as per your preferences" className="h-16 text-sm" />
  </div>
);

export default PackageSection;
