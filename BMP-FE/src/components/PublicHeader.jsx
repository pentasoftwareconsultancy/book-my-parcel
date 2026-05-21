// src/components/PublicHeader.jsx
import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout, logoutThunk } from "../store/slices/authSlice";
import { Send, Bell, User, MapPin, Search, Check, ChevronRight, ChevronDown, Truck, IndianRupee, Package } from "lucide-react";
import RoutePath from "../core/constants/routes.constant";
import logo1 from "../assets/logo1.png";
import { useNotifications } from "../core/hooks/useNotification";

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  const notifRole = isAuthenticated
    ? (user?.activeRole === "TRAVELLER" ? "traveller"
      : user?.activeRole === "ADMIN" ? "admin"
        : "user")
    : null;
  const { unreadCount } = useNotifications(notifRole);

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const fn = () => setIsMobile(window.innerWidth < 640);
    fn();
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);

  const [open, setOpen] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [selectedCity, setSelectedCity] = useState("Pune");
  const [tooltip, setTooltip] = useState(null);

  const roles = user?.roles || [];
  const dropdownRef = useRef(null);
  const location = useLocation();

  const isOnHomepage = location.pathname === "/" || location.pathname === RoutePath.PUBLIC_HOME;
  const showTextButtons = isOnHomepage && !isMobile;

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleNotificationRedirect = () => {
    const activeRole = user?.activeRole;
    if (activeRole === "ADMIN") navigate(RoutePath.ADMIN_NOTIFICATIONS);
    else if (activeRole === "TRAVELLER") navigate(RoutePath.TRAVELLER_NOTIFICATIONS);
    else navigate(RoutePath.USER_NOTIFICATIONS);
  };

  const handleDashboardRedirect = () => {
    const activeRole = user?.activeRole;
    if (activeRole === "TRAVELLER") navigate(RoutePath.TRAVELER_DASHBOARD);
    else if (activeRole === "INDIVIDUAL") navigate(RoutePath.USER_ALL_ORDERS);
    else if (activeRole === "ADMIN") navigate(RoutePath.ADMIN_BASE);
    else navigate(RoutePath.PUBLIC_HOME);
    setOpen(false);
  };

  const handleProfileRedirect = () => {
    const activeRole = user?.activeRole;
    if (activeRole === "TRAVELLER") navigate(RoutePath.TRAVELER_PROFILE);
    else if (activeRole === "ADMIN") navigate(RoutePath.ADMIN_PROFILE);
    else navigate(RoutePath.USER_PROFILE);
    setOpen(false);
  };

  const handleLogout = () => {
    dispatch(logoutThunk());
    setOpen(false);
    navigate(RoutePath.PUBLIC_HOME);
  };

  // ── Reusable user pill button + dropdown ──
  const UserMenuPill = () => (
    <div ref={dropdownRef} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen(!open)}
        aria-label="User menu"
        style={{
          display: "flex", alignItems: "center", gap: 7,
          height: 34, padding: "0 10px 0 8px",
          background: "transparent", border: "1px solid #2563eb",
          borderRadius: 20, cursor: "pointer", flexShrink: 0,
          transition: "background 0.15s",
        }}
        onMouseEnter={e => { e.currentTarget.style.background = "#eff6ff"; setTooltip("user"); }}
        onMouseLeave={e => { e.currentTarget.style.background = "transparent"; setTooltip(null); }}
      >
        {/* Avatar circle */}
        <div style={{
          width: 24, height: 24, borderRadius: "50%",
          background: "#2563eb", color: "#fff",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 11, fontWeight: 700, flexShrink: 0,
        }}>
          {user?.name?.charAt(0)?.toUpperCase() || "U"}
        </div>

        {/* Name + role — desktop only */}
        <span className="bmp-desktop-only" style={{ flexDirection: "column", alignItems: "flex-start", gap: 0 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: "#111827", lineHeight: 1.2, whiteSpace: "nowrap", maxWidth: 110, overflow: "hidden", textOverflow: "ellipsis" }}>
            {user?.name?.split(" ")[0] || "Account"}
          </span>
          <span style={{
            fontSize: 10, fontWeight: 500,
            color: user?.activeRole === "TRAVELLER" ? "#1d4ed8"
              : user?.activeRole === "ADMIN" ? "#92400e"
                : "#166534",
          }}>
            {user?.activeRole === "TRAVELLER" ? "Traveller"
              : user?.activeRole === "ADMIN" ? "Admin"
                : "Individual"}
          </span>
        </span>

        <ChevronDown size={14} style={{ color: "#6b7280", flexShrink: 0 }} />
      </button>

      {/* Dropdown */}
      {open && (
        <div style={{ position: "absolute", right: 0, top: "calc(100% + 8px)", width: 192, background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, boxShadow: "0 10px 25px rgba(0,0,0,.10)", overflow: "hidden", zIndex: 50 }}>
          <div style={{ padding: "10px 16px 6px", borderBottom: "1px solid #f3f4f6" }}>
            <p style={{ fontSize: 11, color: "#6b7280", marginBottom: 2 }}>Signed in as</p>
            <span style={{
              display: "inline-block", fontSize: 11, fontWeight: 700,
              padding: "2px 8px", borderRadius: 20,
              background: user?.activeRole === "TRAVELLER" ? "#dbeafe" : user?.activeRole === "ADMIN" ? "#fef3c7" : "#dcfce7",
              color: user?.activeRole === "TRAVELLER" ? "#1d4ed8" : user?.activeRole === "ADMIN" ? "#92400e" : "#166534",
            }}>
              {user?.activeRole === "TRAVELLER" ? "Traveller" : user?.activeRole === "ADMIN" ? "Admin" : "Individual"}
            </span>
          </div>
          {[
            { label: "Profile", action: handleProfileRedirect },
            { label: "Go to Dashboard", action: handleDashboardRedirect },
          ].map(({ label, action }) => (
            <button key={label} onClick={action}
              style={{ display: "block", width: "100%", padding: "10px 16px", fontSize: 14, fontWeight: 600, textAlign: "left", color: "#374151", background: "transparent", border: "none", cursor: "pointer" }}
              onMouseEnter={e => e.currentTarget.style.background = "#f9fafb"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
              {label}
            </button>
          ))}
          <hr style={{ borderColor: "#f3f4f6", margin: 0 }} />
          <button onClick={handleLogout}
            style={{ display: "block", width: "100%", padding: "10px 16px", fontSize: 14, fontWeight: 600, textAlign: "left", color: "#dc2626", background: "transparent", border: "none", cursor: "pointer" }}
            onMouseEnter={e => e.currentTarget.style.background = "#fef2f2"}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
            Logout
          </button>
        </div>
      )}
    </div>
  );

  return (
    <>
      <style>{`
        @keyframes bmp-marquee {
          0%   { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        .bmp-marquee {
          display: flex;
          white-space: nowrap;
          animation: bmp-marquee 20s linear infinite;
        }

        .bmp-btn {
          background: transparent;
          color: #2563eb;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          position: relative;
          padding: 4px;
          box-sizing: border-box;
          transition: color 0.15s;
        }
        .bmp-btn:hover { color: #1d4ed8; }
        .bmp-btn svg { width: 18px; height: 18px; }
        @media (min-width: 640px) {
          .bmp-btn svg { width: 22px; height: 22px; }
        }

        .bmp-btn-bell svg { width: 22px; height: 22px; }
        @media (min-width: 640px) {
          .bmp-btn-bell svg { width: 26px; height: 26px; }
        }

        .bmp-badge {
          position: absolute;
          top: 0px; right: 0px;
          width: 13px; height: 13px;
          border-radius: 50%;
          background: #ef4444;
          color: #fff;
          font-size: 7px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          pointer-events: none;
          line-height: 1;
        }
        @media (min-width: 640px) {
          .bmp-badge { width: 15px; height: 15px; font-size: 9px; top: 1px; right: 1px; }
        }

        .bmp-tip {
          position: absolute;
          top: calc(100% + 5px);
          left: 50%;
          transform: translateX(-50%);
          background: #111827;
          color: #fff;
          font-size: 10px;
          padding: 3px 7px;
          border-radius: 4px;
          white-space: nowrap;
          z-index: 99;
          pointer-events: none;
        }

        .bmp-group { display: flex; align-items: center; gap: 5px; }
        @media (min-width: 640px) { .bmp-group { gap: 10px; } }

        .bmp-bar { display: flex; align-items: center; justify-content: space-between; height: 56px; box-sizing: border-box; }
        @media (min-width: 640px) { .bmp-bar { height: 64px; } }
        .bmp-bar-pub { height: 60px; box-sizing: border-box; }
        @media (min-width: 640px) { .bmp-bar-pub { height: 80px; } }

        .bmp-logo { height: 26px; width: auto; }
        @media (min-width: 640px) { .bmp-logo { height: 36px; } }
        .bmp-logo-auth { height: 32px; width: auto; }
        @media (min-width: 640px) { .bmp-logo-auth { height: 44px; } }

        .bmp-mobile-only { display: flex; }
        .bmp-desktop-only { display: none; }
        @media (min-width: 640px) {
          .bmp-mobile-only  { display: none; }
          .bmp-desktop-only { display: flex; }
        }
      `}</style>

      {/* ── Marquee ── */}
      {!isAuthenticated && (
        <div style={{ overflow: "hidden", background: "#2563eb", color: "#fff" }}>
          <div className="bmp-marquee" style={{ alignItems: "center", gap: 24, padding: "6px 16px", fontSize: 12, fontWeight: 500 }}>
            {[
              [Truck, "Fast & Secure Parcel Delivery Across Cities"],
              [IndianRupee, "Save More – Affordable Traveler Shipping"],
              [Package, "Send Parcels Easily With Trusted Travelers"],
            ].map(([Icon, text], i) => (
              <span key={i} style={{ display: "flex", alignItems: "center", gap: 8, whiteSpace: "nowrap" }}>
                <Icon style={{ color: "#f87171" }} /> {text}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ── Navbar ── */}
      <header style={{
        background: "#fff",
        boxShadow: "0 1px 6px rgba(0,0,0,.08)",
        zIndex: 50,
        ...(isAuthenticated
          ? { position: "fixed", top: 0, left: 0, right: 0, borderBottom: "1px solid #e5e7eb" }
          : { borderRadius: "0 0 12px 12px" }),
      }}>
        <div style={{ width: "100%", padding: isAuthenticated ? "0 16px 0 25px" : "0 12px", boxSizing: "border-box", maxWidth: isAuthenticated ? "none" : 1280, margin: isAuthenticated ? "0" : "0 auto" }}>
          <div className={isAuthenticated ? "bmp-bar" : "bmp-bar bmp-bar-pub"}>

            {/* ── LEFT ── */}
            <div style={{ display: "flex", alignItems: "center", gap: 20, minWidth: 0 }}>
              <Link to={RoutePath.PUBLIC_HOME} style={{ flexShrink: 0, display: "flex", alignItems: "center" }}>
                <img src={logo1} alt="Book My Parcel" className={isAuthenticated ? "bmp-logo-auth" : "bmp-logo"} style={{ display: "block" }} />
              </Link>

              {!isAuthenticated && (
                <>
                  {isMobile ? (
                    <div style={{ position: "relative" }}>
                      <button className="bmp-btn" onClick={() => setShowLocationModal(true)}
                        onMouseEnter={() => setTooltip("city")} onMouseLeave={() => setTooltip(null)} aria-label="Select city">
                        <MapPin />
                      </button>
                      {tooltip === "city" && <div className="bmp-tip">Select your city</div>}
                    </div>
                  ) : (
                    <button onClick={() => setShowLocationModal(true)} style={{
                      display: "flex", alignItems: "center", gap: 5,
                      height: 34, padding: "0 12px", fontSize: 12, fontWeight: 500, color: "#2563eb",
                      border: "1px solid #2563eb", borderRadius: 8,
                      background: "transparent", cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0,
                    }}>
                      <MapPin size={16} />
                      <span>{selectedCity}</span>
                      <ChevronDown size={16} />
                    </button>
                  )}
                </>
              )}
            </div>

            {/* ── RIGHT ── */}
            <div className="bmp-group">

              {/* ── AUTHENTICATED ── */}
              {isAuthenticated && (
                <>
                  {showTextButtons ? (
                    // ── Homepage: Send Parcel text + bell + user pill ──
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      {user?.activeRole === "INDIVIDUAL" && (
                        <button onClick={() => navigate(RoutePath.USER_REQUEST_FORM)} style={{
                          display: "flex", alignItems: "center", gap: 6,
                          height: 38, padding: "0 14px", fontSize: 13, borderRadius: 6,
                          background: "transparent", color: "#2563eb", border: "1px solid #2563eb",
                          cursor: "pointer", whiteSpace: "nowrap",
                        }}>
                          <Send size={13} /> Send Parcel
                        </button>
                      )}

                      {/* Bell */}
                      <div style={{ position: "relative" }}>
                        <button className="bmp-btn bmp-btn-bell" onClick={handleNotificationRedirect}
                          onMouseEnter={() => setTooltip("notif")} onMouseLeave={() => setTooltip(null)} aria-label="Notifications">
                          <Bell />
                          {unreadCount > 0 && <span className="bmp-badge">{unreadCount > 99 ? "99+" : unreadCount}</span>}
                        </button>
                        {tooltip === "notif" && <div className="bmp-tip">Notifications</div>}
                      </div>

                      {/* User pill */}
                      <UserMenuPill />
                    </div>
                  ) : (
                    // ── Dashboard: Send icon + bell + user pill ──
                    <>
                      {user?.activeRole === "INDIVIDUAL" && (
                        <div style={{ position: "relative" }}>
                          <button className="bmp-btn" onClick={() => navigate(RoutePath.USER_REQUEST_FORM)}
                            onMouseEnter={() => setTooltip("send")} onMouseLeave={() => setTooltip(null)} aria-label="Send Parcel">
                            <Send />
                          </button>
                          {tooltip === "send" && <div className="bmp-tip">Send Parcel</div>}
                        </div>
                      )}

                      {/* Bell */}
                      <div style={{ position: "relative" }}>
                        <button className="bmp-btn bmp-btn-bell" onClick={handleNotificationRedirect}
                          onMouseEnter={() => setTooltip("notif")} onMouseLeave={() => setTooltip(null)} aria-label="Notifications">
                          <Bell />
                          {unreadCount > 0 && <span className="bmp-badge">{unreadCount > 99 ? "99+" : unreadCount}</span>}
                        </button>
                        {tooltip === "notif" && <div className="bmp-tip">Notifications</div>}
                      </div>

                      {/* User pill */}
                      <UserMenuPill />
                    </>
                  )}
                </>
              )}

              {/* ── UNAUTHENTICATED ── */}
              {!isAuthenticated && (
                <>
                  {!isMobile && (
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <Link to={RoutePath.AUTH_TRAVELER_REGISTER} style={{
                        display: "flex", alignItems: "center", gap: 5,
                        height: 34, padding: "0 10px", fontSize: 12, borderRadius: 6,
                        textDecoration: "none", whiteSpace: "nowrap",
                        background: "transparent", color: "#2563eb", border: "1px solid #2563eb",
                      }}>
                        <Truck size={12} /> Join as Traveler
                      </Link>
                      <Link to={RoutePath.AUTH_LOGIN} style={{
                        display: "flex", alignItems: "center", gap: 5,
                        height: 34, padding: "0 10px", fontSize: 12, borderRadius: 6,
                        textDecoration: "none", whiteSpace: "nowrap",
                        background: "transparent", color: "#2563eb", border: "1px solid #2563eb",
                      }}>
                        <Send size={12} /> Send Parcel
                      </Link>
                      <Link to={RoutePath.AUTH_LOGIN} style={{
                        display: "flex", alignItems: "center", justifyContent: "center",
                        height: 34, padding: "0 10px", fontSize: 12, borderRadius: 6,
                        textDecoration: "none", whiteSpace: "nowrap",
                        background: "#2563eb", color: "#fff", border: "none",
                      }}>
                        Log in / Sign up
                      </Link>
                    </div>
                  )}

                  {isMobile && (
                    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      {[
                        { key: "traveler", Icon: Truck, label: "Join as Traveler", path: RoutePath.AUTH_TRAVELER_REGISTER },
                        { key: "send2",    Icon: Send,  label: "Send Parcel",      path: RoutePath.AUTH_LOGIN             },
                        { key: "login",    Icon: User,  label: "Log in",           path: RoutePath.AUTH_LOGIN             },
                      ].map(({ key, Icon, label, path }) => (
                        <div key={key} style={{ position: "relative" }}>
                          <button className="bmp-btn" onClick={() => navigate(path)}
                            onMouseEnter={() => setTooltip(key)} onMouseLeave={() => setTooltip(null)} aria-label={label}>
                            <Icon />
                          </button>
                          {tooltip === key && <div className="bmp-tip">{label}</div>}
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* ── Location Modal ── */}
        {showLocationModal && (
          <div style={{ position: "fixed", inset: 0, zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 12px" }}>
            <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.4)", backdropFilter: "blur(4px)" }} onClick={() => setShowLocationModal(false)} />
            <div style={{ position: "relative", background: "#eff6ff", width: "100%", maxWidth: 896, height: "85vh", borderRadius: 16, boxShadow: "0 20px 50px rgba(0,0,0,.2)", border: "1px solid #bfdbfe", zIndex: 10, display: "flex", flexDirection: "column" }}>
              <div style={{ padding: "20px 20px 14px" }}>
                <h2 style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 18, fontWeight: 600, color: "#1e40af", marginBottom: 6 }}>
                  <MapPin style={{ color: "#1d4ed8" }} /> Select Your Location <ChevronRight style={{ color: "#2563eb" }} />
                </h2>
                <p style={{ fontSize: 13, color: "#2563eb", marginBottom: 14 }}>Choose your city to find services near you</p>
                <div style={{ position: "relative" }}>
                  <Search style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: "#3b82f6", fontSize: 15 }} />
                  <input type="text" placeholder="Search your city..." style={{ width: "100%", padding: "9px 12px 9px 38px", fontSize: 13, border: "1px solid #93c5fd", borderRadius: 8, background: "#fff", outline: "none", boxSizing: "border-box" }} />
                </div>
              </div>
              <div style={{ flex: 1, padding: "0 20px 20px", overflowY: "auto" }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))", gap: 12 }}>
                  {["Delhi","Mumbai","Bangalore","Chennai","Pune","Hyderabad","Kolkata","Ahmedabad","Jaipur","Lucknow","Indore","Surat","Nagpur","Bhopal","Patna","Chandigarh","Visakhapatnam","Kanpur","Vadodara","Kochi","Coimbatore"].map((city) => {
                    const isSel = selectedCity === city;
                    return (
                      <div key={city} onClick={() => { setSelectedCity(city); setShowLocationModal(false); }}
                        style={{ position: "relative", borderRadius: 10, padding: "14px 8px", textAlign: "center", cursor: "pointer", background: isSel ? "#3b82f6" : "#fff", border: isSel ? "none" : "1px solid #bfdbfe", color: isSel ? "#fff" : "#1e40af", transform: isSel ? "scale(1.05)" : "scale(1)", transition: "all 0.2s" }}>
                        {isSel && (
                          <div style={{ position: "absolute", top: 5, right: 5, background: "#fff", borderRadius: "50%", padding: 2 }}>
                            <Check size={11} style={{ color: "#2563eb" }} />
                          </div>
                        )}
                        <div style={{ width: 40, height: 40, borderRadius: "50%", background: isSel ? "#60a5fa" : "#dbeafe", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 8px" }}>
                          <MapPin style={{ fontSize: 16, color: isSel ? "#fff" : "#2563eb" }} />
                        </div>
                        <p style={{ fontSize: 12, fontWeight: 500, margin: 0 }}>{city}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
};

export default Navbar;