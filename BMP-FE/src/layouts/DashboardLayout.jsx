// src/layouts/DashboardLayout.jsx
import React, { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import DashboardSidebar from "../components/DashboardSidebar";
import Navbar from "../components/PublicHeader";
import RoutePath from "../core/constants/routes.constant";
import { TravelerFooter } from "../components/PublicFooter";

const NO_SIDEBAR_ROUTES = [
  RoutePath.USER_REQUEST_FORM,
  RoutePath.USER_PARCEL_DETAILS,
  RoutePath.USER_BOOKING_CANCLE,
  RoutePath.USER_NOTIFICATIONS,
  RoutePath.USER_PROFILE,
  RoutePath.TRAVELER_PROFILE,
];

const DashboardLayout = ({ role }) => {
  const location  = useLocation();
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  const [expanded, setExpanded] = useState(() => window.innerWidth >= 768);

  useEffect(() => {
    const fn = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      // when resizing to desktop, auto-open; to mobile, auto-close
      setExpanded(!mobile);
    };
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);

  const hideSidebar = NO_SIDEBAR_ROUTES.some((route) =>
    location.pathname.startsWith(route)
  );

  // on mobile, sidebar is overlay when expanded so no extra margin; collapsed strip still takes 56px
  const contentMargin = hideSidebar ? 0 : isMobile ? 56 : expanded ? 240 : 56;

  return (
    <div className="flex min-h-screen w-full bg-slate-50 overflow-x-hidden">
      <Navbar />
      {!hideSidebar && (
        <DashboardSidebar
          role={role}
          expanded={expanded}
          isMobile={isMobile}
          onToggle={() => setExpanded(p => !p)}
          onClose={() => setExpanded(false)}
        />
      )}

      <div
        className="flex-1 min-w-0 flex flex-col transition-all duration-300"
        style={{ marginLeft: contentMargin }}
      >
        <main
          className="pt-16 pb-8 w-full overflow-x-hidden"
          style={{ minHeight: "calc(100vh - 64px)", padding: "64px 20px 32px 4px" }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export const withDashboardLayout = (WrappedComponent, role) => {
  return (props) => (
    <DashboardLayout role={role}>
      <WrappedComponent {...props} />
    </DashboardLayout>
  );
};

export default DashboardLayout;