import { RiTruckLine } from "react-icons/ri";
import { FiCheckCircle, FiXCircle, FiClock, FiSearch, FiUser } from "react-icons/fi";
import { MdOutlineLocalShipping } from "react-icons/md";
import { LuPackage } from "react-icons/lu";
import { DELIVERY_STATUS_UI } from "../constants/app.constant";

const iconMap = {
  CREATED:          <LuPackage size={11} />,
  MATCHING:         <FiSearch size={11} />,
  PARTNER_SELECTED: <FiUser size={11} />,
  CONFIRMED:        <FiCheckCircle size={11} />,
  PICKUP:           <RiTruckLine size={11} />,
  IN_TRANSIT:       <MdOutlineLocalShipping size={11} />,
  DELIVERED:        <FiCheckCircle size={11} />,
  CANCELLED:        <FiXCircle size={11} />,
  FAILED:           <FiXCircle size={11} />,
  REJECTED:         <FiXCircle size={11} />,
  PENDING:          <FiClock size={11} />,
};

const cancelledStyle = "bg-red-100 text-red-600";

const BookingStatusBadge = ({ status }) => {
  if (!status && status !== 0) return <span className="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-500">—</span>;

  const key = String(status).toUpperCase().replace(/-/g, "_").replace(/ /g, "_");
  const config = DELIVERY_STATUS_UI[key];
  const badge  = key === "CANCELLED" ? cancelledStyle : (config?.badge || "bg-gray-100 text-gray-600");
  const label  = config?.label || String(status).replace(/_/g, " ").replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase());
  const icon   = iconMap[key] || <LuPackage size={11} />;

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${badge}`}>
      {icon}
      {label}
    </span>
  );
};

export default BookingStatusBadge;
