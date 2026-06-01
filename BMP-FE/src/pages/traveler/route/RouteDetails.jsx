import { useState } from "react";
import {
  Pen, Pause, Trash2, Play,
  MapPin, Calendar, Clock, Box,
  ArrowLeft, Check, X, ChevronRight,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import ApiService from "../../../core/services/api.service";
import { showToast } from "../../../core/utils/toast.util";
import AddressAutocomplete from "../../../core/common/AddressAutocomplete";
import RoutePathCard from "../../../components/traveler/RoutePathCard";
import VehicleDetailsCard from "../../../components/traveler/VehicleDetailsCard";
import TimePicker12h from "../../../components/common/TimePicker12h";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
// Must match ParcelTypeSelector.jsx exactly (value → label)
const PARCEL_TYPES = [
  { value: "documents",   label: "Documents" },
  { value: "electronics", label: "Electronics" },
  { value: "clothing",    label: "Clothing" },
  { value: "food",        label: "Food" },
  { value: "medicines",   label: "Medicines" },
  { value: "books",       label: "Books" },
  { value: "gifts",       label: "Gifts" },
  { value: "others",      label: "Others" },
];

const labelCls = "text-[10px] font-semibold tracking-widest text-gray-400 uppercase mb-1 block";
const inputCls = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white";

/** Formats HH:MM:SS or HH:MM to "8:00 AM" style */
const formatTime = (t) => {
  if (!t) return "—";
  const [h, m] = t.split(":").map(Number);
  if (isNaN(h) || isNaN(m)) return t;
  const period = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, "0")} ${period}`;
};

/** Formats YYYY-MM-DD to "15 Jan 2025" */
const formatDate = (d) => {
  if (!d || d === "—") return "—";
  const date = new Date(d);
  if (isNaN(date)) return d;
  return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

const formatAddress = (addr) => {
  if (!addr) return "—";
  if (addr.formatted_address) return addr.formatted_address;
  return [addr.house_no, addr.building_name, addr.street, addr.area, addr.landmark,
    addr.city, addr.district, addr.state, addr.country || "India", addr.pincode]
    .filter(Boolean).join(", ");
};

const DEV_MOCK = process.env.NODE_ENV !== "production" ? {
  id: "route-mock", origin: "Mumbai, Maharashtra", destination: "Pune, Maharashtra",
  status: "Active", createdOn: "Dec 15, 2024", totalEarnings: "₹8,500", totalDistance: "148 km",
  departureDate: "2024-12-31", departureTime: "08:00", recurringDays: ["Mon", "Wed", "Fri"],
  stops: [
    { type: "origin", location: "Mumbai, Maharashtra" },
    { type: "stop", location: "Lonavala" },
    { type: "destination", location: "Pune, Maharashtra" },
  ],
  acceptedDeliveries: [
    { parcelId: "BMP78950", name: "Amit Sharma", date: "Dec 30, 2024", price: "₹2500", status: "Upcoming" },
    { parcelId: "BMP78949", name: "Priya Patel", date: "Dec 28, 2024", price: "₹2200", status: "Completed" },
  ],
  performanceStats: { acceptedCount: 12, totalBids: "₹8000", avgBidAmount: "₹7500" },
  vehicleDetails: { vehicleType: "Car", vehicleNumber: "MH-02-AX-1234", maxWeightCapacity: "25 kg" },
  parcelPreferences: { acceptedTypes: ["Documents", "Electronics", "Clothes"], minimumEarning: "₹500" },
  photos: [],
} : null;

const RouteDetails = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const rawRoute = state?.route ?? DEV_MOCK;

  const initialRoute = rawRoute ? {
    ...rawRoute,
    stops: [
      { type: "origin", location: rawRoute.originAddress ? formatAddress(rawRoute.originAddress) : rawRoute.origin },
      { type: "destination", location: rawRoute.destAddress ? formatAddress(rawRoute.destAddress) : rawRoute.destination },
    ],
  } : null;

  const [routeData, setRouteData] = useState(initialRoute);
  const [isEditing, setIsEditing] = useState(false);
  const [editDraft, setEditDraft] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [originAddressChange, setOriginAddressChange] = useState(null);
  const [destAddressChange, setDestAddressChange] = useState(null);

  if (!routeData) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400">
        <div className="text-center">
          <p className="text-lg font-medium">Route not found</p>
          <button onClick={() => navigate(-1)} className="mt-4 text-blue-600 text-sm underline">Go back</button>
        </div>
      </div>
    );
  }

  const isCompleted = routeData.status === "Completed";
  const isPaused = routeData.status === "Paused";

  const startEditing = () => { setEditDraft(JSON.parse(JSON.stringify(routeData))); setOriginAddressChange(null); setDestAddressChange(null); setIsEditing(true); };
  const cancelEditing = () => { setEditDraft(null); setOriginAddressChange(null); setDestAddressChange(null); setIsEditing(false); };

  const saveEditing = async () => {
    setSaving(true);
    try {
      // Normalize time to HH:MM 24-hour format before saving
      const normalizeTime = (t) => {
        if (!t) return undefined;
        // If already HH:MM or HH:MM:SS 24-hour format, strip seconds
        const m24 = String(t).match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
        if (m24) return `${m24[1].padStart(2, "0")}:${m24[2]}`;
        // If 12-hour format e.g. "09:30 AM"
        const m12 = String(t).match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
        if (m12) {
          let h = parseInt(m12[1], 10);
          const mins = m12[2];
          const p = m12[3].toUpperCase();
          if (p === "AM" && h === 12) h = 0;
          if (p === "PM" && h !== 12) h += 12;
          return `${String(h).padStart(2, "0")}:${mins}`;
        }
        return undefined;
      };

      const payload = {
        // Only send departure_date if it has a value — never send null to avoid clearing it
        ...(editDraft.departureDate ? { departure_date: editDraft.departureDate } : {}),
        ...(normalizeTime(editDraft.departureTime) ? { departure_time: normalizeTime(editDraft.departureTime) } : {}),
        ...(editDraft.arrivalDate   ? { arrival_date:   editDraft.arrivalDate   } : {}),
        ...(normalizeTime(editDraft.arrivalTime) ? { arrival_time: normalizeTime(editDraft.arrivalTime) } : {}),
        vehicle_type: editDraft.vehicleDetails?.vehicleType?.toLowerCase() ?? editDraft.vehicle,
        vehicle_number: editDraft.vehicleDetails?.vehicleNumber ?? null,
        max_weight_kg: parseInt(editDraft.vehicleDetails?.maxWeightCapacity) || undefined,
        accepted_parcel_types: editDraft.parcelPreferences?.acceptedTypes?.map((t) => t.toLowerCase()),
        min_earning_per_delivery: parseFloat(String(editDraft.parcelPreferences?.minimumEarning ?? "").replace(/[^0-9.]/g, "")) || null,
        recurring_days: editDraft.recurringDays,
        transit_details: editDraft.transit_details ?? editDraft.transitDetails ?? null,
      };
      if (originAddressChange) payload.origin_address = originAddressChange;
      if (destAddressChange) payload.dest_address = destAddressChange;
      Object.keys(payload).forEach((k) => payload[k] === undefined && delete payload[k]);

      await ApiService.updateRoute(routeData.id, payload);
      setRouteData(editDraft);
      setEditDraft(null);
      setOriginAddressChange(null);
      setDestAddressChange(null);
      setIsEditing(false);
      showToast("Route updated successfully", "success");
    } catch (err) {
      showToast(err?.response?.data?.message || "Failed to update route", "error");
    } finally {
      setSaving(false);
    }
  };

  const setField = (path, value) => {
    setEditDraft((prev) => {
      const parts = path.split(".");
      if (parts.length === 1) return { ...prev, [parts[0]]: value };
      if (parts.length === 2) return { ...prev, [parts[0]]: { ...(prev[parts[0]] || {}), [parts[1]]: value } };
      if (parts.length === 3) return { ...prev, [parts[0]]: { ...(prev[parts[0]] || {}), [parts[1]]: { ...(prev[parts[0]]?.[parts[1]] || {}), [parts[2]]: value } } };
      return prev;
    });
  };

  const toggleRecurringDay = (day) =>
    setEditDraft((prev) => ({
      ...prev,
      recurringDays: prev.recurringDays.includes(day)
        ? prev.recurringDays.filter((d) => d !== day)
        : [...prev.recurringDays, day],
    }));

  const toggleParcelType = (value) =>
    setEditDraft((prev) => {
      const current = prev.parcelPreferences.acceptedTypes.map((t) => t.toLowerCase());
      const isSelected = current.includes(value);
      return {
        ...prev,
        parcelPreferences: {
          ...prev.parcelPreferences,
          acceptedTypes: isSelected
            ? current.filter((t) => t !== value)
            : [...current, value],
        },
      };
    });

  const updateStop = (index, value) =>
    setEditDraft((prev) => ({ ...prev, stops: prev.stops.map((s, i) => (i === index ? { ...s, location: value } : s)) }));

  const addStop = () =>
    setEditDraft((prev) => {
      const dest = prev.stops[prev.stops.length - 1];
      return { ...prev, stops: [...prev.stops.slice(0, -1), { type: "stop", location: "" }, dest] };
    });

  const removeStop = (index) =>
    setEditDraft((prev) => ({ ...prev, stops: prev.stops.filter((_, i) => i !== index) }));

  const handleTogglePause = async () => {
    const newStatus = routeData.statusRaw === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    try {
      await ApiService.updateRoute(routeData.id, { status: newStatus });
      setRouteData((prev) => ({ ...prev, statusRaw: newStatus, status: newStatus === "ACTIVE" ? "Active" : "Paused" }));
    } catch (err) {
      showToast(err?.response?.data?.message || "Failed to update route status", "error");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this route?")) return;
    setDeleting(true);
    try {
      await ApiService.deleteRoute(routeData.id);
      showToast("Route deleted successfully", "success");
      navigate(-1);
    } catch (err) {
      showToast(err?.response?.data?.message || "Failed to delete route", "error");
    } finally {
      setDeleting(false);
    }
  };

  const d = isEditing ? editDraft : routeData;

  return (
    <div className="min-h-screen bg-gray-100">

      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition" aria-label="Go back">
              <ArrowLeft className="text-gray-500 text-sm" />
            </button>
            <div>
              <h1 className="text-base font-semibold text-gray-900">Route Details</h1>
              <p className="text-xs text-gray-400">Complete information about your route</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {isEditing ? (
              <>
                <button onClick={saveEditing} disabled={saving} className="flex items-center gap-1.5 bg-green-600 text-white px-3 py-1.5 rounded-md text-xs font-medium hover:bg-green-700 transition disabled:opacity-60">
                  <Check size={10} /> {saving ? "Saving..." : "Save Changes"}
                </button>
                <button onClick={cancelEditing} className="flex items-center gap-1.5 border border-gray-300 text-gray-600 px-3 py-1.5 rounded-md text-xs font-medium hover:bg-gray-50 transition">
                  <X size={10} /> Cancel
                </button>
              </>
            ) : (
              <>
                <button onClick={startEditing} className="flex items-center gap-1.5 border border-gray-300 text-gray-600 px-3 py-1.5 rounded-md text-xs font-medium hover:bg-gray-50 transition">
                  <Pen size={10} /> Edit Route
                </button>
                {!isCompleted && (
                  <button onClick={handleTogglePause} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition
                    ${isPaused ? "border border-green-500 text-green-600 hover:bg-green-50" : "border border-orange-400 text-orange-500 hover:bg-orange-50"}`}>
                    {isPaused ? <><Play size={10} /> Resume Route</> : <><Pause size={10} /> Pause Route</>}
                  </button>
                )}
                <button onClick={handleDelete} disabled={deleting} className="flex items-center gap-1.5 border border-red-400 text-red-500 px-3 py-1.5 rounded-md text-xs font-medium hover:bg-red-50 transition disabled:opacity-60">
                  <Trash2 size={10} /> {deleting ? "Deleting..." : "Delete"}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {isEditing && (
        <div className="bg-blue-600 text-white text-xs text-center py-2 font-medium tracking-wide">
          Editing mode — make your changes below, then click Save Changes
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 space-y-5">

        {/* Route Banner */}
        <div className="bg-green-50 border border-green-200 rounded-xl px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 border-2 border-green-300 rounded-md flex items-center justify-center shrink-0">
              <Play className="text-green-600 text-xs" />
            </div>
            <div>
              {isEditing ? (
                <div className="flex items-center gap-2 flex-wrap">
                  <AddressAutocomplete value={d.origin} onChange={(val) => setField("origin", val)}
                    onSelect={(text, placeId) => { setField("origin", text); setOriginAddressChange({ address: text, place_id: placeId, city: "", state: "", pincode: "", country: "India" }); }}
                    placeholder="Origin" className="w-44" />
                  <span className="text-gray-400 font-bold">→</span>
                  <AddressAutocomplete value={d.destination} onChange={(val) => setField("destination", val)}
                    onSelect={(text, placeId) => { setField("destination", text); setDestAddressChange({ address: text, place_id: placeId, city: "", state: "", pincode: "", country: "India" }); }}
                    placeholder="Destination" className="w-44" />
                </div>
              ) : (
                <p className="font-bold text-gray-900 text-sm sm:text-base">
                  {d.stops?.[0]?.location} → {d.stops?.[d.stops.length - 1]?.location}
                </p>
              )}
              <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5">
                <p className="text-xs text-gray-500">Status: <span className="text-green-600 font-medium">{routeData.status}</span></p>
                {d.createdOn && <span className="text-xs text-gray-400">· Created on {d.createdOn}</span>}
              </div>
            </div>
          </div>
          <div className="sm:text-right">
            <p className="text-xs text-gray-400">Total Earnings</p>
            <p className="text-green-700 font-bold text-xl">{d.totalEarnings ?? "—"}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-7 gap-5">

          {/* LEFT COLUMN */}
          <div className="lg:col-span-4 space-y-5">
            <RoutePathCard d={d} isEditing={isEditing} setField={setField}
              setOriginAddressChange={setOriginAddressChange} setDestAddressChange={setDestAddressChange}
              updateStop={updateStop} addStop={addStop} removeStop={removeStop} />

            {/* Travel Schedule */}
            {(d.departureDate || d.departureTime || d.arrivalDate || d.arrivalTime) && (
              <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                <h2 className="font-semibold text-sm mb-4 flex items-center gap-2">
                  <Calendar size={14} className="text-blue-500" /> Travel Schedule
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-purple-50 border border-purple-100 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-7 h-7 bg-purple-500 rounded flex items-center justify-center">
                        <Calendar size={12} className="text-white" />
                      </div>
                      <label className={labelCls}>Departure Date</label>
                    </div>
                    {isEditing
                      ? <input type="date" className={inputCls} value={d.departureDate || ""} onChange={(e) => setField("departureDate", e.target.value)} />
                      : <p className="font-bold text-gray-800 text-sm">{formatDate(d.departureDate)}</p>}
                  </div>
                  <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-7 h-7 bg-blue-500 rounded flex items-center justify-center">
                        <Clock size={12} className="text-white" />
                      </div>
                      <label className={labelCls}>Departure Time</label>
                    </div>
                    {isEditing
                      ? <TimePicker12h value={d.departureTime || ""} onChange={(v) => setField("departureTime", v)} />
                      : <p className="font-bold text-gray-800 text-sm">{formatTime(d.departureTime)}</p>}
                  </div>
                  {(d.arrivalDate || isEditing) && (
                    <div className="bg-green-50 border border-green-100 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-7 h-7 bg-green-500 rounded flex items-center justify-center">
                          <Calendar size={12} className="text-white" />
                        </div>
                        <label className={labelCls}>Arrival Date</label>
                      </div>
                      {isEditing
                        ? <input type="date" className={inputCls} value={d.arrivalDate || ""} onChange={(e) => setField("arrivalDate", e.target.value)} />
                        : <p className="font-bold text-gray-800 text-sm">{formatDate(d.arrivalDate)}</p>}
                    </div>
                  )}
                  {(d.arrivalTime || isEditing) && (
                    <div className="bg-orange-50 border border-orange-100 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-7 h-7 bg-orange-500 rounded flex items-center justify-center">
                          <Clock size={12} className="text-white" />
                        </div>
                        <label className={labelCls}>Arrival Time</label>
                      </div>
                      {isEditing
                        ? <TimePicker12h value={d.arrivalTime || ""} onChange={(v) => setField("arrivalTime", v)} />
                        : <p className="font-bold text-gray-800 text-sm">{formatTime(d.arrivalTime)}</p>}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Recurring */}
            {(d.recurringDays?.length > 0 || isEditing) && (
              <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-5">
                <h2 className="font-semibold text-sm mb-3 flex items-center gap-2">
                  <Calendar className="text-orange-500" /> Recurring Route
                </h2>
                <div className="flex gap-2 flex-wrap">
                  {DAYS.map((day) => {
                    const active = d.recurringDays?.includes(day);
                    return (
                      <button key={day} disabled={!isEditing} onClick={() => isEditing && toggleRecurringDay(day)}
                        className={`px-3 py-1 rounded-md text-xs font-medium transition
                          ${active ? "bg-orange-500 text-white shadow-sm" : "bg-white border border-gray-200 text-gray-500"}
                          ${isEditing ? "cursor-pointer hover:scale-105" : "cursor-default"}`}>
                        {day}
                      </button>
                    );
                  })}
                </div>
                {isEditing && <p className="text-[10px] text-orange-500 mt-2">Tap days to toggle on / off</p>}
              </div>
            )}

            {/* Accepted Deliveries */}
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <h2 className="font-semibold text-sm mb-4 flex items-center gap-2">
                <Box className="text-purple-500" /> Accepted Deliveries ({d.acceptedDeliveries?.length ?? 0})
              </h2>
              {d.acceptedDeliveries?.length > 0 ? (
                <div className="space-y-3">
                  {d.acceptedDeliveries.map((del, i) => (
                    <div key={i} className="flex justify-between items-center border border-gray-100 rounded-lg p-3 hover:bg-gray-50 transition">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center shrink-0">
                          <Box className="text-purple-500 text-sm" />
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-gray-800">{del.parcelId}</p>
                          <p className="text-xs text-gray-400">{del.name} · {del.date}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-green-600 font-bold text-sm">{del.price}</p>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md
                          ${del.status === "Completed" ? "text-green-700 bg-green-100" : "text-blue-700 bg-blue-100"}`}>
                          {del.status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400">No deliveries accepted yet.</p>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="lg:col-span-3 space-y-5">

            <VehicleDetailsCard d={d} isEditing={isEditing} setField={setField} />

            {/* Parcel Preferences */}
            {d.parcelPreferences && (
              <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                <h2 className="font-semibold text-sm mb-4 flex items-center gap-2">
                  <Box className="text-purple-500" /> Parcel Preferences
                </h2>
                <label className={labelCls}>Accepted Types</label>
                {isEditing ? (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {PARCEL_TYPES.map(({ value, label }) => {
                      const selected = d.parcelPreferences?.acceptedTypes
                        ?.map((t) => t.toLowerCase()).includes(value) ?? false;
                      return (
                        <button key={value} onClick={() => toggleParcelType(value)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border-2 transition
                            ${selected ? "border-purple-400 bg-purple-50 text-purple-700" : "border-gray-200 bg-white text-gray-400 hover:border-purple-200"}`}>
                          {label}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {d.parcelPreferences.acceptedTypes?.map((value, i) => {
                      const label = PARCEL_TYPES.find((p) => p.value === value.toLowerCase())?.label ?? value;
                      return (
                        <span key={i} className="px-3 py-1.5 border-2 border-purple-100 bg-purple-50 text-purple-600 rounded-md text-xs font-medium">
                          {label}
                        </span>
                      );
                    })}
                  </div>
                )}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <label className={labelCls}>Minimum Earning Per Delivery</label>
                  {isEditing ? (
                    <input className={inputCls} value={d.parcelPreferences.minimumEarning ?? ""} placeholder="e.g. ₹500"
                      onChange={(e) => setField("parcelPreferences.minimumEarning", e.target.value)} />
                  ) : (
                    <p className="text-2xl font-bold text-green-600">{d.parcelPreferences.minimumEarning ?? "—"}</p>
                  )}
                </div>
              </div>
            )}

            {/* Photos */}
            {d.photos?.length > 0 && (
              <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                <h2 className="font-semibold text-sm mb-3 text-gray-700">Photos</h2>
                <div className="grid grid-cols-3 gap-3">
                  {d.photos.map((photo, i) => (
                    <div key={i}>
                      <p className="text-[10px] text-gray-400 mb-1">Photo {i + 1}</p>
                      <img src={photo} alt={`Route photo ${i + 1}`} className="rounded-lg h-24 object-cover w-full border border-gray-100" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RouteDetails;
