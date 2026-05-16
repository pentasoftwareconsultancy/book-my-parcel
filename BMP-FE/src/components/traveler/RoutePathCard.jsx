import { FaLocationArrow, FaMapMarkerAlt, FaTimes } from "react-icons/fa";
import AddressAutocomplete from "../../core/common/AddressAutocomplete";

export default function RoutePathCard({ d, isEditing, setField, setOriginAddressChange, setDestAddressChange, updateStop, addStop, removeStop }) {
  const makeAddrObj = (text, placeId) => ({ address: text, place_id: placeId, city: "", state: "", pincode: "", country: "India" });

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-sm flex items-center gap-2">
          <FaLocationArrow className="text-purple-500" /> Route Path
        </h2>
        {isEditing && (
          <button onClick={addStop} className="flex items-center gap-1 text-xs text-blue-600 border border-blue-200 px-2 py-1 rounded-md hover:bg-blue-50 transition">
            + Add Stop
          </button>
        )}
      </div>

      {d.stops?.length > 0 ? (
        <div className="space-y-3">
          {d.stops.map((stop, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className={`shrink-0 flex items-center justify-center rounded-full border-2
                ${stop.type === "origin" ? "w-9 h-9 bg-green-50 border-green-300"
                  : stop.type === "destination" ? "w-9 h-9 bg-red-50 border-red-300"
                  : "w-7 h-7 bg-blue-50 border-blue-300"}`}>
                {stop.type === "stop"
                  ? <span className="w-2.5 h-2.5 bg-blue-500 rounded-full" />
                  : <FaMapMarkerAlt className={`text-xs ${stop.type === "origin" ? "text-green-600" : "text-red-500"}`} />}
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-semibold tracking-widest text-gray-400 uppercase">
                  {stop.type === "origin" ? "Origin" : stop.type === "destination" ? "Destination" : `Stop ${index}`}
                </p>
                {isEditing ? (
                  <div className="flex items-center gap-2 mt-0.5">
                    <AddressAutocomplete
                      value={stop.location}
                      onChange={(val) => updateStop(index, val)}
                      onSelect={(text, placeId) => {
                        updateStop(index, text);
                        const obj = makeAddrObj(text, placeId);
                        if (stop.type === "origin") { setField("origin", text); setOriginAddressChange(obj); }
                        else if (stop.type === "destination") { setField("destination", text); setDestAddressChange(obj); }
                      }}
                      placeholder={stop.type === "origin" ? "Origin city" : stop.type === "destination" ? "Destination city" : "Stop location"}
                      className="flex-1"
                    />
                    {stop.type === "stop" && (
                      <button onClick={() => removeStop(index)} aria-label="Remove stop" className="text-red-400 hover:text-red-600 shrink-0 transition">
                        <FaTimes size={12} />
                      </button>
                    )}
                  </div>
                ) : (
                  <p className="text-sm font-semibold text-gray-800">{stop.location}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {[
            { type: "origin", color: "green", field: "origin", value: d.stops?.[0]?.location || d.origin },
            { type: "destination", color: "red", field: "destination", value: d.destination },
          ].map(({ type, color, field, value }) => (
            <div key={type} className="flex items-center gap-3">
              <div className={`w-9 h-9 bg-${color}-50 border-2 border-${color}-300 rounded-full flex items-center justify-center shrink-0`}>
                <FaMapMarkerAlt className={`text-xs text-${color}-${color === "green" ? "600" : "500"}`} />
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-semibold tracking-widest text-gray-400 uppercase">{type}</p>
                {isEditing ? (
                  <AddressAutocomplete
                    value={d[field]}
                    onChange={(val) => setField(field, val)}
                    onSelect={(text, placeId) => {
                      setField(field, text);
                      const obj = { address: text, place_id: placeId, city: "", state: "", pincode: "", country: "India" };
                      if (type === "origin") setOriginAddressChange(obj);
                      else setDestAddressChange(obj);
                    }}
                    className="mt-0.5"
                    placeholder={`${type} city`}
                  />
                ) : (
                  <p className="text-sm font-semibold text-gray-800">{value}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {d.totalDistance && (
        <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <FaLocationArrow className="text-purple-400 text-xs" /> Total Distance
          </div>
          {isEditing ? (
            <input
              className="border border-gray-200 rounded-lg px-2 py-1 text-sm w-28 text-right focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={d.totalDistance}
              onChange={(e) => setField("totalDistance", e.target.value)}
            />
          ) : (
            <span className="text-purple-600 font-bold text-sm">{d.totalDistance}</span>
          )}
        </div>
      )}
    </div>
  );
}
