import DescriptionIcon from "@mui/icons-material/Description";
import PhoneIphoneIcon from "@mui/icons-material/PhoneIphone";
import CheckroomIcon from "@mui/icons-material/Checkroom";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import MedicationIcon from "@mui/icons-material/Medication";
import Inventory2Icon from "@mui/icons-material/Inventory2";

const PARCELS = [
  { label: "Documents",   value: "documents",   icon: <DescriptionIcon /> },
  { label: "Electronics", value: "electronics", icon: <PhoneIphoneIcon /> },
  { label: "Clothing",    value: "clothing",    icon: <CheckroomIcon /> },
  { label: "Food",        value: "food",        icon: <RestaurantIcon /> },
  { label: "Medicines",   value: "medicines",   icon: <MedicationIcon /> },
  { label: "Books",       value: "books",       icon: <Inventory2Icon /> },
  { label: "Gifts",       value: "gifts",       icon: <Inventory2Icon /> },
  { label: "Others",      value: "others",      icon: <Inventory2Icon /> },
];

export default function ParcelTypeSelector({ selected, onToggle, error }) {
  return (
    <div className="mb-4">
      <p className="text-sm text-gray-500 mb-3">Accepted Parcel Types</p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-2">
        {PARCELS.map((p) => {
          const active = selected.includes(p.value);
          return (
            <button
              key={p.value}
              type="button"
              onClick={() => onToggle(p.value)}
              className={`border rounded-xl p-3 text-center cursor-pointer transition-all
                ${active ? "border-green-500 bg-green-50" : "border-gray-200 bg-white hover:border-green-300"}`}
            >
              <div className={`text-3xl mb-1 flex justify-center ${active ? "text-green-600" : "text-slate-500"}`}>
                {p.icon}
              </div>
              <p className="font-semibold text-sm">{p.label}</p>
              {active && <p className="text-green-600 text-xs mt-0.5">✓</p>}
            </button>
          );
        })}
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
