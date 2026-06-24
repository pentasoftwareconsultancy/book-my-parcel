// src/components/DashboardSidebar.jsx
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import TrackChanges from "@mui/icons-material/TrackChanges";
import People from "@mui/icons-material/People";
import Assignment from "@mui/icons-material/Assignment";
import Gavel from "@mui/icons-material/Gavel";
import AccountBox from "@mui/icons-material/AccountBox";
import Dashboard from "@mui/icons-material/Dashboard";
import BookOnline from "@mui/icons-material/BookOnline";
import PaymentsIcon from "@mui/icons-material/Payments";
import ReportProblem from "@mui/icons-material/ReportProblem";
import Settings from "@mui/icons-material/Settings";
import { Package, Truck, CheckCircle, XCircle, ChevronRight, X } from "lucide-react";
import RoutePath from "../core/constants/routes.constant";

// ─── Menu config ─────────────────────────────────────────────────────────────
const menuItems = {
  USER: [
    { text: "All Order",  icon: <Package size={16} />,     path: RoutePath.USER_ALL_ORDERS },
    { text: "Active",     icon: <Truck size={16} />,        path: RoutePath.USER_ACTIVE },
    { text: "Completed",  icon: <CheckCircle size={16} />,  path: RoutePath.USER_COMPLETED },
    { text: "Cancelled",  icon: <XCircle size={16} />,      path: RoutePath.USER_CANCELLED },
  ],
  TRAVELER: [
    { text: "All deliveries",     icon: <Dashboard fontSize="small" />,    path: RoutePath.TRAVELER_DASHBOARD },
    { text: "Available requests", icon: <Assignment fontSize="small" />,   path: RoutePath.TRAVELER_AVAILABLE_REQUEST },
    { text: "Active deliveries",  icon: <TrackChanges fontSize="small" />, path: RoutePath.TRAVELER_DELIVERIES },
    { text: "Completed",          icon: <CheckCircle size={16} />,         path: RoutePath.TRAVELER_COMPLETED },
    { text: "Cancelled",          icon: <XCircle size={16} />,             path: RoutePath.TRAVELER_CANCELLED },
  ],
  ADMIN: [
    { text: "Overview",        icon: <Dashboard fontSize="small" />,     path: RoutePath.ADMIN_OVERVIEW },
    { text: "User Management", icon: <People fontSize="small" />,        path: RoutePath.ADMIN_USERMANAGEMENT },
    { text: "Traveler",        icon: <Assignment fontSize="small" />,    path: RoutePath.ADMIN_TRAVELER },
    { text: "Bookings",        icon: <BookOnline fontSize="small" />,    path: RoutePath.ADMIN_BOOKINGS },
    { text: "Payments",        icon: <PaymentsIcon fontSize="small" />,  path: RoutePath.ADMIN_PAYMENTS },
    { text: "Disputes",        icon: <ReportProblem fontSize="small" />, path: RoutePath.ADMIN_DISPUTES },
    { text: "Setting",         icon: <Settings fontSize="small" />,      path: RoutePath.ADMIN_SETTINGS },
  ],
};

const STRIP_W = 56;
const FULL_W  = 240;

const DashboardSidebar = ({ role, expanded, isMobile, onToggle, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const menuList = menuItems[role] || [];

  const [tooltipIndex, setTooltipIndex] = useState(null);

  // auto-close on route change on mobile
  useEffect(() => {
    if (isMobile) onClose();
  }, [location.pathname]);

  // lock body scroll when mobile overlay is open
  useEffect(() => {
    if (isMobile) document.body.style.overflow = expanded ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [expanded, isMobile]);

  const isActive = (path) => location.pathname === path;

  const handleNav = (path) => navigate(path);

  return (
    <>
      {isMobile && (
        <div
          className={`fixed inset-0 z-30 bg-black/40 transition-opacity duration-300 ${
            expanded ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* ── Sidebar panel ── */}
      <aside
        style={{ width: isMobile ? (expanded ? FULL_W : STRIP_W) : expanded ? FULL_W : STRIP_W }}
        className="
          fixed left-0 top-16 z-40 h-[calc(100vh-64px)]
          bg-white border-r border-slate-200 shadow-md
          flex flex-col overflow-visible
          transition-all duration-300 ease-in-out
        "
      >
        {/* ══ MENU ══ */}
        <nav aria-label="Dashboard navigation" className={`flex-1 overflow-y-auto overflow-x-hidden pt-3 pb-3 ${ expanded ? "" : "flex flex-col items-center gap-3" }`}>
          {expanded ? (
            <ul className="space-y-1 px-3">
              {/* Close button as first row */}
              <li>
                <button
                  type="button"
                  onClick={onToggle}
                  className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-slate-700 hover:bg-blue-50 transition-all duration-150"
                >
                  <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-150">
                    <X size={16} />
                  </span>
                  <span className="whitespace-nowrap text-sm font-medium text-slate-700">Close</span>
                </button>
              </li>
              {menuList.map((item) => {
                const active = isActive(item.path);
                return (
                  <li key={item.text}>
                    <button
                      type="button"
                      onClick={() => handleNav(item.path)}
                      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-150 ${
                        active ? "bg-blue-600 text-white" : "text-slate-700 hover:bg-blue-50"
                      }`}
                      aria-current={active ? "page" : undefined}
                    >
                      <span className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full transition-colors duration-150 ${
                        active ? "bg-white/20 text-white" : "bg-blue-50 text-blue-600"
                      }`}>
                        {item.icon}
                      </span>
                      <span className="whitespace-nowrap text-sm font-medium">{item.text}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <>
              {/* Toggle as first icon row when collapsed */}
              <div className="relative w-full flex justify-center">
                <button
                  type="button"
                  onClick={onToggle}
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all duration-150"
                  aria-label="Expand sidebar"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
              {menuList.map((item, index) => {
              const active      = isActive(item.path);
              const showTooltip = tooltipIndex === index;
              return (
                <div key={item.text} className="relative w-full flex justify-center">
                  <button
                    type="button"
                    onClick={() => handleNav(item.path)}
                    onMouseEnter={() => setTooltipIndex(index)}
                    onMouseLeave={() => setTooltipIndex(null)}
                    className={`relative flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-150 ${
                      active ? "bg-blue-600 text-white shadow-sm" : "bg-blue-50 text-blue-600 hover:bg-blue-100"
                    }`}
                    aria-label={item.text}
                  >
                    {item.icon}
                  </button>
                  {showTooltip && (
                    <div className="pointer-events-none absolute left-full top-1/2 z-50 ml-4 -translate-y-1/2 flex items-center gap-1.5 whitespace-nowrap rounded-lg bg-gray-900 px-2.5 py-1.5 text-xs font-medium text-white shadow-lg">
                      <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900" />
                      {item.text}
                    </div>
                  )}
                </div>
              );
            })}
            </>
          )}
        </nav>

      </aside>
    </>
  );
};

export default DashboardSidebar;